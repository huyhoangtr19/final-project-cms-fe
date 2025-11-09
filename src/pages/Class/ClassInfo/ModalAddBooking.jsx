import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import styled from "styled-components";

import i18n from "../../../i18n";
import { listTypeClass } from "../../../constants/app.const";
import { toast } from "react-toastify";
import bookingService from "../../../services/booking.service";
import customerService from "../../../services/customer.service";
import MyDropdown from "../../../components/Common/MyDropdown";
import MyDropdownSearch from "../../../components/Common/MyDropdownSearch";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import { debounce } from "lodash";
import packageService from "../../../services/package.service";
import sourceService from "../../../services/source.service";
import classService from "../../../services/class.service";
import { convertMinutesToTimeString } from "../../../utils/app";
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
const ModalAddBooking = ({ bookingDetail, isOpen, onClose ,onAdd }) => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({
    customers: [],
    sources: [],
    listPackage: [],
    packages: [],
    times: [],
  });

  const getTypeClass = (type) => {
    const typeObj = listTypeClass.find((item) => item.value === type);
    return typeObj?.label ?? "";
  };
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      customer_id: "",
      source_id: "",
      location_id: bookingDetail?.location.id ?? "",
      package_id: "",
      staff_id: bookingDetail?.staff.id ?? "",
      class_schedule_time_id: bookingDetail?.id ?? "",
      sale_order_id: "",
      note: bookingDetail?.note ?? "",
      date: bookingDetail?.date
        ? moment(bookingDetail.date).format("yyyy-MM-DD")
        : "",
      // Field readonly
      class_id: bookingDetail?.class.id ?? "",
      end_date: "",
      class_type: getTypeClass(bookingDetail?.class?.type) ?? "",
      remaining_sessions: "",
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
  useEffect(()=>{
    console.log("validation errors",validation.errors);
  },[validation.errors])
  const handleSubmitForm = async (values) => {
    try {
      console.log('value',values)
      const response = await bookingService.createBooking(values);

      if (response.success) {
         
        toast.success('Add booking success');
        onAdd();
      }
    } catch (e) {
      console.log("eeerr", e);
      let errMessage = "Add Booking valid";
      if (e.message && e.message == "customer_booked") {
        errMessage = "Customer has already booked this class";
      }
      if (e.message && e.message == "booking_over") {
        errMessage = "Package over booking number";
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
  const handleSelectCustomer = async (customerId) => {
    validation.setValues({
      ...validation.values,
      customer_id: customerId,
    });
    await handleGetPackageForCustomer(customerId);
  };
  const getTimeSchedule = async (package_id,sale_order_id) => {
    try {
      const {
        class_id,
        staff_id,
        location_id,
        // package_id,
        // sale_order_id,
        date,
      } = validation.values;
      const params = {
        date: date,
        class: class_id,
        staff: staff_id,
        location: location_id,
        package: package_id,
        sale_order_id: sale_order_id,
      };
      const response = await classService.getListScheduleForStaffByClass(
        params.class,
        params.staff,
        params
      );

      if (response.success) {
        setData((prev) => ({
          ...prev,
          times:response.data.map((item) => {
            return {
              value: item.id,
              label: convertMinutesToTimeString(item.start_time),
            };
          })
        })); 
      }
    } catch (e) {
      console.log("e", e);
    }
  };

  const handleGetCustomerForOperator = async (params = {}) => {
    try {
      const response = await customerService.getListCustomerForOperator(params);
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.customer_id,
            label: `${item.c_id} - ${item.last_name} ${item.first_name} - ${item.phone}`,
          };
        });
      }
    } catch (e) {}
  };

  const getItemById = (data, id) => {
    const item = data.find((item) => item.id == id);
    return item;
  };

  const handleGetPackageForCustomer = async (customerId) => {
    try {
      //TODO: booking type 
      const response = await packageService.getListPackageForCustomer(
        customerId,{ booking_type: "1" }
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
    } catch (e) {}
  };
  const fetchData = async () => {
    try {
      const [customers, sources, times] = await Promise.all([
        handleGetCustomerForOperator({
          package_id: validation.values.package_id,
      class_id: validation.values.class_id,
      location: validation.values.location_id,
        }),
        handleGetSource(),
        // getTimeSchedule(),
      ]);

      setData((prev) => ({
        ...prev,
        customers: customers,
        sources: sources,
        times: times,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
    } catch (e) {}
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
    });
    // await handleGetLocationForPackage(packageId);
    await getTimeSchedule(packageId,packageSelected?.sale_order_id ?? "");
  };

  const handleSearchCustomer = debounce(async (e) => {
    const { package_id, location_id, class_id } = validation.values;
    const data = await handleGetCustomerForOperator({
      keyword: e,
      package_id: package_id,
      class_id: class_id,
      location: location_id,
    });
    if (data) {
      setData((prev) => ({
        ...prev,
        customers: data,
      }));
    }
  }, 300);

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

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Modal
      isOpen={isOpen}
      size="xl"
      autoFocus={true}
      centered
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
    >
      <div className="modal-content border-0">
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            setTouchedFields();
            await validation.validateForm();
            console.log('validation errors', validation.errors);
            console.log('values', validation.values);
            if (validation.isValid) {
              validation.handleSubmit();
            }
            return false;
          }}
        >
          <ModalHeader
            className="border-bottom-0 py-2 bg-light"
            toggle={() => {
              onClose();
            }}
          >
            {/* {i18n.t("add_new_booking")} */}
          </ModalHeader>
          <div className="p-2">
            <Row className="mt-3">
              <Col md={6}>
                <h5>{i18n.t("general_information")}</h5>
              </Col>
              <Col md={6} className="d-flex justify-content-end gap-4">
                <Button color="primary" type="submit">
                  {i18n.t("save")}
                </Button>
                <Button
                  color="success"
                  outline
                  className="px-3 btn-back"
                  onClick={onClose}
                >
                  {i18n.t("back")}
                </Button>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col md={6}>
                <Row>
                  <Col md={4}>
                    <Label for="source_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("source")} <p className="text-danger m-0">*</p>
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
                      disabled={false}
                      setSelected={(e) => {
                        validation.setFieldValue("source_id", e);
                      }}
                      invalid={
                        validation.errors.source && validation.touched.source_id
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
                      disabled={false}
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
                        {i18n.t("package")} <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <MyDropdown
                      id="package_id"
                      name="package_id"
                      placeholder={i18n.t("package")}
                      options={data.packages}
                      selected={validation.values.package_id}
                      setSelected={handleSelectPackage}
                      disabled={false}
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
                      options={[
                        {
                          value: bookingDetail.location.id,
                          label: bookingDetail.location.name,
                        },
                      ]}
                      selected={validation.values.location_id}
                      // setSelected={handleSelectLocation}
                      disabled={true}
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
                      options={[
                        {
                          value: bookingDetail.class.id,
                          label: bookingDetail.class.name,
                        },
                      ]}
                      selected={validation.values.class_id}
                      // setSelected={handleSelectClass}
                      disabled={true}
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
                        {i18n.t("trainer")} <p className="text-danger m-0">*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <MyDropdown
                      id="staff_id"
                      name="staff_id"
                      placeholder={i18n.t("trainer")}
                      options={[
                        {
                          value: bookingDetail.staff.id,
                          label: `${bookingDetail.staff.last_name} ${bookingDetail.staff.first_name}`,
                        },
                      ]}
                      selected={validation.values.staff_id}
                      // setSelected={handleSelectTrainer}
                      disabled={true}
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
                      type="date"
                      name="date"
                      id="date"
                      placeholder={i18n.t("date")}
                      onChange={(e) => {
                        validation.handleChange(e);
                        const date = e.target.value;
                        handleChangeDate(date);
                      }}
                      disabled={true}
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
                      isForm={true}
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
                      // setSelected={handleSelectTime}
                      disabled={true}
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
                      disabled={false}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
          </div>
          <ModalFooter className="bg-light py-2">
            {/* <div className="d-flex flex-row justify-content-end gap-3">
           

            <button
              className="btn btn-primary btn-block px-3 d-flex gap-1"
              type="submit"
              disabled={!isChanged && !isAdd}
              // onClick={handleSubmitForm}
            >
              <div className="">
                {isAdd ? i18n.t("save") : i18n.t("update")}
              </div>
            </button>
          </div> */}
          </ModalFooter>{" "}
        </Form>
      </div>
    </Modal>
  );
};

export default ModalAddBooking;
