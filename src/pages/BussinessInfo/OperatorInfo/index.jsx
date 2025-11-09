// Function Name : Operator Page
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

import Breadcrumb from "../../../components/Common/Breadcrumb";
import withRouter from "../../../components/Common/withRouter";
import { useAppSelector } from "../../../hook/store.hook";
import * as Yup from "yup";
import { useFormik } from "formik";
import styled from "styled-components"; // Make sure to install styled-components

import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Row,
  FormFeedback,
} from "reactstrap";
import operatorService from "../../../services/operator.service";
import { handleGetOperatorForAdmin } from "../../../utils/app";
import { toast } from "react-toastify";
import i18n from "../../../i18n";
import { useTranslation } from "react-i18next";
import InlineSelector from "../../../components/Common/InlineSelector";

const FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

const UploadButton = styled.div`
  // display: inline-block;
  // padding: 6px 12px;
  // cursor: pointer;
  // background-color: #f8f9fa;
  // border: 1px solid #ced4da;
  // border-radius: 4px;
  // font-size: 14px;
  // color: #495057;

  // &:hover {
  //   background-color: #e9ecef;
  // }

  svg {
    margin-right: 8px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const InvalidFeedback = styled.div`
  display: block;
  color: red;
  font-size: 10px;
  margin-top: 4px;
`;
const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  margin-top: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
`;
const DeleteButton = styled.div`
  margin-top: 10px;
`;

