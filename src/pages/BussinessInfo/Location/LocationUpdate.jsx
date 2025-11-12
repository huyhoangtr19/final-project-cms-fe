// Function Name : Location Update
// Created date :  25/7/24             by :  NgVinh
// Updated date :                      by :

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

import Breadcrumb from "../../../components/Common/Breadcrumb";
import withRouter from "../../../components/Common/withRouter";
import { useAppSelector } from "../../../hook/store.hook";
import * as Yup from "yup";
import { useFormik } from "formik";
import styled from "styled-components"; // Make sure to install styled-components
import ExcelJS from "exceljs";
import FileSaver from "file-saver";
import {
  Button,
  Col,
  Container,
  Form,
  Input,
  Label,
  Row,
  Card,
  CardBody,
  CardTitle,
} from "reactstrap";
import operatorService from "../../../services/operator.service";

import MyDropdown from "../../../components/Common/MyDropdown";

import IcPlus from "../../../assets/icon/IcPlus";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ImagePreview from "../../../components/Common/ImagePreview";
import i18n from "../../../i18n";
import ViettelConfig from "./ViettelConfig";

const FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

const listSection = [
  { name: "basic_information", id: "basic-information" },
  { name: "photos", id: "photos" },
  { name: "location_amenities", id: "location-amenities" },
  { name: "wifi_setting", id: "wifi-setting" },
  { name: "viettel_config", id: "viettel-config" }
];

const UploadButton = styled.div`
  display: inline-block;

  cursor: pointer;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  color: #495057;

  &:hover {
    background-color: #e9ecef;
  }

  svg {
    margin-right: 8px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;
const LayoutImage = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const InvalidFeedback = styled.div`
  display: block;
  color: red;
  font-size: 10px;
  margin-top: 4px;
