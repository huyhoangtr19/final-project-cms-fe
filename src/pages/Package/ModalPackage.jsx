// Function Name : Modal Package
// Created date :  1/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import Select from "react-select";
import {
  Button,
  Col,
  Form,
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
import isEqual from 'lodash/isEqual';
import serviceService from "../../services/service.service";
import operatorService from "../../services/operator.service";
import styled from "styled-components";
import { toast } from "react-toastify";
import packageService from "../../services/package.service";
import MyDropdown from "../../components/Common/MyDropdown";
import { listKindPackage, listTypeBooking } from "../../constants/app.const";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import InputCurrency from "../../components/Common/InputCurrency";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;
const ModalPackage = ({
  isOpen,
  onClose,
  onAdd,
  isAdd,
  serviceInfo = null,
}) => {
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [listLocation, setListLocation] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [listServices, setListServices] = useState([]);
  const [valueDefault, setValueDefault] = useState(null);
  const [purchased, setPurchased] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [mode, setMode] = useState('base');
  const handleChangeLocation = (selectedOptions, { action }) => {
    const newArray = selectedOptions.map((item) => item.value);
    if (
      action === "remove-value" &&
      purchased &&
      !valueDefault.location_ids.every((item) => newArray.includes(item))
    ) {
      return null;
    }
    validation.setFieldValue(
      "location_ids",
      selectedOptions.map((item) => item.value)
    );
    setSelectedLocations(selectedOptions);
  };
  const handleChangeService = (selectedOptions, { action }) => {
    const newArray = selectedOptions.map((item) => item.value);
    if (
      action === "remove-value" &&
      purchased &&
      !valueDefault.service_ids.every((item) => newArray.includes(item))
    ) {
      return null;
    }
    validation.setFieldValue(
      "service_ids",
      selectedOptions.map((item) => item.value)
    );
    setSelectedServices(selectedOptions);
  };

  const title = useMemo(() => {
    return isAdd ? i18n.t("add_new_package") : i18n.t("package_detail");
  }, [isAdd]);

  const validation = useFormik({
    initialValues: {
      id_package: "",
      name: "",
      kind: null,
      months: null,
      sessions: null,
      price: 0,
      pre_booking_hours: null,
      cancellation_period_hours: null,
      booking_type: 1,
      location_ids: [],
      service_ids: [],
      default_free_on_hold_days: 0,
    },
    validationSchema: Yup.object({
      kind: Yup.number().required(i18n.t("kind_required")),
      name: Yup.string().required(i18n.t("name_required")),
      service_ids: Yup.array().min(1, i18n.t("service_required")),
      location_ids: Yup.array().min(1, i18n.t("location_required")),
      price: Yup.number().required(i18n.t("field_required")).min(0, i18n.t('invalid_number')),
      pre_booking_hours: Yup.number().required(i18n.t("field_required")).min(0, i18n.t('invalid_number')),
      cancellation_period_hours: Yup.number().required(i18n.t("field_required")).min(0, i18n.t('invalid_number')),
    }),
    onSubmit: (values) => {
      handleSubmitForm();
    },
  });
  const handleSubmitForm = async () => {
    try {
      const payload = {
        ...validation.values,
      };
      const response = isAdd
        ? await packageService.createPackages(payload)
        : await packageService.updatePackages(payload, serviceInfo.id);

      if (response.success) {
        onClose();
        onAdd();
        toast.success(
          isAdd
            ? i18n.t("create_package_success")
            : i18n.t("update_package_success"),
          {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
            hideProgressBar: true,
          }
        );
      }
    } catch (e) {
      console.log("Error", e);
      if (e.errors) {
        validation.setErrors(e.errors);
      }
      if (e.message === "package_purchased") {
        toast.error(i18n.t("package_purchased"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    }
  };

  const handleGetListLocation = async () => {
    try {
      const response = await operatorService.getListLocationForOperator();
      if (response.success) {
        setListLocation(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleGetListService = async () => {
    try {
      const response = await serviceService.getListServiceForOperator();
      if (response.success) {
        setListServices(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getDetailPackage = async (id) => {
    try {
      const response = await packageService.getDetailPackages(id);
      if (response.success) {
        setPurchased(response.data.purchased);
        setTotalAmount(response.data.price * response.data.sessions);
        validation.setValues({
          id_package: response.data.id,
          name: response.data.name,
          kind: response.data.kind,
          months: response.data.months,
          sessions: response.data.sessions,
          price: response.data.price,
          pre_booking_hours: response.data.pre_booking_hours,
          cancellation_period_hours: response.data.cancellation_period_hours,
          default_free_on_hold_days: response.data.default_free_on_hold_days,
          service_ids: response.data.services.map((item) => item.id),
          location_ids: response.data.locations.map((item) => item.id),
          booking_type: response.data.booking_type,
        });
        setValueDefault({
          id_package: response.data.id,
          name: response.data.name,
          kind: response.data.kind,
          months: response.data.months,
          sessions: response.data.sessions,
          price: response.data.price,
          pre_booking_hours: response.data.pre_booking_hours,
          cancellation_period_hours: response.data.cancellation_period_hours,
          default_free_on_hold_days: response.data.default_free_on_hold_days,
          service_ids: response.data.services.map((item) => item.id),
          location_ids: response.data.locations.map((item) => item.id),
          booking_type: response.data.booking_type,
        });
        const listSelect = [];
        response.data.locations.forEach((item) => {
          if (listIdLocation.includes(item.id)) {
            listSelect.push(
              listLocation.find((location) => location.value === item.id)
            );
          }
        });
        setSelectedLocations(listSelect);
        const listSelectSer = [];
        response.data.services.forEach((item) => {
          if (listIdService.includes(item.id)) {
            listSelectSer.push(
              listServices.find((ser) => ser.value === item.id)
            );
          }
        });
        setSelectedServices(listSelectSer);
      }
    } catch (e) {
      console.log("Error", e);
    }
  };

  const listIdLocation = useMemo(() => {
    return listLocation.map((item) => item.value);
  }, [listLocation]);
  const listIdService = useMemo(() => {
    return listServices.map((item) => item.value);
  }, [listServices]);


  const isChanged = useMemo(() => {
    return (
      !isEqual(validation.values, valueDefault) &&
      valueDefault !== null
    );
  }, [validation.values, valueDefault]);

  const canUpdateInfo = useMemo(() => {
    return permissionUser.includes("service:update_info");
  }, [permissionUser]);

  const listBookingTypeFilter = useMemo(() => {

    if (validation.values.kind === null) {
      return listTypeBooking;
    } else if (validation.values.kind === '1' || validation.values.kind === '0') {
      return [listTypeBooking[0]];
    } else if (validation.values.kind === '3') {
      return [listTypeBooking[1]];
    } else {
      return listTypeBooking;
    }
  }, [validation.values.kind]);


  const handleComputePrice = (value) => {
    if (mode === 'total') {
      setTotalAmount(value);
      validation.setFieldValue("price", value / (validation.values.kind !== 0 ? (validation.values.sessions || 1) : 1));
    } else {
      validation.setFieldValue("price", value);
      setTotalAmount(value * (validation.values.kind !== 0 ? (validation.values.sessions || 1) : 1));
    }
  }

  const handleSessionsChange = (value) => {
    if (mode === 'base') {
      validation.setFieldValue("sessions", value);
      setTotalAmount(validation.values.price * (validation.values.kind !== 0 ? (value || 1) : 1));
    } else {
      validation.setValues({
        ...validation.values,
        sessions: value,
        price: (totalAmount / (validation.values.kind !== 0 ? (value || 1) : 1))
      })
    }
  };

  useEffect(() => {
    const init = async () => {
      if (
        isOpen &&
        serviceInfo?.id &&
        listLocation.length &&
        listServices.length
      ) {
        await getDetailPackage(serviceInfo?.id);
      }
    };
    init();
  }, [isOpen, serviceInfo, listLocation, listServices]);
  useEffect(() => {
    handleGetListLocation();
    handleGetListService();
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
          onSubmit={(e) => {
            e.preventDefault();
            if (validation.isValid) {
              handleSubmitForm();
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
            {title}
          </ModalHeader>
          <div className="py-2">
            <div className="d-flex flex-column gap-3 p-3">
              <h5 className="text-start">{i18n.t("package_information")}</h5>
              <Row>
                <Col md={6}>
                  <Row>
                    <Col md={4} className="float-start">
                      <Label for="kind">
                        <div className="d-flex flex-row">
                          {i18n.t("package_kind")}{" "}
                          <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <MyDropdown
                        id="kind"
                        name="kind"
                        placeholder={i18n.t("package_kind")}
                        options={listKindPackage}
                        displayEmpty
                        selected={validation.values.kind}
                        setSelected={(e) => {
                          validation.setFieldValue("kind", e);
                          validation.setFieldValue("booking_type", null);
                        }}
                        invalid={
                          validation.errors.kind && validation.touched.kind
                        }
                        onBlur={validation.handleBlur}
                        isForm={true}
                      />
                      {validation.errors.kind && validation.touched.kind && (
                        <InvalidFeedback>
                          {validation.errors.kind}
                        </InvalidFeedback>
                      )}
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col md={4}>
                      <Label for="name">
                        <div className="d-flex flex-row">
                          {i18n.t("package_name")}{" "}
                          <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        invalid={
                          validation.errors.name && validation.touched.name
                        }
                        value={validation.values.name}
                        placeholder={i18n.t("package_name")}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                      />
                      {validation.touched.name && validation.errors.name && (
                        <InvalidFeedback>
                          {validation.errors.name}
                        </InvalidFeedback>
                      )}
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={4} className="float-start">
                      <Label for="booking_type">
                        <div className="d-flex flex-row">
                          {i18n.t("booking_type")}{" "}
                          <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <MyDropdown
                        id="booking_type"
                        name="booking_type"
                        placeholder={i18n.t("booking_type")}
                        options={listBookingTypeFilter}
                        displayEmpty
                        selected={validation.values.booking_type}
                        setSelected={(e) => {
                          validation.setFieldValue("booking_type", e);
                        }}
                        invalid={
                          validation.errors.booking_type && validation.touched.booking_type
                        }
                        onBlur={validation.handleBlur}
                        isForm={true}
                      />
                      {validation.errors.booking_type && validation.touched.booking_type && (
                        <InvalidFeedback>
                          {validation.errors.booking_type}
                        </InvalidFeedback>
                      )}
                    </Col>
                  </Row>
                </Col>

                <Col md={6}>
                  <Row>
                    <Col md={4} className="float-start">
                      <Label for="id_service">
                        <div className="d-flex flex-row">
                          {i18n.t("services")}
                          <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Select
                        isMulti
                        id="service_ids"
                        name="service_ids"
                        options={listServices}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={selectedServices}
                        onChange={handleChangeService}
                        noOptionsMessage={() => i18n.t("no_options")}
                        placeholder={i18n.t("services")}
                        styles={{
                          container: (provided) => ({
                            border: validation.errors.service_ids
                              ? "1px solid #f46a6a"
                              : "",
                            borderRadius: 4,
                          }),
                          indicatorsContainer: (prevStyle, state) =>
                            state.isMulti
                              ? {
                                ...prevStyle,
                                display: "none",
                              }
                              : null,
                        }}
                        onBlur={validation.handleBlur}
                      />
                      {validation.errors.service_ids && (
                        <InvalidFeedback>
                          {validation.errors.service_ids}
                        </InvalidFeedback>
                      )}
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col md={4}>
                      <Label for="location_ids">
                        <div className="d-flex flex-row">
                          {i18n.t("applied_location")}
                          <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Select
                        isMulti
                        id="location_ids"
                        name="location_ids"
                        options={listLocation}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={selectedLocations}
                        onChange={handleChangeLocation}
                        noOptionsMessage={() => i18n.t("no_options")}
                        placeholder={i18n.t("applied_location")}
                        styles={{
                          container: (provided) => ({
                            border: validation.errors.location_ids
                              ? "1px solid #f46a6a"
                              : "",
                            borderRadius: 4,
                          }),
                          indicatorsContainer: (prevStyle, state) =>
                            state.isMulti
                              ? {
                                ...prevStyle,
                                display: "none",
                              }
                              : null,
                        }}
                        onBlur={validation.handleBlur}
                      />
                      {validation.errors.location_ids && (
                        <InvalidFeedback>
                          {validation.errors.location_ids}
                        </InvalidFeedback>
                      )}
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={4}>
                      <Label for="months">{i18n.t("month_limit")}</Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        id="months"
                        name="months"
                        type="number"
                        invalid={
                          validation.errors.months && validation.touched.months
                        }
                        value={validation.values.months}
                        placeholder={i18n.t("month_limit")}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                      />
                      {validation.touched.months &&
                        validation.errors.months && (
                          <InvalidFeedback>
                            {validation.errors.months}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <h5 className="text-start">{i18n.t("package_pricing")}</h5>
              <Row>
                <Col md={6}>
                  <Row>
                    <Col md={4}>
                      <Label for="sessions">{i18n.t("sessions")}</Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        id="sessions"
                        name="sessions"
                        type="number"
                        invalid={
                          validation.errors.sessions &&
                          validation.touched.sessions
                        }
                        value={validation.values.sessions ?? 0}
                        placeholder={i18n.t("sessions")}
                        onChange={(e) => handleSessionsChange(e.target.value)}
                        onBlur={validation.handleBlur}
                      />
                      {validation.touched.sessions &&
                        validation.errors.sessions && (
                          <InvalidFeedback>
                            {validation.errors.sessions}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col md={4}>
                      <Label>
                        {i18n.t("pricing_reference")}

                      </Label>
                    </Col>
                    <Col md={8}>
                      <div className="d-flex flex-row gap-3">
                        <input
                          type="radio"
                          name="mode"
                          value="base"
                          id="base"
                          checked={mode === 'base'}
                          onClick={() => setMode('base')}
                          onChange={() => { }}
                          style={{ display: "none" }}
                        />
                        <label htmlFor="base" className={"checkbox-input " + (mode === 'base' ? "checkbox-input-checked" : "")}
                          style={{
                            margin: "0",
                            width: "100%"
                          }}
                        >
                          {i18n.t("base_price")}
                        </label>
                        <input
                          type="radio"
                          name="mode"
                          value="total"
                          id="total"
                          checked={mode === 'total'}
                          onClick={() => setMode('total')}
                          onChange={() => { }}
                          style={{ display: "none" }}
                        />
                        <label htmlFor="total" className={"checkbox-input " + (mode === 'total' ? "checkbox-input-checked" : "")}
                          style={{
                            margin: "0",
                            width: "100%"
                          }}
                        >
                          {i18n.t("total_amount")}
                        </label>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col md={6}>
                  <Row>
                    <Col md={4}>
                      <Label for="price">
                        <div className="d-flex flex-row">
                          {i18n.t("base_price")}
                          <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <InputCurrency
                        name="price"
                        value={validation.values.price}
                        onChange={(e) => handleComputePrice(e)}
                        onBlur={validation.handleBlur}
                        disabled={mode !== 'base'}
                      />
                      {validation.touched.price && validation.errors.price && (
                        <InvalidFeedback>
                          {validation.errors.price}
                        </InvalidFeedback>
                      )}
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={4}>
                      <Label for="total_amount">{i18n.t("total_amount")}</Label>
                    </Col>
                    <Col md={8}>
                      <InputCurrency
                        name="total_amount"
                        value={totalAmount}
                        onChange={(e) => handleComputePrice(e)}
                        onBlur={validation.handleBlur}
                        disabled={mode !== 'total'}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <h5 className="text-start mt-3">{i18n.t("general_policy")}</h5>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label for="pre_booking_hours">
                          <div className="d-flex flex-row">
                            {i18n.t("latest_pre_booking_hours")}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <InputGroup>
                          <Input
                            id="pre_booking_hours"
                            name="pre_booking_hours"
                            type="number"
                            invalid={
                              validation.errors.pre_booking_hours &&
                              validation.touched.pre_booking_hours
                            }
                            value={validation.values.pre_booking_hours}
                            placeholder=""
                            required
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                          />
                          <InputGroupText>{i18n.t("hours")}</InputGroupText>
                        </InputGroup>
                        {validation.touched.pre_booking_hours &&
                          validation.errors.pre_booking_hours && (
                            <InvalidFeedback>
                              {validation.errors.pre_booking_hours}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label for="pre_booking_hours">
                          <div className="d-flex flex-row">
                            {i18n.t("min_cancellation_period")}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <InputGroup>
                          <Input
                            id="cancellation_period_hours"
                            name="cancellation_period_hours"
                            type="number"
                            invalid={
                              validation.errors.cancellation_period_hours &&
                              validation.touched.cancellation_period_hours
                            }
                            value={validation.values.cancellation_period_hours}
                            placeholder=""
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                          />
                          <InputGroupText>{i18n.t("hours")}</InputGroupText>
                        </InputGroup>
                        {validation.touched.cancellation_period_hours &&
                          validation.errors.cancellation_period_hours && (
                            <InvalidFeedback>
                              {validation.errors.cancellation_period_hours}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label for="default_free_on_hold_days">
                          <div className="d-flex flex-row">
                            {i18n.t("free_on_hold_days")}
                          </div>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          id="default_free_on_hold_days"
                          name="default_free_on_hold_days"
                          type="number"
                          invalid={
                            validation.errors.default_free_on_hold_days &&
                            validation.touched.default_free_on_hold_days
                          }
                          required
                          value={validation.values.default_free_on_hold_days}
                          placeholder={i18n.t("free_on_hold_days")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                        {validation.touched.default_free_on_hold_days &&
                          validation.errors.default_free_on_hold_days && (
                            <InvalidFeedback>
                              {validation.errors.default_free_on_hold_days}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
              </Row>
            </div>
          </div>
          <ModalFooter className="bg-light py-2">
            <div className="d-flex flex-row justify-content-end gap-3">
              <Button
                color="success"
                outline
                className="px-3 btn-back"
                onClick={onClose}
              >
                {i18n.t("back")}
              </Button>

              <button
                className="btn btn-primary btn-block px-3 d-flex gap-1"
                type="submit"
                style={{ display: canUpdateInfo ? "block" : "none" }}
                disabled={!isChanged && !isAdd}
              // onClick={handleSubmitForm}
              >
                <div className="">
                  {isAdd ? i18n.t("save") : i18n.t("update")}
                </div>
              </button>
            </div>
          </ModalFooter>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalPackage;
