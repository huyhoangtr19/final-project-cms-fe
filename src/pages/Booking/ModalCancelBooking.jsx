// Function Name : Modal Cancel Booking
// Created date :  22/8/24             by :  VinhLQ
// Updated date :  22/8/24             by :  VinhLQ
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import styled from "styled-components";
import appService from "../../services/app.service";
import MyDropdown from "../../components/Common/MyDropdown";
import i18n from "../../i18n";
const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;
const ModalCancelBooking = ({
  isOpen,
  onClose,
  onSubmit,
  bookingInfo = null,
}) => {
  const [cancelTypes, setCancelTypes] = useState([]);
  const validation = useFormik({
    initialValues: {
      cancel_type_id: "",
      is_charge: 0,
      cancel_note: "",
      type_class: null,
    },
    validationSchema: Yup.object({
      cancel_type_id: Yup.string().required("Cancellation type is required"),
      is_charge: Yup.string().required("Cancellation fee is required"),
      cancel_note: Yup.string().required("Note is required"),
      type_class: Yup.string().required("Type class is required"),
    }),
    onSubmit: (values) => {
      handleSubmitForm();
    },
  });

  const handleSubmitForm = async () => {
    console.log("Form submitted with values:", validation.values);
    try {
      onSubmit(validation.values);
      onClose();
    } catch (e) {
      console.log("Error", e);
      if (e.errors) {
        validation.setErrors(e.errors);
      }
    }
  };
  useEffect(() => {
    console.log("Validation errors changed:", validation.errors);
  },[validation.errors])

  const getListCancelTypes = async () => {
    const response = await appService.getListCancelType();
    if (response.success) {
      setCancelTypes(
        response.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        })
      );
    }
  };

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
    getListCancelTypes();
    validation.setFieldValue("type_class", 1);
  }, [bookingInfo]);

  return (
    <Modal
      isOpen={isOpen}
      role="dialog"
      autoFocus={true}
      centered
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
      style={{ width: 600, padding: 10, margin: "auto", border: "none" }}
    >
      <div
        className="modal-content border-0"
        style={{ width: 600, right: 50, border: "none" }}
      >
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            setTouchedFields();
            await validation.validateForm();
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
            {i18n.t("cancel_booking")}
          </ModalHeader>
          <div className="py-2">
            <div className="d-flex flex-column gap-3 p-3">
              <Row>
                <Col md={3} className="float-start">
                  <Label>{i18n.t("booking_id")}</Label>
                </Col>
                <Col md={9}>
                  <Input
                    type="text"
                    disabled={true}
                    value={bookingInfo?.booking_number}
                    placeholder={i18n.t("booking_id")}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={3} className="float-start">
                  <Label for="customer">{i18n.t("customer")}</Label>
                </Col>
                <Col md={9}>
                  <Input
                    type="text"
                    disabled={true}
                    value={`${bookingInfo?.customer?.last_name} ${bookingInfo?.customer?.first_name}`}
                    placeholder={i18n.t("customer")}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Label for="cancel_type_id">
                    <div className="d-flex flex-row">
                      Cancellation type <p style={{ color: "red" }}>*</p>
                    </div>
                  </Label>
                </Col>
                <Col md={9}>
                  <MyDropdown
                    id="cancel_type_id"
                    name="cancel_type_id"
                    placeholder="Cancellation type"
                    options={cancelTypes}
                    selected={validation.values.cancel_type_id}
                    setSelected={(e) => {
                      validation.setFieldValue("cancel_type_id", e);
                    }}
                    invalid={
                      validation.errors.cancel_type_id &&
                      validation.touched.cancel_type_id
                    }
                    onBlur={validation.handleBlur}
                  />
                  {validation.errors.cancel_type_id &&
                    validation.touched.cancel_type_id && (
                      <InvalidFeedback>
                        {validation.errors.cancel_type_id}
                      </InvalidFeedback>
                    )}
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Label for={`is_charge`}>
                    <div className="d-flex flex-row">
                      Cancellation fee <p style={{ color: "red" }}>*</p>
                    </div>
                  </Label>
                </Col>
                <Col md={9}>
                  <Row>
                    <Col xl="6" sm="6" className="d-flex align-items-center">
                      <Input
                        type="radio"
                        value="0"
                        id="free"
                        name="is_charge"
                        className="form-check-input"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        defaultChecked
                      />
                      <Label
                        className="form-check-label font-size-13"
                        htmlFor="free"
                      >
                        <div className="ps-2">Free cancellation</div>
                      </Label>
                    </Col>
                    <Col xl="6" sm="6" className="d-flex align-items-center">
                      <Input
                        type="radio"
                        value="1"
                        id="none-refund"
                        name="is_charge"
                        className="form-check-input"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                      />
                      <Label
                        className="form-check-label font-size-13"
                        htmlFor={`none-refund`}
                      >
                        <div className="ps-2">Non-refundable</div>
                      </Label>
                    </Col>
                    <Col sm={12}>
                      {validation.errors.is_charge &&
                        validation.touched.is_charge && (
                          <InvalidFeedback>
                            {validation.errors.is_charge}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Label for="cancel_note">
                    <div className="d-flex flex-row">
                      {i18n.t("note")}
                      <p style={{ color: "red" }}>*</p>
                    </div>
                  </Label>
                </Col>
                <Col md={9}>
                  <Input
                    id="cancel_note"
                    name="cancel_note"
                    type="textarea"
                    invalid={
                      validation.errors.cancel_note &&
                      validation.touched.cancel_note
                    }
                    value={validation.values.cancel_note}
                    placeholder={i18n.t("note")}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                  />
                  {validation.touched.cancel_note &&
                    validation.errors.cancel_note && (
                      <InvalidFeedback>
                        {validation.errors.cancel_note}
                      </InvalidFeedback>
                    )}
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
                // onClick={handleSubmitForm}
              >
                <div className="">{i18n.t("save")}</div>
              </button>
            </div>
          </ModalFooter>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalCancelBooking;
