// Function Name : Modal Category
// Created date :  12/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import Select from "react-select";
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
import operatorService from "../../services/operator.service";
import styled from "styled-components";
import { toast } from "react-toastify";
import categoryService from "../../services/category.service";
import productService from "../../services/product.service";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;
const ModalCategory = ({
  isOpen,
  onClose,
  onAdd,

  serviceInfo = null,
}) => {
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [listLocation, setListLocation] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [listServices, setListServices] = useState([]);
  const [valueDefault, setValueDefault] = useState(null);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const update_info = useMemo(() => {
    return permissionUser.includes("product_category:update_info");
  }, [permissionUser]);
  const handleChangeLocation = (selectedOptions) => {
    validation.setFieldValue(
      "location_ids",
      selectedOptions.map((item) => item.value)
    );
    setSelectedLocations(selectedOptions);
  };
  const handleChangeService = (selectedOptions) => {
    validation.setFieldValue(
      "product_ids",
      selectedOptions.map((item) => item.value)
    );
    setSelectedServices(selectedOptions);
  };

  const title = useMemo(() => {
    return !serviceInfo
      ? i18n.t("add_new_category")
      : i18n.t("category_detail");
  }, [serviceInfo]);

  const validation = useFormik({
    initialValues: {
      name: "",
      location_ids: [],
      product_ids: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required(i18n.t("name_required")),
      location_ids: Yup.array().min(1, i18n.t("location_required")),
    }),
    onSubmit: (values) => {
      handleSubmitForm();
      console.log("values", values);
    },
  });
  const handleSubmitForm = async () => {
    console.log("Form submitted with values:", validation.values);
    try {
      const payload = {
        ...validation.values,
      };
      const response = !serviceInfo
        ? await categoryService.createCategory(payload)
        : await categoryService.updateCategory(payload, serviceInfo);

      if (response.success) {
        onClose();
        onAdd();
        toast.success(
          `${
            !serviceInfo
              ? i18n.t("create_category_success")
              : i18n.t("update_category_success")
          } `,
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
      const response = await productService.getListProductOperator();
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
      const response = await categoryService.getCategoryDetail(id);
      if (response.success) {
        console.log("res", response.data);

        validation.setValues({
          name: response.data.name,

          product_ids: response.data.products.map((item) => item.id),
          location_ids: response.data.locations.map((item) => item.id),
        });
        setValueDefault({
          name: response.data.name,

          product_ids: response.data.products.map((item) => item.id),
          location_ids: response.data.locations.map((item) => item.id),
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
        response.data.products.forEach((item) => {
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
  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !== JSON.stringify(valueDefault) &&
      valueDefault !== null
    );
  }, [validation.values, valueDefault]);
  const listIdLocation = useMemo(() => {
    return listLocation.map((item) => item.value);
  }, [listLocation]);
  const listIdService = useMemo(() => {
    return listServices.map((item) => item.value);
  }, [listServices]);

  useEffect(() => {
    const init = async () => {
      if (isOpen && serviceInfo) {
        await getDetailPackage(serviceInfo);
      }
      if (!isOpen) {
        validation.resetForm();
        setSelectedLocations([]);
        setSelectedServices([]);
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
              <h5 className="text-start">{i18n.t("category_information")}</h5>

              <Row className="mt-2">
                <Col md={4}>
                  <Label for="name">
                    <div className="d-flex flex-row">
                      {i18n.t("category_name")}
                      <p style={{ color: "red" }}>*</p>
                    </div>
                  </Label>
                </Col>
                <Col md={8}>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    invalid={validation.errors.name && validation.touched.name}
                    value={validation.values.name}
                    placeholder={i18n.t("category_name")}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                  />
                  {validation.touched.name && validation.errors.name && (
                    <InvalidFeedback>{validation.errors.name}</InvalidFeedback>
                  )}
                </Col>
              </Row>

              <Row className="mt-3">
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
                    noOptionsMessage={()=> i18n.t("no_options")}
                    onChange={handleChangeLocation}
                    placeholder={i18n.t("applied_location")}
                    styles={{
                      container: (provided) => ({
                        border: validation.errors.location_ids
                          ? "1px solid #f46a6a"
                          : "",
                        borderRadius: 4,
                      }),
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
              <Row>
                <Col md={4} className="float-start">
                  <Label for="product_ids">{i18n.t("product")}</Label>
                </Col>
                <Col md={8}>
                  <Select
                    isMulti
                    id="product_ids"
                    name="product_ids"
                    options={listServices}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={selectedServices}
                    noOptionsMessage={()=> i18n.t("no_options")}
                    onChange={handleChangeService}
                    placeholder={i18n.t("product")}
                    styles={{
                      container: (provided) => ({
                        border: validation.errors.product_ids
                          ? "1px solid #f46a6a"
                          : "",
                        borderRadius: 4,
                      }),
                    }}
                    onBlur={validation.handleBlur}
                  />
                  {validation.errors.product_ids && (
                    <InvalidFeedback>
                      {validation.errors.product_ids}
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
                disabled={!isChanged && serviceInfo}
                // onClick={handleSubmitForm}
                style={{
                  display: !update_info && serviceInfo ? "none" : "block",
                }}
              >
                <div className="">
                  {serviceInfo ? i18n.t("update") : i18n.t("save")}
                </div>
              </button>
            </div>
          </ModalFooter>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalCategory;