const OperatorInfo = (props) => {
  // document.title = "Operator Info | Actiwell System";
  const path = useLocation();
  const { t } = useTranslation();
  const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState([]);
  const [fileName, setFileName] = useState("");
  const operatorData = useMemo(() => {
    return {
      operatorName: operator?.name,
      email: operator?.email,
      address: operator?.address,
      phone: operator?.phone,
      operatorLogo: operator?.logo_path,
      representative: operator?.representative,
      position: operator?.position,
      pre_checkin: operator?.pre_checkin,
      late_checkin: operator?.late_checkin,
      tax_code: operator?.tax_code,
      mega_doc_user_name: operator?.mega_doc_user_name,
      mega_doc_password: operator?.mega_doc_password,
    };
  }, [operator]);
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: hasOperator
      ? operatorData
      : {
        operatorName: "",
        email: "",
        address: "",
        phone: "",
        operatorLogo: null,
        representative: "",
        position: "",
        pre_checkin: "",
        late_checkin: "",
        tax_code: "",
        mega_doc_user_name: "",
        mega_doc_password: "",
      },
    validationSchema: Yup.object({
      operatorName: Yup.string().required(t("operator_name_required")),
      email: Yup.string().nullable().email(i18n.t("invalid_email")),
      address: Yup.string().nullable(),
      phone: Yup.string()
        .nullable()
        .matches(/^[0-9]+$/, i18n.t("invalid_phone"))
        .max(10, i18n.t("phone_max_length")),
      representative: Yup.string().nullable(),
      position: Yup.string().nullable(),
      operatorLogo: Yup.mixed()
        .nullable()
        .test(
          "fileSize",
          i18n.t("exceeds_maximum_size"),
          (value) =>
            !value ||
            typeof value === "string" ||
            (value && value.size <= FILE_SIZE)
        )
        .test(
          "fileFormat",
          i18n.t("unsupported_file_format"),
          (value) =>
            !value ||
            typeof value === "string" ||
            (value && SUPPORTED_FORMATS.includes(value.type))
        ),
      pre_checkin: Yup.number().required(i18n.t("field_required")),
      late_checkin: Yup.number().required(i18n.t("field_required")),
    }),
    onSubmit: (values) => {
      handleSubmitForm(values);
    },
  });

  const handleSubmitForm = async (values) => {
    try {
      const formData = new FormData();
      if (props.type !== 'create') {
        formData.append("_method", 'PUT');
      }
      formData.append("name", validation.values.operatorName);
      formData.append("email", validation.values.email || "");
      formData.append("address", validation.values.address || "");
      formData.append("phone", validation.values.phone || "");
      formData.append("representative", validation.values.representative || "");
      formData.append("position", validation.values.position || "");
      formData.append("pre_checkin", validation.values.pre_checkin || "");
      formData.append("late_checkin", validation.values.late_checkin || "");
      formData.append("tax_code", validation.values.tax_code || "");
      formData.append("mega_doc_user_name", validation.values.mega_doc_user_name || "");
      formData.append("mega_doc_password", validation.values.mega_doc_password || "");

      if (validation.values?.operatorLogo !== null) {
        typeof validation.values?.operatorLogo === "string"
          ? formData.append("logo_path", validation.values?.operatorLogo || "")
          : formData.append(
            "logo",
            validation.values?.operatorLogo || "",
            validation.values.operatorLogo?.name
          );
      }

      const response = await operatorService.createOperatorForAdmin(formData);

      if (response.success) {
        if (props.type !== "create") {
          toast.success(i18n.t("update_infor_success"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        } else {
          handleGetOperatorForAdmin();
        }
      }
    } catch (e) {
      console.log("err", e);
      if (e.errors) {
        if (e.errors.logo) {
          validation.setErrors({ operatorLogo: e.errors.logo });
        } else {
          validation.setErrors(e.errors);
        }
      }
    } finally {
      validation.setSubmitting(false);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validation.setFieldValue("operatorLogo", file);
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

  const handleUpdateStatus = async () => {
    try {
      const response = await operatorService.updateStatusOperatorForAdmin(
        operator?.id,
        operator?.active === 1 ? 0 : 1
      );
      if (response.success) {
        toast.success(i18n.t("update_status_success"), {
          position: "top-right", // Position the notification at the top right
          autoClose: 5000,
          theme: "light", // Automatically close after 5 seconds
          hideProgressBar: true,
          // Remove the progress bar
        });
      }
    } catch (e) {
      console.log("error update status", e);
    } finally {
      handleGetOperatorForAdmin();
    }
  };

  const titleHead = useMemo(() => {
    switch (props.type) {
      case "create":
        return i18n.t("create_operator");
      case "edit":
        return "Edit Operator";
      case "detail":
        return "Operator Detail";
      default:
        return t("operator_information");
    }
  }, [props.type]);

  useEffect(() => {

    if (operator && operator?.logo_path) {
      setFileName(operator?.logo_path);
      setPreviewUrl(operator?.logo_path);
    }
  }, [operator]);
  useEffect(() => {
    handleGetOperatorForAdmin();
  }, []);
  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !==
      JSON.stringify(validation.initialValues)
    );
  }, [validation.values, validation.initialValues]);

  const canUpdateStatus = useMemo(() => {
    return permissionUser.includes("operator:update_status");
  }, [permissionUser])

  const canUpdateInfo = useMemo(() => {
    return permissionUser.includes("operator:update_info");
  }, [permissionUser])

  return (
    <React.Fragment>
      <div className="">
        <div>
          <Breadcrumb
            title={t("operator_information")}
            breadcrumbItem={titleHead}
          />
          <div className="page-container">
            {!hasOperator && props.type !== "create" ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <p>{i18n.t("operator_info_missing")}</p>
                <Link to="/settings?tab=4">
                  <button className="btn btn-primary btn-block align-self-center rounded-3">
                    {i18n.t("create_operator")}
                  </button>
                </Link>
              </div>
            ) : (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(validation.isValid);
                  if (validation.isValid) {
                    handleSubmitForm();
                  }
                  return false;
                }}
              >
                <div className="action-buttons mb-4">
                  <h5>{i18n.t("general_information")}</h5>
                  <div className="action-buttons">
                    {props.type === "create" ? (
                      <div className="action-buttons">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                        >
                          {i18n.t("save")}
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <div className="">
                          <InlineSelector
                            itemList={[{
                              id: 1,
                              label: i18n.t("active"),
                              onClick: () => { handleUpdateStatus() },
                              color: "success"
                            }, {
                              id: 2,
                              label: i18n.t("inactive"),
                              onClick: () => { handleUpdateStatus() },
                              color: "danger"
                            }]}
                            active={operator.active === 1 ? 1 : 2}
                          />
                        </div>
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                          style={{ display: canUpdateInfo ? "block" : "none" }}
                          disabled={!isChanged}
                        >
                          {i18n.t("update")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <Row>
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="operatorName">
                          <div className="d-flex flex-row gap-1">
                            {i18n.t("operator_name")}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="text"
                          name="operatorName"
                          id="operatorName"
                          placeholder={i18n.t("operator_name")}
                          required
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.operatorName || ""}
                          invalid={
                            validation.touched.operatorName &&
                            validation.errors.operatorName
                          }
                        />
                        {validation.touched.operatorName &&
                          validation.errors.operatorName && (
                            <FormFeedback>
                              {validation.errors.operatorName}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="email">{i18n.t("email")}</Label>
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
                          invalid={
                            validation.touched.email && validation.errors.email
                          }
                        />
                        {validation.touched.email &&
                          validation.errors.email && (
                            <FormFeedback>
                              {validation.errors.email}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="address">{i18n.t("address")}</Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="text"
                          name="address"
                          id="address"
                          innerRef={fileInputRef}
                          placeholder={i18n.t("address")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.address || ""}
                          invalid={
                            validation.touched.address &&
                            validation.errors.address
                          }
                        />
                        {validation.touched.address &&
                          validation.errors.address && (
                            <FormFeedback>
                              {validation.errors.address}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="phone">{i18n.t("phone")}</Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="tel"
                          name="phone"
                          id="phone"
                          placeholder={i18n.t("phone")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.phone || ""}
                          invalid={
                            validation.touched.phone && validation.errors.phone
                          }
                        />
                        {validation.touched.phone &&
                          validation.errors.phone && (
                            <FormFeedback>
                              {validation.errors.phone}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="mega_doc_user_name">{i18n.t("mega_doc_user_name")}</Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="text"
                          name="mega_doc_user_name"
                          id="mega_doc_user_name"
                          innerRef={fileInputRef}
                          placeholder={i18n.t("mega_doc_user_name")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.mega_doc_user_name || ""}
                          invalid={
                            validation.touched.mega_doc_user_name &&
                            validation.errors.mega_doc_user_name
                          }
                        />
                        {validation.touched.mega_doc_user_name &&
                          validation.errors.mega_doc_user_name && (
                            <FormFeedback>
                              {validation.errors.mega_doc_user_name}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="tax_code">{i18n.t("tax_code")}</Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="tel"
                          name="tax_code"
                          id="tax_code"
                          placeholder={i18n.t("tax_code")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.tax_code || ""}
                          invalid={
                            validation.touched.tax_code && validation.errors.tax_code
                          }
                        />
                        {validation.touched.tax_code &&
                          validation.errors.tax_code && (
                            <FormFeedback>
                              {validation.errors.tax_code}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="mega_doc_password">{i18n.t("mega_doc_password")}</Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="password"
                          name="mega_doc_password"
                          id="mega_doc_password"
                          innerRef={fileInputRef}
                          placeholder={i18n.t("mega_doc_password")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.mega_doc_password || ""}
                          invalid={
                            validation.touched.mega_doc_password &&
                            validation.errors.mega_doc_password
                          }
                        />
                        {validation.touched.mega_doc_password &&
                          validation.errors.mega_doc_password && (
                            <FormFeedback>
                              {validation.errors.mega_doc_password}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="operatorLogo">
                          {" "}
                          <div className="d-flex flex-row gap-1">
                            {i18n.t("operator_logo")}
                          </div>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <div>
                          <UploadButton
                            as="label"
                            htmlFor="operatorLogo"
                            className={"btn btn-primary " +
                              (validation.errors.operatorLogo ? "is-invalid" : "")
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-upload"
                              viewBox="0 0 16 16"
                            >
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                            </svg>
                            {i18n.t("click_to_upload")}
                          </UploadButton>
                          <HiddenFileInput
                            id="operatorLogo"
                            name="operatorLogo"
                            type="file"
                            onChange={handleFileChange}
                            // invalid={}
                            ref={fileInputRef}
                          />
                        </div>
                        <small className="form-text text-muted">
                          {i18n.t("supported_file_formats")}
                        </small>
                        {validation.errors.operatorLogo && (
                          <InvalidFeedback>
                            <p>
                              {fileName} {validation.errors.operatorLogo}
                            </p>
                          </InvalidFeedback>
                        )}
                        {previewUrl?.length > 0 && (
                          <div className="position-relative">
                            <ImagePreview src={previewUrl} alt="Logo preview" />
                            <DeleteButton
                              className="position-absolute z-1"
                              type="button"
                              style={{ cursor: "pointer", right: 10, top: 10 }}
                              onClick={() => {
                                validation.setFieldValue("operatorLogo", null);
                                setPreviewUrl(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                            >
                              <svg
                                width="24"
                                height="20"
                                viewBox="0 0 24 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9.625 4.87354H9.5C9.56875 4.87354 9.625 4.81729 9.625 4.74854V4.87354H14.375V4.74854C14.375 4.81729 14.4313 4.87354 14.5 4.87354H14.375V5.99854H15.5V4.74854C15.5 4.19697 15.0516 3.74854 14.5 3.74854H9.5C8.94844 3.74854 8.5 4.19697 8.5 4.74854V5.99854H9.625V4.87354ZM17.5 5.99854H6.5C6.22344 5.99854 6 6.22197 6 6.49854V6.99854C6 7.06729 6.05625 7.12354 6.125 7.12354H7.06875L7.45469 15.2954C7.47969 15.8282 7.92031 16.2485 8.45313 16.2485H15.5469C16.0813 16.2485 16.5203 15.8298 16.5453 15.2954L16.9313 7.12354H17.875C17.9438 7.12354 18 7.06729 18 6.99854V6.49854C18 6.22197 17.7766 5.99854 17.5 5.99854ZM15.4266 15.1235H8.57344L8.19531 7.12354H15.8047L15.4266 15.1235Z"
                                  fill="black"
                                  fillOpacity="0.45"
                                />
                              </svg>
                            </DeleteButton>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="representative">
                          {i18n.t("representative")}
                        </Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="text"
                          name="representative"
                          id="representative"
                          placeholder={i18n.t("representative")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.representative || ""}
                          invalid={
                            validation.touched.representative &&
                            validation.errors.representative
                          }
                        />
                        {validation.touched.representative &&
                          validation.errors.representative && (
                            <FormFeedback>
                              {validation.errors.representative}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                    <Row className="mt-4">
                      <Col md={4}>
                        <Label for="position">{i18n.t("position")}</Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="text"
                          name="position"
                          id="position"
                          placeholder={i18n.t("position")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.position || ""}
                          invalid={
                            validation.touched.position &&
                            validation.errors.position
                          }
                        />
                        {validation.touched.position &&
                          validation.errors.position && (
                            <FormFeedback>
                              {validation.errors.position}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <h5>{i18n.t("check_in_policy")}</h5>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="pre_checkin">
                          <div className="d-flex flex-row gap-1">
                            {i18n.t(
                              "maximum_time_allowed_before_class_start_time"
                            )}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="number"
                          name="pre_checkin"
                          id="pre_checkin"
                          placeholder=""
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.pre_checkin || ""}
                          invalid={
                            validation.touched.pre_checkin &&
                            validation.errors.pre_checkin
                          }
                        />
                        {validation.touched.pre_checkin &&
                          validation.errors.pre_checkin && (
                            <FormFeedback>
                              {validation.errors.pre_checkin}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={4}>
                        <Label for="late_checkin">
                          <div className="d-flex flex-row gap-1">
                            {i18n.t(
                              "maximum_time_allowed_after_class_start_time"
                            )}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="number"
                          name="late_checkin"
                          id="late_checkin"
                          placeholder=""
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.late_checkin || ""}
                          invalid={
                            validation.touched.late_checkin &&
                            validation.errors.late_checkin
                          }
                        />
                        {validation.touched.late_checkin &&
                          validation.errors.late_checkin && (
                            <FormFeedback>
                              {validation.errors.late_checkin}
                            </FormFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Form>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
OperatorInfo.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(OperatorInfo);
