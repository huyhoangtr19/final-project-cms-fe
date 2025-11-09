// Function Name : Staff Profile
// Created date :  31/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import avatar from "../../assets/icon/circle-user-round.svg";
import * as Yup from "yup";
import { useFormik } from "formik";
import styled from "styled-components";

import { Button, Form, Input, Row, FormFeedback } from "reactstrap";

import { toast } from "react-toastify";
import MyDropdown from "../../components/Common/MyDropdown";
import { listGender, listTypeStaff } from "../../constants/app.const";
import moment from "moment/moment";
import staffService from "../../services/staff.service";
import operatorService from "../../services/operator.service";
import departmentService from "../../services/department.service";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import ModalDepartmentList from "../Settings/Department/ModalDepartmentList";

const UploadButton = styled.div`
  padding: 6px 6px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 60px;
  font-size: 14px;
  color: #495057;

  &:hover {
    background-color: #e9ecef;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;
const ImagePreview = styled.img`
  width: 120%;
  height: 100%;
  object-fit: cover;
`;

const StaffProfile = (props) => {
  const navigate = useNavigate();
  const { profile, onChangeTab, isAddProfile } = props;
  const { permissionUser } = useAppSelector((state) => state.auth);
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState([avatar]);
  const [fileName, setFileName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [listLocation, setListLocation] = useState([]);
  // const [listPosition, setListPosition] = useState([]);
  const [listDepartment, setListDepartment] = useState([]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      staff_id: profile?.id || "",
      location_id: profile?.location_id === 0 ? 0 : profile?.location_id || "",
      // position_id: profile?.position_id === 0 ? 0 : profile?.position_id || "",
      department_id: profile?.department_id || null,
      type: profile?.type === 0 ? 0 : profile?.type || "",
      address: profile?.address || "",
      first_name: profile?.first_name || "",
      email: profile?.email || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
      gender: profile?.gender === 0 ? 0 : profile?.gender || "",
      avatar: "",
      avatar_url: profile?.avatar_url || "",
      start_date: profile?.start_date
        ? moment(profile?.start_date).format("yyyy-MM-DD")
        : moment().format("YYYY-MM-DD"),
      end_date: profile?.end_date
        ? moment(profile?.end_date).format("yyyy-MM-DD")
        : moment().format("YYYY-MM-DD"),
      is_multi_location:
        profile?.is_multi_location === 0 ? 0 : profile?.is_multi_location || 1,
      is_trainer: profile?.is_trainer === 0 ? 0 : profile?.is_trainer || 1,
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required(i18n.t("field_required")),
      last_name: Yup.string().required(i18n.t("field_required")),
      email: Yup.string()
        .email(i18n.t("invalid_email"))
        .required(i18n.t("email_required")),
      phone: Yup.string()
        .matches(/^[0-9]+$/, i18n.t("invalid_phone"))
        .max(10, i18n.t("phone_max_length")),
      location_id: Yup.string().required(i18n.t("field_required")),
      start_date: Yup.string().required(i18n.t("field_required")),
      department_id: Yup.number().required().test(
        "is-valid-department-id",
        i18n.t("field_required"),
        function (value) {
          return listDepartment.map((el) => (el.value)).includes(value);
        }
      ),
      end_date: Yup.string()
        .required(i18n.t("field_required"))
        .test(
          "is-greater-than-start-date",
          i18n.t("end_date_must_be_greater_than_start"),
          function (value) {
            return (
              moment(value).isAfter(moment(validation.values.start_date)) ||
              moment(value).isAfter(moment())
            );
          }
        ),
    }),
    onSubmit: (values) => { },
  });

  const handleSubmitForm = async (isAvailability = false) => {
    try {
      const formData = new FormData();

      formData.append("start_date", validation.values.start_date || "");
      formData.append("end_date", validation.values.end_date || "");
      // formData.append("position_id", validation.values.position_id || "");
      formData.append("department_id", validation.values.department_id || "");
      formData.append("location_id", validation.values.location_id || "");
      formData.append("type", validation.values.type || "");
      formData.append("address", validation.values.address || "");
      formData.append("first_name", validation.values.first_name || "");
      formData.append("email", validation.values.email || "");
      formData.append("last_name", validation.values.last_name || "");
      formData.append("phone", validation.values.phone || "");
      formData.append("gender", validation.values.gender || "");
      formData.append("is_trainer", validation.values.is_trainer || 0);
      formData.append(
        "is_multi_location",
        validation.values.is_multi_location || 0
      );

      if (validation.values.avatar) {
        formData.append(
          "avatar",
          validation.values?.avatar || "",
          validation.values.avatar?.name
        );
      } else {
        formData.append("avatar", "");
      }
      if (props.type === "detail") {
        formData.append("_method", "PUT");
      }
      //TODO: check avatar is path image

      const response =
        props.type === "create"
          ? await staffService.createStaffProfile(formData)
          : await staffService.updateStaffProfile(formData, id);

      if (response.success) {
        if (props.type !== "create") {
          toast.success(i18n.t("update_staff_profile_success"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        } else {
          toast.success(i18n.t("create_staff_profile_success"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
          isAddProfile(response.data.id);
          //   props.router.navigate("/staff");
          if (isAvailability) {
            onChangeTab(response.data.id);
          }
        }
      }
    } catch (e) {
      console.log("err", e);
      if (e.errors) {
        validation.setErrors(e.errors);
      } else if (e.message === "Customer existed operator") {
        validation.setErrors({ email: "Customer existed operator" });
      } else if (e.message === "email_or_phone_already_exists_for_another_account") {
        toast.error(i18n.t("email_or_phone_already_exists_for_another_account"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } finally {
      validation.setSubmitting(false);
    }
  };
  const handleSaveAndAddAnother = () => {
    if (validation.isValid) {
      handleSubmitForm(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validation.setFieldValue("avatar", file);
      setFileName(file?.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName("");
      setPreviewUrl(null);
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
  // const handleGetListPosition = async () => {
  //   try {
  //     const response = await staffService.getListPosition();
  //     if (response.success) {
  //       setListPosition(
  //         response.data.map((item) => {
  //           return { value: item.id, label: item.name };
  //         })
  //       );
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };
  const handleGetListDepartment = async () => {
    try {
      const response = await departmentService.getListDepartments({
        location_id: validation.values.location_id,
        is_multilocation: validation.values.is_multi_location,
      });
      if (response.success) {
        setListDepartment(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          }).sort((a, b) => (a.value - b.value))
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleBack = () => {
    navigate("/staff");
  };

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !==
      JSON.stringify(validation.initialValues)
    );
  }, [validation.values, validation.initialValues]);
  const canAddService = useMemo(() => {
    return permissionUser.includes("staff:update_info");
  }, [permissionUser]);

  const handleCheckboxChange = (key, change) => {
    validation.setFieldValue(key, change === 1 ? 0 : 1);
  };
  useEffect(() => {
    if (profile?.avatar_url) {
      setPreviewUrl(profile.avatar_url);
    }
  }, [profile]);
  useEffect(() => {
    // handleGetListPosition();
    handleGetListLocation();
  }, []);
  useEffect(() => {
    handleGetListDepartment();
  }, [validation.values.location_id, validation.values.is_multi_location,]);

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        if (validation.isValid) {
          validation.handleSubmit();
          handleSubmitForm();
        }
        return false;
      }}
    >
      <div className="action-buttons">
        <h5>{i18n.t("staff_profile")}</h5>
        <div className="action-buttons mb-0">
          {props.type === "create" ? (
            <div className="action-buttons">
              <Button
                color="success"
                className="btn-back"
                outline
                type="button"
                onClick={handleBack}
              >
                {i18n.t("back")}
              </Button>
              <Button
                color="primary"
                outline
                type="button"
                onClick={handleSaveAndAddAnother}
              >
                {i18n.t("save_and_add_another")}
              </Button>
              <button className="btn btn-primary btn-block" type="submit">
                {i18n.t("save")}
              </button>
            </div>
          ) : (
            <div className="action-buttons">
              <Button
                color="success"
                className="btn-back"
                type="button"
                onClick={handleBack}
                outline
              >
                {i18n.t("back")}
              </Button>
              <button
                className="btn btn-primary btn-block"
                type="submit"
                style={{ display: canAddService ? "block" : "none" }}
                disabled={!isChanged}
              >
                {i18n.t("update")}
              </button>
            </div>
          )}
        </div>
      </div>
      <Row className="mt-2">
        <div className="d-flex justify-content-center align-items-center flex-column">
          <div className="position-relative">
            <div
              className="position-relative"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <ImagePreview src={previewUrl} alt="Logo preview" />
            </div>
            <div
              className="position-absolute"
              style={{
                bottom: -10,
                right: 0,
                zIndex: 1,
              }}
            >
              <UploadButton
                as="label"
                htmlFor="avatar"
                className={validation.errors.avatar ? "is-invalid" : ""}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 26 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.4668 7.13362H19.1015L18.7602 6.06695C18.5389 5.44106 18.1284 4.89949 17.5857 4.51726C17.0429 4.13502 16.3947 3.93106 15.7308 3.93362H10.2695C9.59915 3.93487 8.94612 4.14661 8.40258 4.53896C7.85904 4.9313 7.45244 5.48443 7.24016 6.12028L6.89883 7.18695H5.5335C4.6848 7.18695 3.87087 7.52409 3.27075 8.12421C2.67064 8.72433 2.3335 9.53826 2.3335 10.387V18.9203C2.3335 19.769 2.67064 20.5829 3.27075 21.183C3.87087 21.7831 4.6848 22.1203 5.5335 22.1203H20.4668C21.3155 22.1203 22.1295 21.7831 22.7296 21.183C23.3297 20.5829 23.6668 19.769 23.6668 18.9203V10.387C23.6739 9.96225 23.5964 9.5404 23.4387 9.14598C23.2811 8.75156 23.0465 8.39247 22.7486 8.08965C22.4508 7.78683 22.0956 7.54634 21.7039 7.3822C21.3121 7.21806 20.8916 7.13356 20.4668 7.13362ZM21.5335 18.867C21.5335 19.1498 21.4211 19.4212 21.2211 19.6212C21.021 19.8212 20.7497 19.9336 20.4668 19.9336H5.5335C5.2506 19.9336 4.97929 19.8212 4.77925 19.6212C4.57921 19.4212 4.46683 19.1498 4.46683 18.867V10.3336C4.46683 10.0507 4.57921 9.77941 4.77925 9.57937C4.97929 9.37933 5.2506 9.26695 5.5335 9.26695H7.66683C7.89943 9.27909 8.12962 9.21476 8.32223 9.08379C8.51483 8.95282 8.65928 8.7624 8.7335 8.54162L9.3095 6.79228C9.38105 6.58042 9.51739 6.39641 9.69922 6.26625C9.88106 6.13609 10.0992 6.06637 10.3228 6.06695H15.7842C16.0078 6.06637 16.2259 6.13609 16.4078 6.26625C16.5896 6.39641 16.7259 6.58042 16.7975 6.79228L17.3735 8.54162C17.4419 8.74508 17.5702 8.92315 17.7415 9.05256C17.9127 9.18197 18.1191 9.25669 18.3335 9.26695H20.4668C20.7497 9.26695 21.021 9.37933 21.2211 9.57937C21.4211 9.77941 21.5335 10.0507 21.5335 10.3336V18.867ZM13.0002 9.26695C12.1563 9.26695 11.3314 9.51719 10.6297 9.98601C9.92808 10.4548 9.38121 11.1212 9.05828 11.9008C8.73534 12.6805 8.65085 13.5383 8.81548 14.366C8.98011 15.1937 9.38647 15.9539 9.98317 16.5506C10.5799 17.1473 11.3401 17.5537 12.1678 17.7183C12.9954 17.8829 13.8533 17.7984 14.6329 17.4755C15.4126 17.1526 16.0789 16.6057 16.5478 15.904C17.0166 15.2024 17.2668 14.3775 17.2668 13.5336C17.2668 12.402 16.8173 11.3168 16.0172 10.5166C15.217 9.71647 14.1318 9.26695 13.0002 9.26695ZM13.0002 15.667C12.5782 15.667 12.1658 15.5418 11.8149 15.3074C11.4641 15.073 11.1907 14.7398 11.0292 14.35C10.8678 13.9602 10.8255 13.5312 10.9078 13.1174C10.9901 12.7036 11.1933 12.3235 11.4917 12.0251C11.79 11.7268 12.1701 11.5236 12.584 11.4413C12.9978 11.359 13.4267 11.4012 13.8166 11.5627C14.2064 11.7241 14.5395 11.9976 14.774 12.3484C15.0084 12.6992 15.1335 13.1117 15.1335 13.5336C15.1335 14.0994 14.9087 14.642 14.5087 15.0421C14.1086 15.4422 13.566 15.667 13.0002 15.667Z"
                    fill="black"
                  />
                </svg>
              </UploadButton>
              <HiddenFileInput
                id="avatar"
                name="avatar"
                type="file"
                onChange={handleFileChange}
                // invalid={}
                ref={fileInputRef}
              />
            </div>
          </div>
        </div>

        {validation.errors.avatar && (
          <InvalidFeedback>
            <p>
              {fileName} {validation.errors.avatar}
            </p>
          </InvalidFeedback>
        )}
      </Row>

      <div className="staff-row">
        <div className="staff-column">
          <div className="staff-detail-item">
            <div>
              <label className="staff-label" for="first_name">
                <div className="d-flex flex-row gap-1">
                  {i18n.t("first_name")} <p style={{ color: "red", margin: "0" }}>*</p>
                </div>
              </label>
            </div>
            <div>
              <Input
                className="form-input"
                type="text"
                name="first_name"
                id="first_name"
                placeholder={i18n.t("first_name")}
                required
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.first_name || ""}
                invalid={
                  validation.touched.first_name && validation.errors.first_name
                }
              />
              {validation.touched.first_name &&
                validation.errors.first_name && (
                  <FormFeedback>{validation.errors.first_name}</FormFeedback>
                )}
            </div>
          </div>

          <div className="staff-detail-item">
            <div>
              <label className="staff-label" for="last_name">
                <div className="d-flex flex-row gap-1">
                  {i18n.t("last_name")} <p style={{ color: "red", margin: "0" }}>*</p>
                </div>
              </label>
            </div>
            <div>
              <Input
                className="form-input"
                type="text"
                name="last_name"
                id="last_name"
                placeholder={i18n.t("last_name")}
                required
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.last_name || ""}
                invalid={
                  validation.touched.last_name && validation.errors.last_name
                }
              />
              {validation.touched.last_name && validation.errors.last_name && (
                <FormFeedback>{validation.errors.last_name}</FormFeedback>
              )}
            </div>
          </div>

          <div className="staff-detail-item">
            <div>
              <label className="staff-label" for="gender">{i18n.t("gender")}</label>
            </div>
            <div>
              <MyDropdown
                id="gender"
                name="gender"
                placeholder={i18n.t("gender")}
                options={listGender}
                selected={validation.values.gender}
                setSelected={(e) => {
                  validation.setFieldValue("gender", e);
                }}
                invalid={validation.errors.gender}
                onBlur={validation.handleBlur}
                isForm={true}
              />
              {validation.errors.gender && (
                <InvalidFeedback>{validation.errors.gender}</InvalidFeedback>
              )}
            </div>
          </div>

          <div className="staff-detail-item">
            <div>
              <label className="staff-label">{i18n.t("address")}</label>
            </div>
            <div>
              <Input
                className="input-form"
                type="text"
                name="address"
                id="address"
                placeholder={i18n.t("address")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.address || ""}
                invalid={
                  validation.touched.address && validation.errors.address
                }
              />
              {validation.touched.address && validation.errors.address && (
                <FormFeedback>{validation.errors.address}</FormFeedback>
              )}
            </div>
          </div>

          <div className="staff-detail-item">
            <div>
              <label className="staff-label" for="phone">{i18n.t("phone")}</label>
            </div>
            <div>
              <Input
                className="form-input"
                type="phone"
                name="phone"
                id="phone"
                placeholder={i18n.t("phone")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.phone || ""}
                invalid={validation.touched.phone && validation.errors.phone}
              />
              {validation.touched.phone && validation.errors.phone && (
                <FormFeedback>{validation.errors.phone}</FormFeedback>
              )}
            </div>
          </div>

          <div className="staff-detail-item">
            <div>
              <label className="staff-label" for="email">
                <div className="d-flex flex-row gap-1">
                  {i18n.t("email")} <p style={{ color: "red", margin: "0" }}>*</p>
                </div>
              </label>
            </div>
            <div>
              <Input
                className="form-input"
                type="text"
                name="email"
                id="email"
                placeholder={i18n.t("email")}
                onChange={validation.handleChange}
                required
                onBlur={validation.handleBlur}
                value={validation.values.email || ""}
                invalid={validation.touched.email && validation.errors.email}
              />
              {validation.touched.email && validation.errors.email && (
                <FormFeedback>{validation.errors.email}</FormFeedback>
              )}
            </div>
          </div>

        </div>


        <div className="staff-column">
          <div className="staff-detail-item">
            <div>
              <label className="staff-label" for="location_id">
                <div className="d-flex flex-row gap-1">
                  {i18n.t("location")} <p style={{ color: "red", margin: "0" }}>*</p>
                </div>
              </label>
            </div>
            <div>
              <MyDropdown
                id="location_id"
                name="location_id"
                placeholder={i18n.t("location")}
                options={listLocation}
                displayEmpty={true}
                selected={validation.values.location_id}
                setSelected={(e) => {
                  validation.setFieldValue("location_id", e);
                  validation.setFieldValue("department_id", null);
                }}
                invalid={validation.errors.location_id}
                onBlur={validation.handleBlur}
                isForm={true}
              />
              {validation.errors.location_id && (
                <InvalidFeedback>
                  {validation.errors.location_id}
                </InvalidFeedback>
              )}
            </div>
          </div>

          <div className="staff-detail-item-checkbox">
            <div className="staff-items-container">
              <div className="staff-trainer">
                <div
                  className="d-flex gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(
                      "is_trainer",
                      validation.values.is_trainer
                    );
                  }}
                >
                  <Input
                    type="checkbox"
                    checked={validation?.values?.is_trainer === 1}
                    onChange={() => { }}
                  />
                  <label className="staff-trainer-label">{i18n.t("as_a_trainer")}</label>
                </div>
              </div>
              <div className="staff-multiloc">
                <div
                  className="d-flex gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(
                      "is_multi_location",
                      validation.values.is_multi_location
                    );
                    if (validation.values.is_multi_location === 1)
                      validation.setFieldValue("department_id", null);
                  }}
                >
                  <Input
                    type="checkbox"
                    checked={validation.values.is_multi_location === 1}
                    onChange={() => { }}
                  />
                  <label className="staff-trainer-label">{i18n.t("working_at_multi_locations")}</label>
                </div>
              </div>
            </div>
          </div>

          <div className="staff-detail-item">
            {/* <div>
              <label className="staff-label" for="position_id">{i18n.t("position")}</label>
            </div>
            <div>
              <MyDropdown
                id="position_id"
                name="position_id"
                placeholder={i18n.t("position")}
                options={listPosition}
                displayEmpty={true}
                selected={validation.values.position_id}
                setSelected={(e) => {
                  validation.setFieldValue("position_id", e);
                }}
                invalid={validation.errors.position_id}
                onBlur={validation.handleBlur}
                isForm={true}
              />
              {validation.errors.position_id && (
                <InvalidFeedback>
                  {validation.errors.position_id}
                </InvalidFeedback>
              )}
            </div> */}
            <div>
              <label className="staff-label" for="department_id">
                <div className="d-flex flex-row gap-1">
                  {i18n.t("department")} <p style={{ color: "red", margin: "0" }}>*</p>
                </div>
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Input
                id="department_id"
                name="department_id"
                type="text"
                placeholder={i18n.t("department")}
                style={{ cursor: "pointer", caretColor: "transparent" }}
                value={listDepartment.find((el) => el.value === validation.values.department_id)?.label === undefined
                  ? i18n.t("department")
                  : listDepartment.find((el) => el.value === validation.values.department_id)?.label}
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
            </div>
          </div>

          <ModalDepartmentList
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            selectedLocation={[validation.values.location_id]}
            isMultiLocations={validation.values.is_multi_location}
            selected={validation.values.department_id}
            setSelectedDepartment={(e) => {
              validation.setFieldValue("department_id", e);
              setIsOpen(false);
            }}
          />



          <div className="staff-detail-item">
            <div>
              <label className="staff-label" for="type">{i18n.t("type")}</label>
            </div>
            <div>
              <MyDropdown
                id="type"
                name="type"
                placeholder={i18n.t("type")}
                options={listTypeStaff}
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
            </div>
          </div>

          <div className="staff-detail-item">
            <div>
              <label className="staff-label" for="start_date">
                <div className="d-flex flex-row gap-1">
                  {i18n.t("start_date_working")} <p style={{ color: "red", margin: "0" }}>*</p>
                </div>
              </label>
            </div>
            <div>
              <Input
                className="form-input"
                type="date"
                name="start_date"
                id="start_date"
                placeholder={i18n.t("start_date_working")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.start_date || ""}
                invalid={
                  validation.touched.start_date && validation.errors.start_date
                }
              />
              {validation.touched.start_date &&
                validation.errors.start_date && (
                  <FormFeedback>{validation.errors.start_date}</FormFeedback>
                )}
            </div>
          </div>

          <div className="staff-detail-item">
            <div>
              <label className="staff-label" for="end_date">
                <div className="d-flex flex-row gap-1">
                  {i18n.t("end_date_working")} <p style={{ color: "red", margin: "0" }}>*</p>
                </div>
              </label>
            </div>
            <div>
              <Input
                type="date"
                name="end_date"
                id="end_date"
                placeholder={i18n.t("end_date_working")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.end_date || ""}
                invalid={
                  validation.touched.end_date && validation.errors.end_date
                }
              />
              {validation.touched.end_date && validation.errors.end_date && (
                <FormFeedback>{validation.errors.end_date}</FormFeedback>
              )}
            </div>
          </div>

        </div>
      </div>

    </Form>
  );
};
StaffProfile.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
  onChangeTab: PropTypes.func,
  isAddProfile: PropTypes.func,
  profile: PropTypes.object,
};
export default StaffProfile;
