// Function Name : Class Info
// Created date :  2/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh

import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, Input, Label, Row } from "reactstrap";
import * as Yup from "yup";
import MyDropdown from "../../../components/Common/MyDropdown";
import serviceService from "../../../services/service.service";
import styled from "styled-components";
import { listTypeClass } from "../../../constants/app.const";
import classService from "../../../services/class.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import i18n from "../../../i18n";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const FormClassDetail = (props) => {
  const { id, onAddNew, onClassName } = props;
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      service_id: "",
      note: "",
      type: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      service_id: Yup.string().required(i18n.t("service_required")),
      type: Yup.string().required("Type is required"),
      note: Yup.string().max(100, "Note is too long"),
    }),
  });
  const handleBack = () => {
    navigate("/class-info", { state: "class" });
  };
  const getListService = async () => {
    try {
      const res = await serviceService.getListServiceForOperator();
      if (res.success) {
        const resData = res.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setServices(resData);
      }
    } catch (e) { }
  };
  const handleGetClassDetail = async (id) => {
    try {
      const res = await classService.getDetailClass(id);
      if (res.success) {
        validation.setValues({
          name: res.data.name,
          service_id: res.data.service_id,
          note: res.data.note || "",
          type: res.data.type,
        });
        onClassName(res.data.name, res.data.service_id);
      }
    } catch (e) {
      console.log("err", e);
    }
  };

  const handleSubmitForm = async () => {
    try {
      const response =
        props.type === "create"
          ? await classService.createClass(validation.values)
          : await classService.updateClass(validation.values, id);
      if (response.success) {
        if (props.type === "create") {
          toast.success("Create class success");
          onAddNew(response.data.id);
        } else {
          toast.success("Update class success");
        }
      }
    } catch (e) {
      console.log("e", e);
      if (e.errors) {
        validation.setErrors(e.errors);
      }
    }
  };
  useEffect(() => {
    getListService();
  }, []);
  useEffect(() => {
    if (id && services.length) {
      handleGetClassDetail(id);
    }
  }, [id, services]);

  return (
    <Form
      className="mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (validation.isValid) {
          handleSubmitForm();
        }
        return false;
      }}
    >
      <div className="action-buttons">
        <h5>{i18n.t("general_info")}</h5>
        <div className="action-buttons mb-0">
          <Button
            color="success"
            className="btn-back"
            outline
            type="button"
            onClick={handleBack}
          >
            {i18n.t("back")}
          </Button>
          <button className="btn btn-primary btn-block px-2" type="submit">
            {i18n.t("save")}
          </button>
        </div>
      </div>
      <Row className="mt-4">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="service_id">
                <div className="d-flex flex-row gap-1">
                  {i18n.t('service')} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <MyDropdown
                id="service_id"
                name="service_id"
                placeholder="Service"
                options={services}
                displayEmpty={true}
                selected={validation.values.service_id}
                setSelected={(e) => {
                  validation.setFieldValue("service_id", e);
                }}
                invalid={validation.errors.service_id}
                onBlur={validation.handleBlur}
                isForm={true}
              />
              {validation.errors.service_id && (
                <InvalidFeedback>
                  {validation.errors.service_id}
                </InvalidFeedback>
              )}
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="first_name">
                <div className="d-flex flex-row gap-1">
                  {i18n.t("class_name")} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                className="form-input"
                type="text"
                name="name"
                id="name"
                placeholder={i18n.t("class_name")}
                required
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.name || ""}
                invalid={validation.touched.name && validation.errors.name}
              />
              {validation.touched.name && validation.errors.name && (
                <InvalidFeedback>{validation.errors.name}</InvalidFeedback>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="service_id">
                <div className="d-flex flex-row gap-1">
                  {i18n.t("class_type")} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <MyDropdown
                id="type"
                name="type"
                placeholder={i18n.t("class_type")}
                options={listTypeClass}
                displayEmpty={true}
                selected={validation.values.type}
                setSelected={(e) => {
                  validation.setFieldValue("type", e);
                }}
                invalid={validation.errors.type}
                onBlur={validation.handleBlur}
                isForm={true}
              />
              {validation.errors.type && (
                <InvalidFeedback>{validation.errors.type}</InvalidFeedback>
              )}
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="first_name">{i18n.t("note")}</Label>
            </Col>
            <Col md={8}>
              <Input
                type="textarea"
                name="note"
                id="note"
                placeholder={i18n.t("note")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.note || ""}
                invalid={validation.touched.note && validation.errors.note}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "4px",
                  color:
                    validation.values.note.length > 100 ? "#f46a6a" : "#74788D",
                }}
              >
                {validation.values.note.length}/100
              </div>
              {validation.touched.note && validation.errors.note && (
                <InvalidFeedback>{validation.errors.note}</InvalidFeedback>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  );
};
FormClassDetail.propTypes = {
  id: PropTypes.number,
  type: PropTypes.string,
  onAddNew: PropTypes.func,
  onClassName: PropTypes.func,
};
export default FormClassDetail;
