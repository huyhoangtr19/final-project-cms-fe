import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Button,
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
} from "reactstrap";
import Breadcrumb from "../../components/Common/Breadcrumb";
import MyDropdown from "../../components/Common/MyDropdown";
import PermissionPannel from "../../components/Common/PermissionPannel";
import operatorService from "../../services/operator.service";
import roleService from "../../services/role.service";
import appService from "../../services/app.service";
import departmentService from "../../services/department.service";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import userService from "../../services/user.service";
import { toast } from "react-toastify";
import i18n from "../../i18n";
import withRouter from "../../components/Common/withRouter";
import { useAppSelector } from "../../hook/store.hook";
import ModalDepartmentList from "../Settings/Department/ModalDepartmentList";

const UserDetail = (props) => {
  const { permissionUser } = useAppSelector((state) => state.auth);
  const { id } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [listLocation, setListLocation] = useState([]);
  const [listRole, setListRole] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [listPermissions, setListPermissions] = useState({});
  const [listDepartments, setListDepartments] = useState([]);
  const [isOpen, setIsOpen] = useState(false);


  const canUpdate = useMemo(() => permissionUser.includes("user:update_info"), [permissionUser]);

  const handleBack = () => {
    navigate("/settings?tab=0");
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: userInfo?.username || "",
      email: userInfo?.email || "",
      phone: userInfo?.phone || "",
      location_ids: userInfo?.location_ids || [],
      role_ids: userInfo?.role_ids || [],
      permission_ids: userInfo?.permission_ids || [],
      department_id: userInfo?.department_id || null,
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
      department_id: Yup.number().nullable(),
    }),
    role_ids: Yup.array().required("Role is required"),
    permission_ids: Yup.array().nullable(),
    onSubmit: (values) => {
      handleSubmitForm();
    },
  });

  const handleSubmitForm = async () => {
    try {
      const payload = {
        ...validation.values,
        redirect_url: `${window.location.origin}/reset-password`,
      };
      const response =
        props.type === "create"
          ? await userService.createNewUser(payload)
          : await userService.updateUser(id, payload);

      if (response.success) {
        toast.success(
          `${props.type === "create" ? "Create" : "Update"} user successfully`,
          {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
            hideProgressBar: true,
          }
        );
        props.router.navigate("/settings?tab=0");
      }
    } catch (e) {
      console.log(e);
      if (e.message === "Permission denied") {
        props.router.navigate("/settings?tab=0");
        toast.error("Permission denied", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }

      validation.setErrors(e.errors);
    }
  };

  const getDetailUserPermission = async (id) => {
    try {
      const response = await userService.getDetailUserPermissions(id);

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
          return { value: item.id, label: i18n.t(item.name) };
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
            return { value: item.id, label: i18n.t(item.name) };
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
  const getListPermissions = async () => {
    try {
      const response = await appService.getListPermissions();
      if (response.success) {
        setListPermissions(response.data);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const getListDepartments = async () => {
    try {
      const response = await departmentService.getListDepartments({ location_id: selectedLocations.map((el) => el.value) });
      if (response.success) {
        setListDepartments(response.data.map((el) => {
          return { value: el.id, label: el.name }
        }));
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
    validation.setFieldValue("department_id", null);
    setSelectedLocations(selectedOptions);
  };
  const handleChangeRole = (selectedOptions) => {
    validation.setFieldValue(
      "role_ids",
      selectedOptions.map((item) => item.value)
    );
    setSelectedRoles(selectedOptions);
  };
  const handleChangeAllPermission = (group) => {
    if (isCheckAllGroup(group)) {
      validation.setFieldValue(
        "permission_ids",
        validation.values.permission_ids.filter(
          (no) => !listPermissions[group].map((item) => item.id).includes(no)
        )
      );
    } else {
      validation.setFieldValue(
        "permission_ids",
        [
          ...validation.values.permission_ids,
          ...listPermissions[group].map((item) => item.id),
        ].filter((item, index, self) => self.indexOf(item) === index)
      );
    }
  };

  const handleChangePermissionItem = (id) => {
    validation.setFieldValue(
      "permission_ids",
      validation.values.permission_ids.includes(id)
        ? validation.values.permission_ids.filter((no) => no !== id)
        : [...validation.values.permission_ids, id]
    );
  };
  const isCheckAllGroup = (group) => {
    return listPermissions[group].every((permission) =>
      validation.values.permission_ids.includes(permission.id)
    );
  };
  const renameGroupToCarmalCase = (group) => {
    return group
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  //hook

  useEffect(() => {
    if (id) {
      getDetailUserPermission(id);
    }
  }, [id]);

  useEffect(() => {
    getListPermissions();
    handleGetListLocation();
    handleGetRole();
  }, []);

  useEffect(() => {
    getListDepartments();
  }, [selectedLocations])

  return (
    <React.Fragment>
      <div className="page-content">
        <Breadcrumb
          title={i18n.t("user_list")}
          breadcrumbItem={i18n.t("user_detail")}
        />
        <div className="page-container content-container">
          <Form
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
                <Button
                  color="success"
                  className="btn-back"
                  type="button"
                  outline
                  onClick={handleBack}
                >
                  {i18n.t("back")}
                </Button>
                <button
                  className="btn btn-primary btn-block"
                  type="submit"
                  disabled={!canUpdate}
                >
                  {props.type === "create"
                    ? i18n.t("save")
                    : i18n.t("update")}
                </button>
              </div>
            </div>
            <Row className="mt-4">
              <Col md={6}>
                <Row>
                  <Col md={4}>
                    <Label for="stage_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("user_name")}{" "}
                        <p style={{ color: "red" }}>*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      type="text"
                      name="username"
                      id="username"
                      placeholder={i18n.t("user_name")}
                      disabled={!canUpdate}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.username || ""}
                      invalid={
                        validation.touched.username &&
                        validation.errors.username
                      }
                    />
                    {validation.errors.username && (
                      <FormFeedback>
                        {validation.errors.username}
                      </FormFeedback>
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
                      disabled={!canUpdate}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.email || ""}
                      invalid={
                        validation.touched.email && validation.errors.email
                      }
                    />
                    {validation.errors.email && (
                      <FormFeedback>{validation.errors.email}</FormFeedback>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Label for="stage_id">
                      <div className="d-flex flex-row gap-1">
                        <p>{i18n.t("phone")}</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      type="phone"
                      name="phone"
                      id="phone"
                      placeholder={i18n.t("phone")}
                      disabled={!canUpdate}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.phone || ""}
                      invalid={
                        validation.touched.phone && validation.errors.phone
                      }
                    />
                    {validation.errors.phone && (
                      <FormFeedback>{validation.errors.phone}</FormFeedback>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Label for="department_id" style={{ cursor: "pointer" }}>
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("department")}
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    {/* <MyDropdown
                      name="department"
                      id="department_id"
                      placeholder={i18n.t("department")}
                      disabled={!canUpdate}
                      displayEmpty={true}
                      isForm={true}
                      selected={validation.values.department_id}
                      options={listDepartments}
                      setSelected={(e) => {
                        validation.setFieldValue("department_id", e);
                      }}
                      invalid={validation.touched.department_id && validation.errors.department_id}
                    />
                    {validation.touched.department_id && validation.errors.department_id && (
                      <FormFeedback>{validation.errors.department_id}</FormFeedback>
                    )} */}

                    <Input
                      id="department_id"
                      name="department_id"
                      type="text"
                      placeholder={i18n.t("department")}
                      style={{ cursor: "pointer", caretColor: "transparent" }}
                      value={listDepartments.find((el) => el.value === validation.values.department_id)?.label === undefined
                        ? i18n.t("no_department")
                        : listDepartments.find((el) => el.value === validation.values.department_id)?.label}
                      invalid={validation.errors.department_id}
                      onBlur={validation.handleBlur}
                      onClick={(e) => {
                        e.preventDefault()
                        setIsOpen(true)
                      }}
                    />
                    {validation.errors.department_id && (
                      <InvalidFeedback>
                        {validation.errors.department_id}
                      </InvalidFeedback>
                    )}
                  </Col>
                </Row>
              </Col>
              <Col md={6}>
                <Row className="mb-2">
                  <Col md={4}>
                    <Label for="stage_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("role")} <p style={{ color: "red" }}>*</p>
                      </div>
                    </Label>
                  </Col>
                  <Col md={8}>
                    <Select
                      isMulti
                      name="role_ids"
                      disabled={!canUpdate}
                      options={listRole}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      value={selectedRoles}
                      onChange={handleChangeRole}
                      placeholder={i18n.t('role')}
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
                      <FormFeedback>
                        {validation.errors.role_ids}
                      </FormFeedback>
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
                      disabled={!canUpdate}
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
                      <FormFeedback>
                        {validation.errors.location_ids}
                      </FormFeedback>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className="my-4">
              <Col md={6}>
                <h5>{i18n.t("user_permission")}</h5>
              </Col>
            </Row>
            <Row className="mt-1" style={{ marginBottom: "40px" }}>
              <div className="d-flex flex-column gap-4">
                <PermissionPannel
                  listPermissions={listPermissions}
                  disabled={!canUpdate}
                  validation={validation}
                />
              </div>
            </Row>
          </Form>

          <ModalDepartmentList
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            selectedLocation={validation.values.location_ids}
            isMultiLocations={false}
            displayEmpty={true}
            selected={validation.values.department_id}
            setSelectedDepartment={(e) => {
              validation.setFieldValue("department_id", e);
              setIsOpen(false);
            }}
          />
        </div>
      </div>
    </React.Fragment>
  );
};
UserDetail.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(UserDetail);
