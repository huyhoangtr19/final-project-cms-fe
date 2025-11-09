// Function Name : Customer Detail
// Created date :  30/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import avatar from "../../assets/icon/circle-user-round.svg";
import * as Yup from "yup";
import { useFormik } from "formik";
import styled from "styled-components";

import {
  Button,
  Form,
  Input,
  FormFeedback,
} from "reactstrap";

import { toast } from "react-toastify";
import Breadcrumb from "../../components/Common/Breadcrumb";
import withRouter from "../../components/Common/withRouter";
import MyDropdown from "../../components/Common/MyDropdown";
import MyDropdownSearch from "../../components/Common/MyDropdownSearch";
import {
  listGender,
  listLabelCustomer,
  listReferSource,
  listStatus,
} from "../../constants/app.const";
import customerService from "../../services/customer.service";
import moment from "moment/moment";
import i18n from "../../i18n";
import marketSegmentService from "../../services/market.segment.service";
import customerGroupService from "../../services/customer.group.service";
import { debounce } from "lodash";
import MyModalTemplate from "../../components/Common/MyModalTemplate";

const UploadButton = styled.div`
  //   display: inline-block;
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
  height: 100;
  object-fit: cover;
`;

const CustomerDetail = (props) => {
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState([avatar]);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [fileName, setFileName] = useState("");
  const [disableInvite, setDisableInvite] = useState(false);
  const [data, setData] = useState([]);
  const [customerGroup, setCustomerGroup] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  document.title = "Customer | Actiwell System";

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      invite: customerDetail?.invited || false,
      contactId: customerDetail?.id || "",
      dob: customerDetail?.dob
        ? moment(customerDetail.dob).format("yyyy-MM-DD")
        : "",
      stage_id: customerDetail?.stage_id ?? 0,
      address: customerDetail?.address || "",
      first_name: customerDetail?.first_name || "",
      email: customerDetail?.email || "",
      last_name: customerDetail?.last_name || "",
      phone: customerDetail?.phone || "",
      gender: customerDetail?.gender ?? "",
      avatar: "",
      avatar_url: customerDetail?.avatar_url || "",
      label: customerDetail?.label ?? 0,
      emergency_contact: customerDetail?.emergency_contact || "",
      fitness_experience: customerDetail?.fitness_experience || "",
      emergency_phone: customerDetail?.emergency_phone || "",
      note: customerDetail?.note || "",
      identity_number: customerDetail?.identity_number || "",
      external_identity_number: customerDetail?.external_identity_number || "",
      market_segment_id: customerDetail?.market_segment_id ?? "",
      customer_group_id: customerDetail?.customer_group_id ?? "",
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required(i18n.t("field_required")),
      last_name: Yup.string().required(i18n.t("field_required")),
      email: Yup.string().email(i18n.t("invalid_email")).nullable(),
      phone: Yup.string()
        .matches(/^[0-9]+$/, i18n.t("invalid_phone"))
        .max(10, i18n.t("phone_max_length"))
        .nullable(),
      emergency_phone: Yup.string()
        .matches(/^[0-9]+$/, i18n.t("invalid_phone"))
        .max(10, i18n.t("phone_max_length")),

      // gender: Yup.string().required(i18n.t("field_required")),
      stage_id: Yup.string().required(i18n.t("field_required")),
      label: Yup.string().required(i18n.t("field_required")),
      fitness_experience: Yup.number().nullable().notRequired(),
    }),
    onSubmit: (values) => {
      handleSubmitForm();
    },
  });

  const handleSubmitForm = async () => {
    try {
      const formData = new FormData();

      formData.append("invite", validation.values.invite ? 1 : 0 || 0);
      formData.append("dob", validation.values.dob || "");
      formData.append("stage_id", validation.values.stage_id || 0);
      formData.append("address", validation.values.address || "");
      formData.append("first_name", validation.values.first_name || "");
      formData.append("email", validation.values.email || "");
      formData.append("last_name", validation.values.last_name || "");
      formData.append("phone", validation.values.phone || "");
      formData.append("gender", validation.values.gender || "");
      formData.append("label", validation.values.label || 0);
      formData.append(
        "emergency_contact",
        validation.values.emergency_contact || ""
      );
      formData.append(
        "fitness_experience",
        validation.values.fitness_experience || ""
      );
      formData.append(
        "emergency_phone",
        validation.values.emergency_phone || ""
      );
      formData.append("note", validation.values.note || "");
      formData.append(
        "identity_number",
        validation.values.identity_number || ""
      );
      formData.append(
        "external_identity_number",
        validation.values.external_identity_number || ""
      );
      if (validation.values.market_segment_id === -1) {
        formData.append("market_segment_id", "");
      } else {
        formData.append("market_segment_id", validation.values.market_segment_id || "");
      }
      formData.append("customer_group_id", validation.values.customer_group_id || "");

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
      const response =
        props.type === "create"
          ? await customerService.createCustomer(formData)
          : await customerService.updateCustomer(formData, id);

      if (response.success) {
        if (props.type !== "create") {
          toast.success(i18n.t("update_customer_success"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        } else {
          // add_customer_success
          toast.success(i18n.t("add_customer_success"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        }
        if (props.modalOpen) {
          props.modalOpen(false);
          props.fetchDataCustomer();
          props.newCustomerSuccess(true);

        } else {
          props.router.navigate("/customer");
        }
      }
    } catch (e) {
      console.log("error: ", e);
      if (e.errors) {
        validation.setErrors(e.errors);
      } else if (e.message === "Customer existed operator") {
        validation.setErrors({ email: "Customer existed operator" });
      } else if (
        e.message === "email_or_phone_already_exists_for_another_account"
      ) {
        toast.error(
          i18n.t("email_or_phone_already_exists_for_another_account"),
          {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          }
        );
      }
    } finally {
      validation.setSubmitting(false);
    }
  };

  const handleGetDetailCustomer = async (idCus) => {
    try {
      const response = await customerService.getDetailCustomer(idCus);
      if (response.success) {
        const resData = {
          ...response.data,
          avatar: null,
        };
        setCustomerDetail(resData);
        //   setOldImages(response.data.images);
        if (response.data.avatar_url) {
          setPreviewUrl(response.data.avatar_url);
        }

        //   setLocationDetail(resData);
      }
    } catch (e) { }
  };
  const handleGetListCustomerGroup = async () => {
    try {
      const res = await customerGroupService.getListCustomerGroups();
      if (res.success) {
        setCustomerGroup(res.data.map((el) => {
          return {
            value: el.id,
            label: el.name,
          }
        }))
      }
    } catch (e) {

    }
  }
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
  const handleBack = () => {
    if (props.modalOpen) {
      props.modalOpen(false);
    } else {
      props.router.navigate("/customer");
    }
  };
  const fetchData = async () => {
    try {
      const listMarketSegment = await handleGetListMarketSegmentForOperator();

      setData(listMarketSegment);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const handleGetListMarketSegmentForOperator = async (keyword) => {
    try {
      const response = await marketSegmentService.getListMarketSegments({ keyword: keyword || null });
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          }
        }).sort((a, b) => (a.value - b.value));
      }
    } catch (e) {
      console.log("error:", e);
    }
  }

  const handleSearchSegment = debounce(async (e) => {
    const data = await handleGetListMarketSegmentForOperator(e);
    if (data) {
      setData(data);
    }
  }, 300);

  const handleResetPassword = async () => {
    try {
      const response = await toast.promise(
        customerService.resetPasswordDefauld(id),
        {
          pending: i18n.t("loading"),
          success: i18n.t("password_reset_successfully"),
          error: i18n.t("failed_to_reset_password")
        },
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          theme: "light",
        }
      );
    } catch (e) {
      console.log("error reset pasword", e);
    }
  }

  useEffect(() => {
    if (
      validation?.values?.stage_id !== "3" &&
      validation?.values?.stage_id !== 3 &&
      !customerDetail?.invited
    ) {
      validation.setFieldValue("invite", false);
      setDisableInvite(true);
    } else {
      setDisableInvite(false);
    }
  }, [validation?.values?.stage_id]);

  useEffect(() => {
    handleGetListCustomerGroup();
  }, []);

  const titleHead = useMemo(() => {
    switch (props.type) {
      case "create":
        return i18n.t("add_new_contact");
      case "detail":
        return "";
      default:
        return i18n.t("contact_detail");
    }
  }, [props.type]);
  const isChanged = useMemo(() => {
    const filter = [
      "address",
      "avatar",
      "avatar_url",
      "contactId",
      "dob",
      "email",
      "first_name",
      "gender",
      "last_name",
      "phone",
      "stage_id",
      "invite",
      "label",
      "emergency_contact",
      "fitness_experience",
      "emergency_phone",
      "note",
      "identity_number",
      "external_identity_number",
      "market_segment_id",
      "customer_group_id",
    ];
    const filteredObject1 = Object.keys(validation.values)
      .filter((key) => filter.includes(key))
      .reduce((acc, key) => ({ ...acc, [key]: validation.values[key] }), {});
    const filteredObject2 = Object.keys(validation.initialValues)
      .filter((key) => filter.includes(key))
      .reduce(
        (acc, key) => ({ ...acc, [key]: validation.initialValues[key] }),
        {}
      );
    return (
      JSON.stringify(filteredObject1) !== JSON.stringify(filteredObject2) ||
      customerDetail?.label === null
    );
  }, [validation.values, validation.initialValues]);
  const handeChangeValueOnlyAplhabet = (event, key) => {
    const vietnameseNameRegex = /^[a-zA-ZÀ-ỹ\s]*$/;
    if (vietnameseNameRegex.test(event.target.value)) {
      validation.setFieldValue(key, event.target.value);
    }
  };

  useEffect(() => {
    if (id) {
      handleGetDetailCustomer(id);
    }
    fetchData();
  }, [id]);
  const setTouchedFields = () => {
    try {
      let touchedFields = {};
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
    } catch (e) {
      console.log("toch", e);
    }
  };
  const ageCustomer = useMemo(() => {
    const today = new Date();
    const birthDay = new Date(validation.values.dob);
    let age = today.getFullYear() - birthDay.getFullYear();
    const m = today.getMonth() - birthDay.getMonth();
    if (m < 0 || (m === 0 && today.getDate() - birthDay.getDate())) {
      age--;
    }
    return Math.max(age || 0, 0);
  }, [validation.values.dob]);

  return (
    <React.Fragment>
      <div className={`${props.type === "create" && (props.modalOpen ? "" : "page-content ")}`}>
        <div>
          {props.type === "create" && (
            <Breadcrumb
              title={i18n.t("contact_list")}
              breadcrumbItem={titleHead}
            />
          )}
          <div className={"page-container " + (!props.type || props.type === "create" ? "content-container" : "")}>
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                setTouchedFields();
                await validation.validateForm();
                // console.log("validation.isValid", validation.errors);
                // console.log(
                //   "validation.touched.fitness_experience",
                //   validation.touched
                // );
                if (validation.isValid) {
                  validation.handleSubmit();
                }
                return false;
              }}
            >
              <div className="action-buttons">
                <div className="action-buttons mb-0">
                  {props.type === "create" ? (
                    <div className="action-buttons">
                      <div
                        className="btn btn-outline-secondary d-flex flex-row gap-2"
                        onClick={() => {
                          if (!disableInvite && !customerDetail?.invited) {
                            validation.setFieldValue("invite", !validation.values.invite);
                          } else if (disableInvite) {
                            toast.error(
                              i18n.t("error_message_invitation_checkbox"),
                              {
                                position: "top-right",
                                autoClose: 5000,
                                theme: "light",
                                hideProgressBar: true,
                              }
                            );
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <Input
                          type="checkbox"
                          checked={validation.values.invite}
                          onChange={() => { }}
                          className="input-checbox-button"
                        />
                        <div>{i18n.t("send_invitation")}</div>
                      </div>
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
                      >
                        {i18n.t("save")}
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button className="btn btn-delete-outline"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpen(true);
                        }}
                      >
                        {i18n.t("reset_password")}
                      </button>
                      <div
                        className="btn btn-outline-secondary d-flex flex-row gap-2"
                        onClick={() => {
                          if (!disableInvite && !customerDetail?.invited) {
                            validation.setFieldValue("invite", !validation.values.invite);
                          } else if (disableInvite) {
                            toast.error(
                              i18n.t("error_message_invitation_checkbox"),
                              {
                                position: "top-right",
                                autoClose: 5000,
                                theme: "light",
                                hideProgressBar: true,
                              }
                            );
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <Input
                          type="checkbox"
                          checked={validation.values.invite}
                          onChange={() => { }}
                          className="input-checbox-button"
                        />
                        <div>{i18n.t("send_invitation")}</div>
                      </div>
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
                        disabled={!isChanged}
                      >
                        {i18n.t("update")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-0">
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
              </div>
              <div className="customer-row">
                <div className="customer-column">

                  <div className="customer-detail-item-small">
                    <label className="customer-label" htmlFor="stage_id">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("stage")} <p style={{ color: "red", margin: "0" }}>*</p>
                      </div>
                    </label>
                    <MyDropdown
                      id="stage_id"
                      name="stage_id"
                      placeholder={i18n.t("stage")}
                      options={listStatus}
                      displayEmpty={true}
                      selected={validation.values.stage_id}
                      setSelected={(e) => {
                        validation.setFieldValue("stage_id", e);
                      }}
                      invalid={
                        validation.errors.stage_id &&
                        validation.touched.stage_id
                      }
                      onBlur={validation.handleBlur}
                      isForm={true}
                    />
                    {validation.errors.stage_id &&
                      validation.touched.stage_id && (
                        <InvalidFeedback>
                          {validation.errors.stage_id}
                        </InvalidFeedback>
                      )}
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="market_segment">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("market_segment")} <p style={{ color: "red", margin: "0" }}>*</p>
                      </div>
                    </label>
                    <MyDropdownSearch
                      id="market_segment"
                      name="market_segment"
                      placeholder={"Uncategorized"}
                      options={data}
                      selected={validation.values.market_segment_id}
                      setSelected={(e) => {
                        console.log('selected ', e);
                        validation.setFieldValue("market_segment_id", e);
                      }}
                      invalid={
                        validation.touched.market_segment_id &&
                        validation.errors.market_segment_id
                      }
                      onSearch={handleSearchSegment}
                      onBlur={validation.handleBlur}
                    />
                    {validation.touched.market_segment_id &&
                      validation.errors.market_segment_id && (
                        <p
                          style={{ color: "red", margin: 0 }}
                        >{validation.errors.market_segment_id}</p>
                      )}
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="customer_group">
                      {i18n.t("customer_group")}
                    </label>
                    <MyDropdown
                      id="customer_group"
                      name="customer_group"
                      placeholder={i18n.t("customer_group")}
                      options={customerGroup}
                      displayEmpty={true}
                      isForm={true}
                      selected={validation.values.customer_group_id}
                      setSelected={(e) => {
                        validation.setFieldValue("customer_group_id", e);
                      }}
                      invalid={
                        validation.touched.customer_group_id &&
                        validation.errors.customer_group_id
                      }
                      onSearch={handleSearchSegment}
                      onBlur={validation.handleBlur}
                    />
                    {validation.touched.customer_group_id &&
                      validation.errors.customer_group_id && (
                        <p
                          style={{ color: "red", margin: 0 }}
                        >{validation.errors.customer_group_id}</p>
                      )}
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="first_name">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("first_name")}{" "}
                        <p style={{ color: "red", margin: "0" }}>*</p>
                      </div>
                    </label>
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
                        validation.touched.first_name &&
                        validation.errors.first_name
                      }
                    />
                    {validation.touched.first_name &&
                      validation.errors.first_name && (
                        <FormFeedback>
                          {validation.errors.first_name}
                        </FormFeedback>
                      )}
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="last_name">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("last_name")}{" "}
                        <p style={{ color: "red", margin: "0" }}>*</p>
                      </div>
                    </label>
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
                        validation.touched.last_name &&
                        validation.errors.last_name
                      }
                    />
                    {validation.touched.last_name &&
                      validation.errors.last_name && (
                        <FormFeedback>
                          {validation.errors.last_name}
                        </FormFeedback>
                      )}
                  </div>
                  <div className="customer-detail-item-small">
                    <label className="customer-label" htmlFor="gender">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("gender")}
                      </div>
                    </label>
                    <MyDropdown
                      id="gender"
                      name="gender"
                      placeholder={i18n.t("gender")}
                      options={listGender}
                      selected={validation.values.gender}
                      setSelected={(e) => {
                        validation.setFieldValue("gender", e);
                      }}
                      invalid={
                        validation.errors.gender && validation.touched.gender
                      }
                      onBlur={validation.handleBlur}
                      isForm={true}
                    />
                    {validation.errors.gender &&
                      validation.touched.gender && (
                        <InvalidFeedback>
                          {validation.errors.gender}
                        </InvalidFeedback>
                      )}
                  </div>
                  <div className="customer-detail-item-small">
                    <label className="customer-label" htmlFor="label">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("label")} <p style={{ color: "red", margin: "0" }}>*</p>
                      </div>
                    </label>
                    <MyDropdown
                      id="label"
                      name="label"
                      placeholder={i18n.t("label")}
                      options={listLabelCustomer}
                      selected={validation.values.label}
                      setSelected={(e) => {
                        validation.setFieldValue("label", e);
                      }}
                      invalid={
                        validation.errors.label && validation.touched.label
                      }
                      onBlur={validation.handleBlur}
                      isForm={true}
                    />
                    {validation.errors.label && validation.touched.label && (
                      <InvalidFeedback>
                        {validation.errors.label}
                      </InvalidFeedback>
                    )}
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="external_identity_number">
                      {i18n.t("external_identity_number")}
                    </label>
                    <Input
                      className="form-input"
                      id="external_identity_number"
                      name="external_identity_number"
                      type="text"
                      value={validation.values.external_identity_number}
                      placeholder={i18n.t("external_identity_number")}
                      // disabled={readonlyInput}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    />
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="fitness_experience">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("gym_experience")}
                      </div>
                    </label>
                    <Input
                      className="form-input"
                      type="text"
                      name="fitness_experience"
                      id="fitness_experience"
                      placeholder={i18n.t("gym_experience")}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.fitness_experience || ""}
                      invalid={
                        validation.touched.fitness_experience &&
                        validation.errors.fitness_experience
                      }
                    />
                    {validation.touched.fitness_experience &&
                      validation.errors.fitness_experience && (
                        <FormFeedback>
                          {validation.errors.fitness_experience}
                        </FormFeedback>
                      )}
                  </div>


                  {/* ****************** Column 2  ******************/}
                </div>
                <div className="customer-column">
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="identity_number">
                      {i18n.t("identity_number")}
                    </label>
                    <Input
                      className="form-input"
                      id="identity_number"
                      name="identity_number"
                      type="text"
                      value={validation.values.identity_number}
                      placeholder={i18n.t("identity_number")}
                      // disabled={readonlyInput}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    />
                  </div>
                  <div className="customer-detail-item">
                    <div className="d-flex flex-row gap-2">
                      <div className="customer-dob">
                        <label className="customer-label" htmlFor="dob">{i18n.t("date_of_birth")}</label>
                        <Input
                          className="form-input"
                          type="date"
                          name="dob"
                          id="dob"
                          placeholder={i18n.t("date_of_birth")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.dob || ""}
                          invalid={
                            validation.touched.dob && validation.errors.dob
                          }
                        />
                        {validation.touched.dob && validation.errors.dob && (
                          <FormFeedback>{validation.errors.dob}</FormFeedback>
                        )}
                      </div>
                      <div className="customer-age">
                        <div>
                          <label className="customer-label" htmlFor="dob">Age</label>
                          <div
                            className="form-input"
                          >
                            {ageCustomer}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="address">{i18n.t("address")}</label>
                    <Input
                      className="form-input"
                      type="text"
                      name="address"
                      id="address"
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
                  </div>

                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="email">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("email")}
                      </div>
                    </label>
                    <Input
                      className="form-input"
                      type="text"
                      name="email"
                      id="email"
                      placeholder={i18n.t("email")}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      // disabled={props.type === "detail"}
                      value={validation.values.email || ""}
                      invalid={
                        validation.touched.email && validation.errors.email
                      }
                    />
                    {validation.touched.email && validation.errors.email && (
                      <FormFeedback>{validation.errors.email}</FormFeedback>
                    )}
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="phone">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("phone")}
                      </div>
                    </label>
                    <Input
                      className="form-input"
                      type="phone"
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
                    {validation.touched.phone && validation.errors.phone && (
                      <FormFeedback>{validation.errors.phone}</FormFeedback>
                    )}
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="emergency_contact">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("emergency_contact")}
                      </div>
                    </label>
                    <Input
                      className="form-input"
                      type="text"
                      name="emergency_contact"
                      id="emergency_contact"
                      placeholder={i18n.t("emergency_contact")}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.emergency_contact || ""}
                      invalid={
                        validation.touched.emergency_contact &&
                        validation.errors.emergency_contact
                      }
                    />
                    {validation.touched.emergency_contact &&
                      validation.errors.emergency_contact && (
                        <FormFeedback>
                          {validation.errors.emergency_contact}
                        </FormFeedback>
                      )}
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="emergency_phone">
                      <div className="d-flex flex-row gap-1">
                        {i18n.t("emergency_phone")}
                      </div>
                    </label>
                    <Input
                      className="form-input"
                      type="phone"
                      name="emergency_phone"
                      id="emergency_phone"
                      placeholder={i18n.t("emergency_phone")}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.emergency_phone || ""}
                      invalid={
                        validation.touched.emergency_phone &&
                        validation.errors.emergency_phone
                      }
                    />
                    {validation.touched.emergency_phone &&
                      validation.errors.emergency_phone && (
                        <FormFeedback>
                          {validation.errors.emergency_phone}
                        </FormFeedback>
                      )}
                  </div>
                  <div className="customer-detail-item">
                    <label className="customer-label" htmlFor="note">{i18n.t("note")}</label>
                    <Input
                      className="form-input"
                      id="note"
                      name="note"
                      type="textarea"
                      value={validation.values.note}
                      placeholder={i18n.t("note")}
                      // disabled={readonlyInput}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    />
                  </div>

                </div>
              </div>
            </Form>

            <MyModalTemplate isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
              <div className="d-flex flex-column gap-3">
                <div>{i18n.t("do_you_really_want_to_reset_the_password")}</div>
                <div
                  className="d-flex flex-row justify-content-center"
                  style={{ gap: 50 }}
                >
                  <Button
                    color="secondary"
                    outline
                    className="px-3"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    {i18n.t("cancel")}
                  </Button>

                  <button
                    className="btn btn-primary btn-block px-3 d-flex gap-1"
                    onClick={() => {
                      handleResetPassword();
                      setIsOpen(false);
                    }}
                  >
                    <div className="">{i18n.t("reset_password")}</div>
                  </button>
                </div>
              </div>
            </MyModalTemplate>
          </div>
        </div >
      </div >
    </React.Fragment >
  );
};
CustomerDetail.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(CustomerDetail);
