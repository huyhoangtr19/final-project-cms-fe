import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";
import * as Yup from "yup";
import userService from "../../services/user.service";
import operatorService from "../../services/operator.service";
import roleService from "../../services/role.service";
import Select from "react-select";
import i18n from "../../i18n";
import { toast } from "react-toastify";
import LanguageDropdown from "../../components/CommonForBoth/TopbarDropdown/LanguageDropdown";

const ProfileDetail = (props) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [listLocation, setListLocation] = useState([]);
  const [listRole, setListRole] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: userInfo?.username || "",
      email: userInfo?.email || "",
      phone: userInfo?.phone || "",
      location_ids: userInfo?.location_ids || [],
      role_ids: userInfo?.role_ids || [],
    },
    validationSchema: Yup.object({
      username: Yup.string().required(i18n.t("name_required")),

      email: Yup.string()
        .email(i18n.t("invalid_email"))
        .required(i18n.t("email_required")),
      phone: Yup.string()
        .matches(/^[0-9]+$/, i18n.t("invalid_phone"))
        .max(10, i18n.t("phone_max_length"))
        .nullable(),
      location_ids: Yup.array().required(i18n.t("location_required")),
    }),
    role_ids: Yup.array().required("Role is required"),

    onSubmit: (values) => {
      handleSubmitForm();
    },
  });
  // const handleBack = () => {

  // };

  const handleSubmitForm = async () => {
    try {
      const payload = {
        ...validation.values,
        redirect_url: `${window.location.origin}/reset-password`,
      };
      const response = await userService.updateUser(userInfo.id, payload);
      if (response.success) {
        // navigate("/users");
        toast.success(`Update user successfully`, {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getDetailUserPermission = async () => {
    try {
      const response = await userService.getProfileUser();
      if (response.success) {
        // setUserInfo();
        const responseData = {
          ...response.data,
          permission_ids: response.data.permissions.map((item) => item.id),
          location_ids: response.data.locations.map((item) => item.id),
          role_ids: response.data.roles.map((item) => item.id),
        };

        const listSelect = response.data.locations.map((item) => {
          return { value: item.id, label: item.name };
        });
        setSelectedLocations(listSelect);
        const listSelectSer = response.data.roles.map((item) => {
          return { value: item.id, label: item.name };
        });
        setSelectedRoles(listSelectSer);
        setUserInfo(responseData);
      }
    } catch (e) {
      console.log("e", e);
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
  const handleGetRole = async () => {
    try {
      const response = await roleService.getListRoles();
      if (response.success) {
        setListRole(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleChangeLocation = (selectedOptions) => {
    validation.setFieldValue(
      "location_ids",
      selectedOptions.map((item) => item.value)
    );
    setSelectedLocations(selectedOptions);
  };
  const handleChangeRole = (selectedOptions) => {
    validation.setFieldValue(
      "role_ids",
      selectedOptions.map((item) => item.value)
    );
    console.log("selectedOptions", selectedOptions);
    setSelectedRoles(selectedOptions);
  };
  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !==
      JSON.stringify(validation.initialValues)
    );
  }, [validation.values, validation.initialValues]);

  useEffect(() => {
    getDetailUserPermission();
    handleGetListLocation();
    handleGetRole();
  }, []);
  return (
    <>
      <div className="d-flex gap-4 mb-4">
        <h5>{i18n.t("language")}</h5>
        <LanguageDropdown />
      </div>

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
          <h5>{i18n.t("user_information")}</h5>
          <div className="action-buttons mb-0">
            {/* <Button
              color="secondary"
              className="px-4"
              type="button"
              outline
              onClick={handleBack}
            >
              Back
            </Button> */}
            <button
              className="btn btn-primary btn-block px-4"
              type="submit"
              disabled={!isChanged}
            >
              {i18n.t("update")}
            </button>
          </div>
        </div>
        <Row className="mt-4">
          <Col md={6}>
            <Row>
              <Col md={4}>
                <Label for="stage_id">
                  <div className="d-flex flex-row gap-1">
                    {i18n.t("user_name")} <p style={{ color: "red" }}>*</p>
                  </div>
                </Label>
              </Col>
              <Col md={8}>
                <Input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Name"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.username || ""}
                  invalid={
                    validation.touched.username && validation.errors.username
                  }
                />
                {validation.errors.username && (
                  <FormFeedback>{validation.errors.username}</FormFeedback>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Label for="stage_id">
                  <div className="d-flex flex-row gap-1">
                    {i18n.t("email")} <p style={{ color: "red" }}>*</p>
                  </div>
                </Label>
              </Col>
              <Col md={8}>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  placeholder={i18n.t("email")}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.email || ""}
                  invalid={validation.touched.email && validation.errors.email}
                />
                {validation.errors.email && (
                  <FormFeedback>{validation.errors.email}</FormFeedback>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Label for="stage_id">
                  <div className="d-flex flex-row gap-1">{i18n.t("phone")}</div>
                </Label>
              </Col>
              <Col md={8}>
                <Input
                  type="phone"
                  name="phone"
                  id="phone"
                  placeholder={i18n.t("phone")}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.phone || ""}
                  invalid={validation.touched.phone && validation.errors.phone}
                />
                {validation.errors.phone && (
                  <FormFeedback>{validation.errors.phone}</FormFeedback>
                )}
              </Col>
            </Row>
          </Col>
          <Col md={6}>
            <Row className="mb-2">
              <Col md={4}>
                <Label for="stage_id">
                  <div className="d-flex flex-row gap-1">
                    Role <p style={{ color: "red" }}>*</p>
                  </div>
                </Label>
              </Col>
              <Col md={8}>
                <Select
                  isMulti
                  name="role_ids"
                  options={listRole}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={selectedRoles}
                  onChange={handleChangeRole}
                  placeholder="Select roles..."
                  styles={{
                    container: (provided) => ({
                      border: validation.errors.role_ids
                        ? "1px solid #f46a6a"
                        : "",
                      borderRadius: 4,
                      minHeight: 80,
                    }),
                  }}
                />
                {validation.errors.role_ids && (
                  <FormFeedback>{validation.errors.role_ids}</FormFeedback>
                )}
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Label for="stage_id">
                  <div className="d-flex flex-row gap-1">
                    {i18n.t("location")} <p style={{ color: "red" }}>*</p>
                  </div>
                </Label>
              </Col>
              <Col md={8}>
                <Select
                  isMulti
                  name="location_ids"
                  options={listLocation}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={selectedLocations}
                  onChange={handleChangeLocation}
                  placeholder={i18n.t("select_location")}
                  styles={{
                    container: (provided) => ({
                      border: validation.errors.location_ids
                        ? "1px solid #f46a6a"
                        : "",
                      borderRadius: 4,
                    }),
                  }}
                />
                {validation.errors.location_ids && (
                  <FormFeedback>{validation.errors.location_ids}</FormFeedback>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
};
ProfileDetail.propTypes = {
  history: PropTypes.object,
};
export default ProfileDetail;