`;
const LocationUpdate = (props) => {
  const { id } = useParams();
  const { operator } = useAppSelector((state) => state.operator);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const [locationDetail, setLocationDetail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState([]);
  const [currentTabActive, setCurrentTabActive] = useState("basic-information");
  const [amenities, setAmenities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [fileName, setFileName] = useState("");
  const [oldImages, setOldImages] = useState([]);
  const addWifiSetting = () => {
    validation.setFieldValue("wifi", [
      ...validation.values.wifi,
      { name: "", ip_address: "" },
    ]);
  };

  const deleteSettingWif = (index) => {
    validation.setFieldValue(
      "wifi",
      validation.values.wifi.filter((item, i) => i !== index)
    );
  };
  document.title = `${id ? "Detail" : "Create"} Location | Fitness CMS`;

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: locationDetail
      ? locationDetail
      : {
        name: "",
        short_name: "",
        google_map_url: "",
        address: "",
        province_id: "",
        country_id: "",
        email: "",
        phone: "",
        currency_id: "",
        account_name: "",
        account_number: "",
        account_bank: "",
        account_branch: "",
        description: "",
        wifi: [{ name: "", ip_address: "" }],
        amenities_ids: [],
        images_upload: [],
        images: [],
        pos_id: "",
        pos_key: "",
        merchant_id: "",
        hanet_client_secret: "",
        hanet_token: "",
        hanet_place_id: "",
        hanet_register_client_secret: "",
        hanet_register_token: "",
        tax_code: "",
        meta_data: "",
      },
    validationSchema: Yup.object({
      name: Yup.string().required(i18n.t("location_name_required")),
      email: Yup.string()
        .email(i18n.t("invalid_email"))
        .required(i18n.t("email_required")),
      phone: Yup.string()
        .matches(/^[0-9]+$/, i18n.t("invalid_phone"))
        .max(10, i18n.t("phone_max_length"))
        .required(i18n.t("field_required")),
      address: Yup.string().required(i18n.t("address_required")),
      country_id: Yup.string().required(i18n.t("country_required")),
      province_id: Yup.string().required(i18n.t("province_required")),
      currency_id: Yup.string().required(i18n.t("currency_required")),
      images_upload: Yup.array().of(
        Yup.mixed()
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
          )
      ),
      wifi: Yup.array().of(
        Yup.object().shape({
          name: Yup.string().required(i18n.t("wifi_name_required")),
          ip_address: Yup.string()
            .required(i18n.t("ip_address_required"))
            .matches(
              /(^(\d{1,3}\.){3}(\d{1,3})$)/,
              i18n.t("invalid_ip_format")
            ),
        })
      ),
    }),
    onSubmit: (values) => {
      console.log(values);
    },
  });
  const handleSubmitForm = async () => {
    try {
      const formData = new FormData();
      formData.append("operator_id", operator.id);
      formData.append("_method", "PUT");
      Object.entries(validation.values).forEach(([key, value]) => {
        if (key === "images_upload") {
          value.forEach((item) => {
            formData.append("images_upload[]", item, item?.name);
          });
        } else if (key === "wifi") {
          value.forEach((item, index) => {
            for (const key in item) {
              formData.append(`wifi[${index}][${key}]`, item[key]);
            }
          });
        } else if (key === "images") {
          value.forEach((item, index) => {
            for (const key in item) {
              formData.append(`images[${index}][${key}]`, item[key]);
            }
          });
        } else if (key === "amenities_ids") {
          value.forEach((item) => {
            formData.append("amenities_ids[]", item);
          });
        } else {
          formData.append(key, value || "");
        }
      });

      const response = await operatorService.updateLocationDetail(formData, id);
      if (response.success) {
        handleGetLocationDetail(id);
        toast.success(i18n.t("update_location_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      if (e.errors) {
        validation.setErrors(e.errors);
      }
    } finally {
      validation.setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    console.log("files", files);
    if (files.length) {
      files.forEach((file) => {
        setFileName(file.name);
        validation.setFieldValue(
          "images_upload",
          validation.values.images_upload.concat(file)
        );

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl((prevUrls) => [...prevUrls, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCheckboxChange = (itemId) => {
    if (validation.values.amenities_ids.includes(itemId)) {
      validation.setFieldValue(
        "amenities_ids",
        validation.values.amenities_ids.filter((no) => no !== itemId)
      );
    } else {
      validation.setFieldValue("amenities_ids", [
        ...validation.values.amenities_ids,
        itemId,
      ]);
    }
  };
  const handleGetLocationDetail = async (id) => {
    try {
      const response = await operatorService.getDetailLocation(id);
      if (response.success) {
        const resData = {
          ...response.data,
          amenities_ids: response.data.amenities.map((item) => item.id),
          images_upload: [],
        };
        setPreviewUrl(response.data.images.map((item) => item.image_path));
        setOldImages(response.data.images.map((item) => item.image_path));

        setLocationDetail(resData);
      }
    } catch (e) {
      console.log("eeee", e);
    }
  };

  const handleGetCurrencies = async () => {
    try {
      const res = await operatorService.getListCurrencies();
      if (res.success) {
        const resData = res.data.map((item) => {
          return {
            value: item.id,
            label: item.currency_code,
          };
        });
        setCurrencies(resData);
      }
    } catch (e) {
      console.log("error", e);
    }
  };
  const handleGetCountries = async () => {
    try {
      const res = await operatorService.getListCountries();
      if (res.success) {
        const resData = res.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setCountries(resData);
      }
    } catch (e) {
      console.log("error", e);
    }
  };
  const handleGetAmenities = async () => {
    try {
      const res = await operatorService.getListAmenities();
      if (res.success) {
        const listNew = [];
        Object.entries(res.data).forEach(([key, value]) => {
          const temp = {
            id: isNameAmenity(key).id,
            name: isNameAmenity(key).name,
            list: value,
          };
          listNew.push(temp);
        });
        setAmenities(listNew);
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const isNameAmenity = (type) => {
    switch (type) {
      case "general":
        return { name: "General", id: 1 };
      case "parking":
        return { name: "Parking and Transportation", id: 2 };
      case "other":
        return { name: "Others", id: 3 };
    }
  };
  const handleGetProvinces = async (country) => {
    try {
      const res = await operatorService.getListProvinceByCountry(country);
      if (res.success) {
        const resData = res.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setProvinces(resData);
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleClick = (section) => {
    setCurrentTabActive(section.id);
    const element = document.getElementById(section.id);
    if (!element) {
      return;
    }
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleDeleteImgPrv = (img) => {
    console.log("img", img);
    if (oldImages.includes(img)) {
      validation.setFieldValue(
        "images",
        validation.values.images.filter((item) => item !== img)
      );
    } else {
      validation.setFieldValue(
        "images_upload",
        validation.values.images_upload.filter((item) => item !== img)
      );
    }
    setPreviewUrl(previewUrl.filter((item) => item !== img));
  };

  const titleHead = useMemo(() => {
    switch (props.type) {
      case "create":
        return i18n.t("create_location");
      case "detail":
        return i18n.t("location_detail");
      default:
        return i18n.t("location_detail");
    }
  }, [props.type, i18n.language]);

  useEffect(() => {
    if (validation.values.country_id) {
      handleGetProvinces(validation.values.country_id);
    }
  }, [validation.values.country_id]);

  useEffect(() => {
    if (validation.values.wifi.length === 0) {
      addWifiSetting();
    }
  }, [validation.values.wifi]);

  useEffect(() => {
    handleGetCurrencies();
    handleGetCountries();
    handleGetAmenities();
  }, []);
  useEffect(() => {
    if (id) {
      handleGetLocationDetail(id);
    }
  }, [id]);
  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !==
      JSON.stringify(validation.initialValues) ||
      JSON.stringify(previewUrl) !== JSON.stringify(oldImages)
    );
  }, [validation.values, validation.initialValues, previewUrl, oldImages]);

  const canUpdateLocation = useMemo(() => {
    return permissionUser.includes("location:update_info");
  }, [permissionUser]);
  return (
    <React.Fragment>
      <div className="page-content tabs-container">
        <Breadcrumb
          title={i18n.t("location_list")}
          breadcrumbItem={titleHead}
        />
        <div className="page-container">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.setTouched({
                wifi: validation.values.wifi.map(() => ({
                  name: true,
                  ip_address: true,
                })),
              });
              if (validation.isValid) {
                handleSubmitForm();
              }
              return false;
            }}
          >
            <div className="action-buttons px-4 pt-4">
              <h5>
                {props.type === "create"
                  ? i18n.t("new_location")
                  : i18n.t("location_detail")}
              </h5>
              <div className="action-buttons mb-0">
                <Button
                  color="success"
                  className="btn-back"
                  type="button"
                  outline
                  onClick={() => {
                    props.router.navigate("/settings?tab=1");
                  }}
                >
                  {i18n.t("back")}
                </Button>
                <button
                  className="btn btn-primary btn-block"
                  type="submit"
                  style={{ display: canUpdateLocation ? "block" : "none" }}
                  disabled={!isChanged}
                >
                  {props.type === "create"
                    ? i18n.t("save")
                    : i18n.t("update")}
                </button>
              </div>
            </div>
            <div className="bg-white tabs-header tabs-header-sticky">
              {listSection.map((section) => (
                <Col
                  md={2}
                  key={section.id}
                  className={"text-center tab-item " + (currentTabActive === section.id ? "active" : "")}
                  onClick={() => handleClick(section)}
                >
                  {i18n.t(section.name)}
                </Col>
              ))}
            </div>
            <Card className="mb-4">
              <CardBody>
                <CardTitle id="basic-information" tag="h5">
                  {i18n.t("basic_information")}
                </CardTitle>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="name">
                          <div className="d-flex flex-row">
                            {i18n.t("location_name")}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder={i18n.t("location_name")}
                          required
                          value={validation.values.name}
                          invalid={
                            validation.errors.name && validation.touched.name
                          }
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                        {validation.touched.name &&
                          validation.errors.name && (
                            <InvalidFeedback>
                              {validation.errors.name}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="email">
                          <div className="d-flex flex-row">
                            {i18n.t("email")}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={i18n.t("email")}
                          required
                          invalid={
                            validation.errors.email &&
                            validation.touched.email
                          }
                          value={validation.values.email}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                        {validation.touched.email &&
                          validation.errors.email && (
                            <InvalidFeedback>
                              {validation.errors.email}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="short_name">
                          {i18n.t("abbreviation")}
                        </Label>{" "}
                      </Col>
                      <Col md={9}>
                        <Input
                          id="short_name"
                          name="short_name"
                          type="text"
                          placeholder={i18n.t("abbreviation")}
                          value={validation.values.short_name}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="phone">
                          <div className="d-flex flex-row">
                            {i18n.t("phone")}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="phone"
                          name="phone"
                          type="phone"
                          invalid={
                            validation.errors.phone &&
                            validation.touched.phone
                          }
                          placeholder={i18n.t("phone")}
                          required
                          value={validation.values.phone}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                        {validation.touched.phone &&
                          validation.errors.phone && (
                            <InvalidFeedback>
                              {validation.errors.phone}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="google_map_url">
                          {i18n.t("google_map_url")}
                        </Label>{" "}
                      </Col>
                      <Col md={9}>
                        <Input
                          id="google_map_url"
                          name="google_map_url"
                          type="text"
                          placeholder={i18n.t("google_map_url")}
                          value={validation.values.google_map_url}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="currency_id">
                          <div className="d-flex flex-row">
                            {i18n.t("currency_code")}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={9}>
                        <MyDropdown
                          id="currency_id"
                          name="currency_id"
                          placeholder={i18n.t("currency_code")}
                          options={currencies}
                          invalid={validation.errors.currency_id}
                          selected={validation.values.currency_id}
                          setSelected={(e) => {
                            validation.setFieldValue("currency_id", e);
                          }}
                          onBlur={validation.handleBlur}
                          isForm={true}
                        />
                        {validation.errors.currency_id &&
                          validation.touched.currency_id && (
                            <InvalidFeedback>
                              {validation.errors.currency_id}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="address">
                          <div className="d-flex flex-row">
                            {i18n.t("address")}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          placeholder={i18n.t("address")}
                          required
                          invalid={
                            validation.errors.address &&
                            validation.touched.address
                          }
                          value={validation.values.address}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                        {validation.touched.address &&
                          validation.errors.address && (
                            <InvalidFeedback>
                              {validation.errors.address}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="account_bank">
                          {i18n.t("account_bank")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="account_bank"
                          name="account_bank"
                          type="text"
                          placeholder={i18n.t("account_bank")}
                          value={validation.values.account_bank}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                        {validation.touched.account_bank &&
                          validation.errors.account_bank && (
                            <InvalidFeedback>
                              {validation.errors.account_bank}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="country_id">
                          <div className="d-flex flex-row">
                            {i18n.t("country")}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={9}>
                        <MyDropdown
                          id="country_id"
                          name="country_id"
                          placeholder={i18n.t("country")}
                          options={countries}
                          invalid={validation.errors.country_id}
                          selected={validation.values.country_id}
                          setSelected={(e) => {
                            validation.setFieldValue("country_id", e);
                          }}
                          onBlur={validation.handleBlur}
                          isForm={true}
                        />
                        {validation.errors.country_id && (
                          <InvalidFeedback>
                            {validation.errors.country_id}
                          </InvalidFeedback>
                        )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="account_branch">
                          {i18n.t("account_branch")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="account_branch"
                          name="account_branch"
                          type="text"
                          value={validation.values.account_branch}
                          placeholder={i18n.t("account_branch")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="province_id">
                          <div className="d-flex flex-row">
                            {i18n.t("state")}/{i18n.t("province")}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={9}>
                        <MyDropdown
                          id="province_id"
                          name="province_id"
                          placeholder={`${i18n.t("state")}/${i18n.t(
                            "province"
                          )}`}
                          options={provinces}
                          invalid={validation.errors.province_id}
                          selected={validation.values.province_id}
                          setSelected={(e) => {
                            validation.setFieldValue("province_id", e);
                          }}
                          onBlur={validation.handleBlur}
                          isForm={true}
                        />
                        {validation.errors.province_id && (
                          <InvalidFeedback>
                            {validation.errors.province_id}
                          </InvalidFeedback>
                        )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="account_number">
                          {i18n.t("account_number")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="account_number"
                          name="account_number"
                          type="number"
                          value={validation.values.account_number}
                          placeholder={i18n.t("account_number")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="description">
                          {i18n.t("description")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="description"
                          name="description"
                          type="textarea"
                          value={validation.values.description}
                          placeholder={i18n.t("description")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="account_name">
                          {i18n.t("account_name")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="account_name"
                          name="account_name"
                          type="text"
                          value={validation.values.account_name}
                          placeholder={i18n.t("account_name")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="merchant_id">
                          {i18n.t("merchant_id")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="merchant_id"
                          name="merchant_id"
                          type="text"
                          value={validation.values.merchant_id}
                          placeholder={i18n.t("merchant_id")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="pos_id">{i18n.t("pos_id")}</Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="pos_id"
                          name="pos_id"
                          type="text"
                          value={validation.values.pos_id}
                          placeholder={i18n.t("pos_id")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="pos_key">{i18n.t("pos_key")}</Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="pos_key"
                          name="pos_key"
                          type="text"
                          value={validation.values.pos_key}
                          placeholder={i18n.t("pos_key")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}></Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="hanet_token">
                          {i18n.t("hanet_token")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="hanet_token"
                          name="hanet_token"
                          type="text"
                          value={validation.values.hanet_token}
                          placeholder={i18n.t("hanet_token")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="hanet_register_token">
                          {i18n.t("hanet_register_token")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="hanet_register_token"
                          name="hanet_register_token"
                          type="text"
                          value={validation.values.hanet_register_token}
                          placeholder={i18n.t("hanet_register_token")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="hanet_client_secret">
                          {i18n.t("hanet_client_secret")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="hanet_client_secret"
                          name="hanet_client_secret"
                          type="text"
                          value={validation.values.hanet_client_secret}
                          placeholder={i18n.t("hanet_client_secret")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="hanet_register_client_secret">
                          {i18n.t("hanet_register_client_secret")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="hanet_register_client_secret"
                          name="hanet_register_client_secret"
                          type="text"
                          value={
                            validation.values.hanet_register_client_secret
                          }
                          placeholder={i18n.t("hanet_register_client_secret")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="hanet_place_id">
                          {i18n.t("hanet_place_id")}
                        </Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="hanet_place_id"
                          name="hanet_place_id"
                          type="text"
                          value={validation.values.hanet_place_id}
                          placeholder={i18n.t("hanet_place_id")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="tax_code">{i18n.t("tax_code")}</Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="tax_code"
                          name="tax_code"
                          type="text"
                          value={validation.values.tax_code}
                          placeholder={i18n.t("tax_code")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={3}>
                        <Label for="meta_data">{i18n.t("meta_data")}</Label>
                      </Col>
                      <Col md={9}>
                        <Input
                          id="meta_data"
                          name="meta_data"
                          type="textarea"
                          value={validation.values.meta_data}
                          placeholder={i18n.t("meta_data")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            <Card className="mb-4">
              <CardBody>
                <CardTitle tag="h5" id="photos">
                  {i18n.t("photos")}
                </CardTitle>
                <p color="#000">{i18n.t("supported_file_formats")}</p>
                <LayoutImage>
                  {previewUrl &&
                    previewUrl.map((item, index) => (
                      <ImagePreview
                        key={index}
                        image={item}
                        handleDelete={() => handleDeleteImgPrv(item)}
                        alt="Logo preview"
                      />
                    ))}
                  <div>
                    <UploadButton
                      as="label"
                      htmlFor="images_upload"
                      className={
                        validation.errors.operatorLogo ? "is-invalid" : ""
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          border: "1px dotted #00000073",
                          justifyContent: "center",
                          alignItems: "center",
                          textAlign: "center",
                          height: 160,
                          width: 143,
                        }}
                      >
                        <IcPlus color="#00000073" />
                        <p
                          style={{
                            color: "#00000073",
                          }}
                        >
                          {i18n.t("upload")}
                        </p>
                      </div>
                    </UploadButton>
                    <HiddenFileInput
                      id="images_upload"
                      name="images_upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      // invalid={}
                      ref={fileInputRef}
                    />
                  </div>
                </LayoutImage>
                {validation.errors.images_upload && (
                  <InvalidFeedback>
                    <p>
                      {fileName} {validation.errors.images_upload}
                    </p>
                  </InvalidFeedback>
                )}
              </CardBody>
            </Card>

            <Card className="mb-4">
              <CardBody>
                <CardTitle tag="h5" id="location-amenities">
                  <p color="#000">{i18n.t("amenities")}</p>
                </CardTitle>
                <Row>
                  {amenities.map((amenity) => (
                    <Col md={4} key={amenity.id}>
                      <p
                        style={{
                          color: "gray",
                          fontSize: 13,
                        }}
                      >
                        {i18n.t(amenity.name || "") || amenity.name}
                      </p>
                      {amenity.list.map((item) => (
                        <Col className="my-2" key={item.id}>
                          <div className=" d-flex justify-content-between">
                            <div className="d-flex flex-row gap-1 align-items-center">
                              <img src={item.admin_icon} />
                              <div>
                                {i18n.t(item.name || "") || item.name}
                              </div>
                            </div>
                            <div
                              onClick={() => handleCheckboxChange(item.id)}
                            >
                              <input
                                type="checkbox"
                                checked={validation.values.amenities_ids.includes(
                                  item.id
                                )}
                                disabled={false}
                                onChange={() => { }}
                              />
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>

            <Card className="mb-4">
              <CardBody>
                <CardTitle tag="h5" id="wifi-setting">
                  {i18n.t("wifi_information")}
                </CardTitle>
                <div>
                  {validation.values.wifi.map((wifiSetting, index) => (
                    <div className="d-flex flex-column" key={index}>
                      <Row className="mt-3">
                        <Col md={6}>
                          <Row>
                            <Col md={4}>
                              <Label for={`wifiType[${index}]`}>
                                <div className="d-flex flex-row">
                                  {i18n.t("wifi_name")}{" "}
                                  <p style={{ color: "red" }}>*</p>
                                </div>
                              </Label>
                            </Col>
                            <Col md={8}>
                              <Input
                                id={`wifi[${index}].name`}
                                name={`wifi[${index}].name`}
                                type="text"
                                required
                                value={wifiSetting.name}
                                onChange={(e) => {
                                  const newWifiSettings = JSON.parse(
                                    JSON.stringify(validation.values.wifi)
                                  );
                                  newWifiSettings[index].name =
                                    e.target.value;
                                  validation.setFieldValue(
                                    "wifi",
                                    newWifiSettings
                                  );
                                }}
                                invalid={
                                  validation.errors.wifi &&
                                  validation.touched.wifi &&
                                  validation.touched.wifi[index] &&
                                  validation.errors.wifi[index] &&
                                  validation.errors.wifi[index]?.name
                                }
                                onBlur={validation.handleBlur}
                              />
                              {validation.errors.wifi &&
                                validation.touched.wifi &&
                                validation.touched.wifi[index] &&
                                validation.errors.wifi[index] &&
                                validation.errors.wifi[index]?.name && (
                                  <InvalidFeedback>
                                    {validation.errors.wifi[index]?.name}
                                  </InvalidFeedback>
                                )}
                            </Col>
                          </Row>
                        </Col>
                        <Col md={6}>
                          <Row>
                            <Col md={4}>
                              <Label for="wifi">
                                <div className="d-flex flex-row">
                                  {i18n.t("wifi_ip_address")}{" "}
                                  <p style={{ color: "red" }}>*</p>
                                </div>
                              </Label>
                            </Col>
                            <Col md={8}>
                              <Input
                                id={`wifi[${index}].ip_address`}
                                name={`wifi[${index}].ip_address`}
                                type="text"
                                required
                                value={wifiSetting.ip_address}
                                onChange={(e) => {
                                  const newWifiSettings = JSON.parse(
                                    JSON.stringify(validation.values.wifi)
                                  );
                                  newWifiSettings[index].ip_address =
                                    e.target.value;
                                  validation.setFieldValue(
                                    "wifi",
                                    newWifiSettings
                                  );
                                }}
                                invalid={
                                  validation.errors.wifi &&
                                  validation.touched.wifi &&
                                  validation.touched.wifi[index] &&
                                  validation.errors.wifi[index] &&
                                  validation.errors.wifi[index]?.ip_address
                                }
                                onBlur={validation.handleBlur}
                              />
                              {validation.errors.wifi &&
                                validation.touched.wifi &&
                                validation.touched.wifi[index] &&
                                validation.errors.wifi[index] &&
                                validation.errors.wifi[index]?.ip_address && (
                                  <InvalidFeedback>
                                    {
                                      validation.errors.wifi[index]
                                        ?.ip_address
                                    }
                                  </InvalidFeedback>
                                )}
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-end align-items-center gap-3">
                        {validation.values.wifi.length !== 1 && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              color: "red",
                              textDecoration: "underline",
                            }}
                            onClick={() => deleteSettingWif(index)}
                            className="float-end "
                          >
                            {i18n.t("delete")}
                          </div>
                        )}

                        {index === validation.values.wifi.length - 1 && (
                          <Button
                            color="primary"
                            outline={true}
                            onClick={addWifiSetting}
                            className="float-end mt-2"
                          >
                            {i18n.t("add")}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

          </Form>
           <ViettelConfig />
        </div>
      </div>
    </React.Fragment>
  );
};
LocationUpdate.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(LocationUpdate);
