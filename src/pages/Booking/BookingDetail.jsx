// Function Name : Booking Detail
// Created date :  6/8/24             by :  VinhLQ
// Updated date :                     by :  VinhLQ

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useParams, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import styled from "styled-components";

import { Button, Col, Form, Input, Label, Row } from "reactstrap";

import { toast } from "react-toastify";
import Breadcrumb from "../../components/Common/Breadcrumb";
import withRouter from "../../components/Common/withRouter";
import MyDropdown from "../../components/Common/MyDropdown";
import {
  STATUS_BOOKING,
  listStatusBooking,
  listTypeClass,
} from "../../constants/app.const";
import bookingService from "../../services/booking.service";
import customerService from "../../services/customer.service";
import staffService from "../../services/staff.service";
import packageService from "../../services/package.service";
import operatorService from "../../services/operator.service";
import moment from "moment/moment";
import sourceService from "../../services/source.service";
import classService from "../../services/class.service";
import ModalCancelBooking from "./ModalCancelBooking";
import MyDropdownSearch from "../../components/Common/MyDropdownSearch";
import { debounce } from "lodash";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const StatusDot = styled.span`
  height: 8px;
  width: 8px;
  background-color: ${(props) => props.color || "gray"};
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
`;

const BookingDetail = (props) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [bookingDetail, setBookingDetail] = useState(null);
  const [readonlyInput, setReadOnlyInput] = useState(false);
  const [isShowModalCancel, setIsShowModalCancel] = useState(false);
  const [packageDefault, setPackageDefault] = useState([]);
  const [data, setData] = useState({
    customers: [],
    sources: [],
    class: [],
    staffs: [],
    times: [],
    locations: [],
    products: [],
    listPackage: [],
    packages: [],
  });
  document.title = "Booking | Fitness CMS";
  const { permissionUser } = useAppSelector((state) => state.auth);
  const canCheckin = useMemo(() => {
    return permissionUser.includes("booking:checkin");
  }, [permissionUser]);
  const canUpdate = useMemo(() => {
    return permissionUser.includes("booking:update_info");
  }, [permissionUser]);
  const canCancel = useMemo(() => {
    return permissionUser.includes("booking:cancel");
  }, [permissionUser]);

  const getTypeClass = (type) => {
    const typeObj = listTypeClass.find((item) => item.value === type);
    return typeObj?.label ?? "";
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      customer_id: bookingDetail?.customer.id ?? "",
      source_id: bookingDetail?.source.id ?? "",
      location_id: bookingDetail?.location.id ?? "",
      package_id: bookingDetail?.package.id ?? "",
      staff_id: bookingDetail?.staff.id ?? "",
      class_schedule_time_id: bookingDetail?.schedule.id ?? "",
      sale_order_id: bookingDetail?.sale_order_id ?? "",
      note: bookingDetail?.note ?? "",
      date: bookingDetail?.schedule?.date
        ? moment(bookingDetail.schedule.date).format("yyyy-MM-DD")
        : "",
      // Field readonly
      class_id: bookingDetail?.class.id ?? "",
      end_date: bookingDetail?.end_date,
      class_type: getTypeClass(bookingDetail?.class?.type) ?? "",
      remaining_sessions: bookingDetail?.remaining_sessions,
    },
    validationSchema: Yup.object({
      customer_id: Yup.string().required(i18n.t("field_required")),
      source_id: Yup.string().required(i18n.t("field_required")),
      location_id: Yup.string().required(i18n.t("location_required")),
      package_id: Yup.string().required(i18n.t("field_required")),
      class_id: Yup.string().required(i18n.t("field_required")),
      staff_id: Yup.string().required(i18n.t("field_required")),
      class_schedule_time_id: Yup.string().required(i18n.t("field_required")),
      sale_order_id: Yup.string().required(i18n.t("field_required")),
      date: Yup.string()
        .required(i18n.t("field_required"))
        .test(
          "is-greater-than-start-date",
          i18n.t("date_must_be_greater_than_now_and_before_end_date"),
          function (value) {
            const { start_date, end_date } = this.parent;
            return (
              moment(value).isSameOrAfter(start_date) &&
              moment(value).isSameOrBefore(moment(end_date))
            );
          }
        ),
    }),
    onSubmit: (values) => {
      handleSubmitForm(values);
    },
  });

  const handleSubmitForm = async (values) => {
    try {
      const response =
        props.type === "create"
          ? await bookingService.createBooking(values)
          : await bookingService.updateBooking(values, id);

      if (response.success) {
        if (props.type !== "create") {
          toast.success("Update booking successfully", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        } else {
          props.router.navigate("/booking");
        }
      }
    } catch (e) {
      console.log("eeerr", e);
      let errMessage = "";
      if (e.message && e.message == "customer_booked") {
        errMessage = "Customer has already booked this class";
      }
      if (e.message && e.message == "booking_over") {
        errMessage = "Package over booking number";
      }
      if (e.message && e.message === "duplicate_time") {
        errMessage = i18n.t("duplicate_time");
      }
      if (e.errors) {
        validation.setErrors(e.errors);
      }
      toast.error(errMessage, {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        hideProgressBar: true,
      });
    } finally {
      validation.setSubmitting(false);
    }
  };

  const handleGetDetailBooking = async (idBooking) => {
    try {
      const response = await bookingService.getDetailBooking(idBooking);
      if (response.success) {
        const booking = response.data;
        console.log("booking detail", booking)
        setBookingDetail(booking);
        setPackageDefault(
          [response.data.package].map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          })
        );
        if (booking.status != STATUS_BOOKING.RESERVER) {
          setReadOnlyInput(true);
        }
        await Promise.all([
          handleGetLocationForPackage(booking.package.id),
          handleGetPackageForCustomer(booking.customer.id),
          handleGetClassForCustomer({
            location: booking.location.id,
            package: booking.package.id,
            customer: booking.customer.id,
          }),
          handleGetListTrainerForCustomer({
            location: booking.location.id,
            package: booking.package.id,
            class: booking.class.id,
            customer: booking.customer.id,
          }),
          handleChangeDate(moment(booking.schedule.date).format("yyyy-MM-DD"), {
            class: booking.class.id,
            staff: booking.staff.id,
            location: booking.location.id,
            package: booking.package.id,
            sale_order_id: booking.sale_order_id,
          }),
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGetCustomerForOperator = async (params = {}) => {
    try {
      const response = await customerService.getListCustomerForOperator({ ...params, booking_type: "1" });
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.customer_id,
            label: `${item.c_id} - ${item.last_name} ${item.first_name} - ${item.phone}`,
          };
        });
      }
    } catch (e) { }
  };

  const handleGetListTrainerForCustomer = async (payload = {}) => {
    try {
      const { location_id, package_id, class_id, customer_id } =
        validation.values;
      const params = {
        location: location_id,
        package: package_id,
        class: class_id,
        customer: customer_id,
        ...payload,
      };
      const response = await staffService.getListTrainerForCustomer(params);
      if (response.success) {
        setData((prev) => ({
          ...prev,
          staffs: response.data.map((item) => {
            return {
              value: item.id,
              label: `${item.last_name} ${item.first_name}`,
            };
          }),
        }));
      }
    } catch (e) { }
  };

  const handleGetPackageForCustomer = async (customerId) => {
    try {
      //TODO: boo
      const response = await packageService.getListPackageForCustomer(
        customerId, { booking_type: "1" }
      );
      if (response.success) {
        setData((prev) => ({
          ...prev,
          listPackage: response.data,
          packages: response.data.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          }),
        }));
      }
    } catch (e) { }
  };

  const handleGetLocationForPackage = async (packageId) => {
    try {
      const response = await operatorService.getListLocationForPackage(
        packageId
      );
      if (response.success) {
        setData((prev) => ({
          ...prev,
          locations: response.data.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          }),
        }));
      }
    } catch (e) { }
  };

  const handleGetClassForCustomer = async (payload) => {
    try {
      const { customer_id, package_id, location_id, staff_id } =
        validation.values;
      const params = {
        location: location_id,
        package: package_id,
        customer: customer_id,
        staff: staff_id,
        ...payload,
      };

      const response = await classService.getListClassForCustomer(params);
      if (response.success) {
        setData((prev) => ({
          ...prev,
          classList: response.data,
          class: response.data.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          }),
        }));
      }
    } catch (e) { }
  };

  const handleCancelBooking = async (data) => {
    const response = await bookingService.cancelBooking(data, id);
    if (response.success) {
      toast.success(`Cancel booking successfully`, {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        hideProgressBar: true,
      });
      setIsShowModalCancel(false);
      handleGetDetailBooking(id);
    }
  };

  const handleCheckInBooking = async (bookingId) => {
    try {
      if (!bookingId) return;
      const response = await bookingService.checkInBooking(bookingId);
      if (response.success) {
        toast.success("Check in booking successfully", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) { }
  };

  const handleSearchCustomer = debounce(async (e) => {
    const data = await handleGetCustomerForOperator({
      keyword: e,
    });
    if (data) {
      setData((prev) => ({
        ...prev,
        customers: data,
      }));
    }
  }, 300);

  const handleBack = () => {
    const callback = searchParams.get("callback");
    if (callback) {
      props.router.navigate(`/booking?tab=${callback}`);
      return;
    }
    props.router.navigate("/booking?tab=month");
  };

  const getItemById = (data, id) => {
    const item = data.find((item) => item.id == id);
    return item;
  };

  const titleHead = useMemo(() => {
    switch (props.type) {
      case "create":
        return i18n.t("add_new_booking");
      case "detail":
        return i18n.t("booking_detail");
      default:
        return i18n.t("booking_detail");
    }
  }, [props.type]);

  const setTouchedFields = () => {
    const touchedFields = {};
    Object.keys(validation.values).forEach((key) => {
      if (Array.isArray(validation.values[key])) {
        touchedFields[key] = validation.values[key].map((item) => {
          const subTouchedFields = {};
          Object.keys(item).forEach((subKey) => {
            subTouchedFields[subKey] = true;
          });
          return subTouchedFields;
        });
      } else {
        touchedFields[key] = true;
      }
    });
    validation.setTouched(touchedFields, true);
  };

  const handleGetSource = async () => {
    try {
      const response = await sourceService.getListSource();
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
      }
    } catch (e) { }
  };

  const handleSelectCustomer = async (customerId) => {
    validation.setValues({
      ...validation.values,
      customer_id: customerId,
      package_id: "",
      remaining_sessions: "",
      location_id: "",
      class_id: "",
      staff_id: "",
      class_schedule_time_id: "",
      class_type: "",
      end_date: "",
      sale_order_id: "",
      date: "",
    });
    await handleGetPackageForCustomer(customerId);
  };

  const handleSelectPackage = async (packageId) => {
    const packageSelected = getItemById(data.listPackage, packageId);

    let remainingSessions = packageSelected?.sessions ?? "";
    if (packageSelected?.sessions && packageSelected?.booking_count) {
      remainingSessions =
        packageSelected.sessions - packageSelected.booking_count;
    }
    validation.setValues({
      ...validation.values,
      package_id: packageId,
      remaining_sessions: remainingSessions,
      start_date: packageSelected?.start_date,
      end_date: packageSelected?.end_date,
      sale_order_id: packageSelected?.sale_order_id ?? "",
      location_id: "",
      class_id: "",
      staff_id: "",
      class_schedule_time_id: "",
      class_type: "",
      date: "",
    });
    await handleGetLocationForPackage(packageId);
  };

  const handleSelectLocation = async (locationId) => {
    validation.setValues({
      ...validation.values,
      location_id: locationId,
      class_id: "",
      staff_id: "",
      class_schedule_time_id: "",
      class_type: "",
    });

    await handleGetClassForCustomer({ location: locationId });
    await handleGetListTrainerForCustomer({ location: locationId });
  };

  const handleSelectClass = async (classId) => {
    const type = data.classList.find((item) => item.id == classId)?.type;
    validation.setValues({
      ...validation.values,
      class_id: classId,
      class_schedule_time_id: "",
      class_type: getTypeClass(type),
      date: "",
    });

    if (!validation.values.staff_id || !classId) {
      validation.setFieldValue("staff_id", "");
      await handleGetListTrainerForCustomer({ class: classId });
    }
  };

  const handleSelectTrainer = async (staffId) => {
    validation.setValues({
      ...validation.values,
      staff_id: staffId,
      class_schedule_time_id: "",
      date: "",
    });
    if (!validation.values.class_id || !staffId) {
      validation.setFieldValue("class_id", "");
      await handleGetClassForCustomer({ staff: staffId });
    }
  };

  const handleSelectTime = (timeId) => {
    validation.setFieldValue("class_schedule_time_id", timeId);
  };

  const handleChangeDate = async (date, payload = {}) => {
    const { class_id, staff_id, location_id, package_id, sale_order_id } =
      validation.values;
    const params = {
      date: date,
      class: class_id,
      staff: staff_id,
      location: location_id,
      package: package_id,
      sale_order_id: sale_order_id,
      ...payload,
    };
    if (!params.staff || date < moment().format("yyyy-MM-DD")) return;
    validation.setValues({
      ...validation.values,
      date: date,
      class_schedule_time_id: "",
    });
    console.log(params)
    const response = await classService.getListScheduleForStaffByClass(
      params.class,
      params.staff,
      params
    );

    if (response.success) {
      setData((prev) => ({
        ...prev,
        times: response.data.map((item) => {
          return {
            value: item.id,
            label: convertMinutesToTimeString(item.start_time),
          };
        }),
      }));
    }
  };

  const convertMinutesToTimeString = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const getStatus = () => {
    const statusObj = listStatusBooking.find(
      (item) => item.value === bookingDetail?.status
    );
    return statusObj;
  };

  const fetchData = async () => {
    try {
      const sources = await handleGetSource();
      setData((prev) => ({
        ...prev,
        sources: sources,
      }));

      const customers = await handleGetCustomerForOperator();
      setData((prev) => ({
        ...prev,
        customers: customers,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !==
      JSON.stringify(validation.initialValues)
    );
  }, [validation.values, validation.initialValues]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (id) {
      handleGetDetailBooking(id);
    }
  }, [id]);

  return (
    <React.Fragment>
      <div className={props.type === "create" ? "" : "page-content content-container"}>
        <Breadcrumb
          title={i18n.t("booking_list")}
          breadcrumbItem={titleHead}
        />
        {props.type != "create" && (
          <Row className="bg-white py-4 row-gap-4">
            <Col md={6}>
              <Row>
                <Col md={4}>{i18n.t("booking_id")}</Col>
                <Col md={8}>{bookingDetail?.booking_number}</Col>
              </Row>
            </Col>
            <Col md={6}>
              <Row>
                <Col md={4}>{i18n.t("create_date")}</Col>
                <Col md={8}>
                  {moment(bookingDetail?.created_at).format("DD/MM/yyyy")}
                </Col>
              </Row>
            </Col>
            <Col md={6}>
              <Row>
                <Col md={4}>{i18n.t("status")}</Col>
                <Col md={8}>
                  <StatusDot color={getStatus()?.color} />
                  {getStatus()?.label}
                </Col>
              </Row>
            </Col>
            <Col md={6}>
              <Row>
                <Col md={4}>{i18n.t("created_by")}</Col>
                <Col md={8}>
                  {bookingDetail?.creator?.username ?? i18n.t("customer")}
                </Col>
              </Row>
            </Col>
          </Row>
        )}
        <Row className="bg-white page-container">
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              setTouchedFields();
              await validation.validateForm();
              console.log(validation.errors);
              console.log(validation.values);
              if (validation.isValid) {
                validation.handleSubmit();
              }
              return false;
            }}
          >
            <Row>
              <Col md={6}>
                <h5>{i18n.t("general_information")}</h5>
              </Col>
              <Col md={6} className="d-flex justify-content-end gap-3">
                <Button
                  className="btn-back"
                  color="success"
                  type="button"
                  onClick={handleBack}
                  outline
                >
                  {i18n.t("back")}
                </Button>
                {!readonlyInput && props.type == "detail" && (
                  <Button
                    color="success"
                    outline={true}
                    style={{
                      display: canCheckin ? "block" : "none",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckInBooking(bookingDetail?.id);
                    }}
                  >
                    {i18n.t("check_in")}
                  </Button>
                )}
                {props.type != "create" && (
                  <Button
                    color="danger"
                    outline={true}
                    style={{
                      display: canCancel ? "block" : "none",
                    }}
                    disabled={readonlyInput}
                    onClick={() => setIsShowModalCancel(true)}
                  >
                    {i18n.t("cancel_booking")}
                  </Button>
                )}
                {props.type === "create" ? (
                  <Button color="primary" type="submit">
                    {i18n.t("save")}
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    type="submit"
                    style={{
                      display: canUpdate ? "block" : "none",
                    }}
                    disabled={readonlyInput || !isChanged}
                  >
                    {i18n.t("update")}
                  </Button>
                )}
              </Col>
            </Row>
            <Row className="mt-4">
              <Col md={6}>
                <Row>
                  <Col md={4}>
                    <Label for="source_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("source")}{" "}
                        <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <MyDropdown
                      id="source_id"
                      name="source_id"
                      placeholder={i18n.t("source")}
                      options={data.sources}
                      selected={validation.values.source_id}
                      disabled={readonlyInput}
                      setSelected={(e) => {
                        validation.setFieldValue("source_id", e);
                      }}
                      invalid={
                        validation.errors.source &&
                        validation.touched.source_id
                      }
                      onBlur={validation.handleBlur}
                      isForm={true}
                    />
                    {validation.errors.source_id &&
                      validation.touched.source_id && (
                        <InvalidFeedback>
                          {validation.errors.source_id}
                        </InvalidFeedback>
                      )}
                  </Col>
                </Row>
              </Col>
              <Col md={6}>
                <Row>
                  <Col md={4}>
                    <Label for="staff_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("remaining_sessions")}
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      className="form-input"
                      type="text"
                      name="remaining_sessions"
                      id="remaining_sessions"
                      disabled
                      placeholder={i18n.t("remaining_sessions")}
                      readOnly
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.remaining_sessions}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col md={6}>
                <Row>
                  <Col md={4}>
                    <Label for="customer_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("customer")}{" "}
                        <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <MyDropdownSearch
                      id="customer_id"
                      name="customer_id"
                      placeholder={i18n.t("customer")}
                      options={data.customers}
                      selected={validation.values.customer_id}
                      setSelected={handleSelectCustomer}
                      disabled={readonlyInput}
                      invalid={
                        validation.errors.customer_id &&
                        validation.touched.customer_id
                      }
                      onSearch={handleSearchCustomer}
                      onBlur={validation.handleBlur}
                    />
                    {validation.errors.customer_id &&
                      validation.touched.customer_id && (
                        <InvalidFeedback>
                          {validation.errors.customer_id}
                        </InvalidFeedback>
                      )}
                  </Col>
                </Row>
              </Col>
              <Col md={6}>
                <Row>
                  <Col md={4}>
                    <Label for="end_date">{i18n.t("end_date")}</Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      className="form-input"
                      type="text"
                      name="end_date"
                      id="end_date"
                      disabled
                      placeholder={i18n.t("end_date")}
                      readOnly
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={
                        validation.values.end_date
                          ? moment(validation.values.end_date).format(
                            "DD/MM/yyyy"
                          )
                          : ""
                      }
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col md={6}>
                <Row>
                  <Col md={4}>
                    <Label for="package_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("package")}{" "}
                        <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <MyDropdown
                      id="package_id"
                      name="package_id"
                      placeholder={i18n.t("package")}
                      options={
                        data.packages.length > 0
                          ? data.packages
                          : packageDefault
                      }
                      selected={validation.values.package_id}
                      setSelected={handleSelectPackage}
                      disabled={readonlyInput}
                      invalid={
                        validation.errors.package_id &&
                        validation.touched.package_id
                      }
                      onBlur={validation.handleBlur}
                      onFocus={() => {
                        if (!validation.values.customer_id) {
                          toast.warning("Please select customer", {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "light",
                            hideProgressBar: true,
                          });
                        }
                      }}
                      isForm={true}
                    />
                    {validation.errors.package_id &&
                      validation.touched.package_id && (
                        <InvalidFeedback>
                          {validation.errors.package_id}
                        </InvalidFeedback>
                      )}
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
            <Row className="mt-3">
              <Col md={6}>
                <h5>{i18n.t("class_information")}</h5>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Row className="mt-4">
                  <Col md={4}>
                    <Label for="location_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("location")}{" "}
                        <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <MyDropdown
                      id="location_id"
                      name="location_id"
                      placeholder={i18n.t("location")}
                      options={data.locations}
                      selected={validation.values.location_id}
                      setSelected={handleSelectLocation}
                      disabled={readonlyInput}
                      invalid={
                        validation.errors.location_id &&
                        validation.touched.location_id
                      }
                      onBlur={validation.handleBlur}
                      onFocus={() => {
                        if (!validation.values.package_id) {
                          toast.warning("Please select package", {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "light",
                            hideProgressBar: true,
                          });
                        }
                      }}
                      isForm={true}
                    />
                    {validation.errors.location_id &&
                      validation.touched.location_id && (
                        <InvalidFeedback>
                          {validation.errors.location_id}
                        </InvalidFeedback>
                      )}
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={4}>
                    <Label for="class_type">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("class_kind")}
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      className="form-input"
                      type="text"
                      name="class_type"
                      id="class_type"
                      disabled
                      placeholder={i18n.t("class_kind")}
                      readOnly
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.class_type}
                    />
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={4}>
                    <Label for="class_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("class_name")}{" "}
                        <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <MyDropdown
                      id="class_id"
                      name="class_id"
                      placeholder={i18n.t("class_name")}
                      options={data.class}
                      selected={validation.values.class_id}
                      setSelected={handleSelectClass}
                      disabled={readonlyInput}
                      displayEmpty={true}
                      invalid={
                        validation.errors.class_id &&
                        validation.touched.class_id
                      }
                      onBlur={validation.handleBlur}
                      onFocus={() => {
                        if (!validation.values.location_id) {
                          toast.warning("Please select location", {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "light",
                            hideProgressBar: true,
                          });
                        }
                      }}
                      isForm={true}
                    />
                    {validation.errors.class_id &&
                      validation.touched.class_id && (
                        <InvalidFeedback>
                          {validation.errors.class_id}
                        </InvalidFeedback>
                      )}
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={4}>
                    <Label for="staff_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("trainer")}{" "}
                        <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <MyDropdown
                      id="staff_id"
                      name="staff_id"
                      placeholder={i18n.t("trainer")}
                      options={data.staffs}
                      selected={validation.values.staff_id}
                      setSelected={handleSelectTrainer}
                      disabled={readonlyInput}
                      displayEmpty={true}
                      invalid={
                        validation.errors.staff_id &&
                        validation.touched.staff_id
                      }
                      onBlur={validation.handleBlur}
                      onFocus={() => {
                        if (!validation.values.location_id) {
                          toast.warning("Please select location", {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "light",
                            hideProgressBar: true,
                          });
                        }
                      }}
                      isForm={true}
                    />
                    {validation.errors.staff_id &&
                      validation.touched.staff_id && (
                        <InvalidFeedback>
                          {validation.errors.staff_id}
                        </InvalidFeedback>
                      )}
                  </Col>
                </Row>
              </Col>
              <Col md={6}>
                <Row className="mt-4">
                  <Col md={4}>
                    <Label for="date">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("date")}
                        <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      className="form-input"
                      type="date"
                      name="date"
                      id="date"
                      placeholder={i18n.t("date")}
                      onChange={(e) => {
                        validation.handleChange(e);
                        const date = e.target.value;
                        handleChangeDate(date);
                      }}
                      disabled={readonlyInput}
                      onBlur={validation.handleBlur}
                      value={validation.values.date}
                      invalid={
                        validation.errors.date && validation.touched.date
                      }
                      onFocus={() => {
                        if (!validation.values.staff_id) {
                          toast.warning("Please select trainer", {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "light",
                            hideProgressBar: true,
                          });
                        }
                      }}
                    />
                    {validation.errors.date && validation.touched.date && (
                      <InvalidFeedback>
                        {validation.errors.date}
                      </InvalidFeedback>
                    )}
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={4}>
                    <Label for="class_schedule_time_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("time")} <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <MyDropdown
                      id="class_schedule_time_id"
                      name="class_schedule_time_id"
                      placeholder={i18n.t("time")}
                      options={data.times}
                      selected={validation.values.class_schedule_time_id}
                      setSelected={handleSelectTime}
                      disabled={readonlyInput}
                      invalid={
                        validation.errors.class_schedule_time_id &&
                        validation.touched.class_schedule_time_id
                      }
                      onBlur={validation.handleBlur}
                      onFocus={() => {
                        if (!validation.values.date) {
                          toast.warning("Please select date", {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "light",
                            hideProgressBar: true,
                          });
                        }
                      }}
                      isForm={true}
                    />
                    {validation.errors.class_schedule_time_id &&
                      validation.touched.class_schedule_time_id && (
                        <InvalidFeedback>
                          {validation.errors.class_schedule_time_id}
                        </InvalidFeedback>
                      )}
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={4}>
                    <Label for="note">{i18n.t("note")}</Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      className="form-input"
                      id="note"
                      name="note"
                      type="textarea"
                      value={validation.values.note}
                      placeholder={i18n.t("note")}
                      disabled={readonlyInput}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
          </Form>
        </Row>

        {isShowModalCancel && (
          <ModalCancelBooking
            isOpen={isShowModalCancel}
            onSubmit={handleCancelBooking}
            onClose={() => setIsShowModalCancel(false)}
            bookingInfo={bookingDetail}
          />
        )}
      </div>
    </React.Fragment>
  );
};
BookingDetail.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(BookingDetail);
