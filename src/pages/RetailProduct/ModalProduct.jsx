// Function Name : Modal Product
// Created date :  8/8/24             by :  NgVinh
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
import styled from "styled-components";
import { toast } from "react-toastify";
import optionService from "../../services/option.service";
import productService from "../../services/product.service";
import MyDropdown from "../../components/Common/MyDropdown";
import ListCheckbox from "../../components/Common/ListCheckbox";
import appService from "../../services/app.service";
import categoryService from "../../services/category.service";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import InputCurrency from "../../components/Common/InputCurrency";
const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const ModalProduct = ({ isOpen, onClose, onAdd, serviceInfo }) => {
  const [listOption, setListOption] = useState([]);
  const [listUnit, setListUnit] = useState([]);
  const [listCategory, setListCategory] = useState([]);
  const [selectedOption, setSelectedOption] = useState([]);
  const [selectedOptionValue, setSelectedOptionValue] = useState({});
  const [valueDefault, setValueDefault] = useState(null);
  const { permissionUser } = useAppSelector((state) => state.auth);

  const updateInfo = useMemo(() => {
    return permissionUser.includes("product:update_info");
  }, [permissionUser]);
  const title = useMemo(() => {
    return !serviceInfo ? i18n.t("add_new_product") : i18n.t("product_detail");
  }, [serviceInfo]);

  const validation = useFormik({
    initialValues: {
      name: "",
      unit_id: "",
      prd_category_id: "",
      price: "",
      variant_ids: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required(i18n.t("option_name_required")),
      unit_id: Yup.string().required(i18n.t("field_required")),
      price: Yup.string().required(i18n.t("field_required")),
    }),
    onSubmit: (values) => {
      handleSubmitForm();
    },
  });

  const handleChangeOption = (selectList) => {
    setSelectedOption(selectList);
  };
  const getListOption = async () => {
    try {
      const response = await optionService.getListOptionOperator();
      if (response.success) {
        setListOption(
          response.data.map((item) => {
            return {
              value: item.id,
              label: item.name,
              listItem: item.variants,
            };
          })
        );
      }
    } catch (e) {
      console.log("Error", e);
    }
  };
  const getListUnit = async () => {
    try {
      const response = await appService.getListUnit();
      if (response.success) {
        setListUnit(
          response.data.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          })
        );
      }
    } catch (e) {
      console.log("Error", e);
    }
  };
  const getListCategory = async () => {
    try {
      const response = await categoryService.getCategoryByOperator();
      if (response.success) {
        setListCategory(
          response.data.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          })
        );
      }
    } catch (e) {
      console.log("Error", e);
    }
  };

  const handleSubmitForm = async () => {
    try {
      const payload = {
        ...validation.values,
      };

      const response = !serviceInfo
        ? await productService.createProduct(payload)
        : await productService.updateProduct(payload, serviceInfo);
      if (response.success) {
        onClose();
        onAdd();
        toast.success(
          serviceInfo
            ? i18n.t("create_product_success")
            : i18n.t("update_product_success"),
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

  const getDetailOption = async (id) => {
    try {
      const response = await productService.getProductDetail(id);
      if (response.success) {
        validation.setValues({
          name: response.data.name,
          price: response.data.price,
          prd_category_id: response?.data?.category?.id || "",
          unit_id: response.data.unit.id,
          variant_ids: response.data.product_variants.map((item) => item.id),
        });
        setValueDefault({
          name: response.data.name,
          price: response.data.price,
          prd_category_id: response?.data?.category?.id || "",
          unit_id: response.data.unit.id,
          variant_ids: response.data.product_variants.map((item) => item.id),
        });
        const uniqueOptionIds = [
          ...new Set(
            response.data.product_variants.map((item) => item?.option?.id)
          ),
        ];

        const filteredData = listOption.filter((item) =>
          uniqueOptionIds.includes(item.value)
        );
        setSelectedOption(filteredData);
        let tempValueSelect = {};
        response.data.product_variants.forEach((item) => {
          const key = item.option.id;
          const value = item.id;
          if (tempValueSelect[key]) {
            tempValueSelect[key].push(value);
          } else {
            tempValueSelect[key] = [value];
          }
        });
        setSelectedOptionValue(tempValueSelect);
        //   response.data.product_variants.map((item) => item.id)
        // );
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
  function findDuplicates(arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    // Intersection of sets to find common elements
    const intersection = new Set([...set1].filter((x) => set2.has(x)));

    return [...intersection];
  }
  useEffect(() => {
    getListOption();
    getListUnit();
    getListCategory();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (isOpen) {
        await getListOption();
        await getListUnit();
        await getListCategory();
      }
      if (
        isOpen &&
        serviceInfo
        // listUnit.length &&
        // listOption.length &&
        // listCategory.length
      ) {
        await getDetailOption(serviceInfo);
      }

      if (!isOpen) {
        validation.resetForm();
        setSelectedOption([]);
        setSelectedOptionValue({});
      }
    };
    init();
  }, [isOpen, serviceInfo]);
  useEffect(() => {
    if (Object.keys(selectedOptionValue).length && selectedOption.length) {
      // const filterVariant = valueVariant.filter((item) => item);
      const listSelected = selectedOption
        .map((item) => item.listItem)
        .flat()
        .map((ite) => ite.id);
      const listIdVariant = Object.values(selectedOptionValue).flat();
      console.log("listSelected", listSelected, listIdVariant);
      validation.setFieldValue(
        "variant_ids",
        findDuplicates(listSelected, listIdVariant)
      );
    }
  }, [selectedOptionValue, selectedOption]);

  return (
    <Modal
      isOpen={isOpen}
      autoFocus={true}
      centered
      size="xl"
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
    >
      <div className="modal-content border-0">
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.setTouched({
              name: true,
              unit_id: true,
              price: true,
            });
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
              <h5 className="text-start">{i18n.t("product_information")}</h5>

              <Row>
                <Col md={6}>
                  <Row className="mt-2">
                    <Col md={4}>
                      <Label for="name">
                        <div className="d-flex flex-row">
                          {i18n.t("product_name")}
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
                        placeholder={i18n.t("option_name")}
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
                </Col>
                <Col md={6}>
                  <Row className="mt-2">
                    <Col md={4}>
                      <Label for="name">
                        <div className="d-flex flex-row">
                          {i18n.t("unit")} <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <MyDropdown
                        id="unit_id"
                        name="unit_id"
                        placeholder={i18n.t("unit")}
                        options={listUnit}
                        displayEmpty
                        selected={validation.values.unit_id}
                        setSelected={(e) => {
                          validation.setFieldValue("unit_id", e);
                        }}
                        invalid={
                          validation.errors.unit_id &&
                          validation.touched.unit_id
                        }
                        onBlur={validation.handleBlur}
                        isForm={true}
                      />
                      {validation.touched.unit_id &&
                        validation.errors.unit_id && (
                          <InvalidFeedback>
                            {validation.errors.unit_id}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Row className="mt-2">
                    <Col md={4}>
                      <Label for="prd_category_id">{i18n.t("category")}</Label>
                    </Col>

                    <Col md={8}>
                      <MyDropdown
                        id="prd_category_id"
                        name="prd_category_id"
                        placeholder={i18n.t("category")}
                        options={listCategory}
                        displayEmpty
                        selected={validation.values.prd_category_id}
                        setSelected={(e) => {
                          validation.setFieldValue("prd_category_id", e);
                        }}
                        invalid={
                          validation.errors.prd_category_id &&
                          validation.touched.prd_category_id
                        }
                        onBlur={validation.handleBlur}
                        isForm={true}
                      />
                      {validation.touched.prd_category_id &&
                        validation.errors.prd_category_id && (
                          <InvalidFeedback>
                            {validation.errors.prd_category_id}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
                <Col md={6}>
                  <Row className="mt-2">
                    <Col md={4}>
                      <Label for="name">
                        <div className="d-flex flex-row">
                          {i18n.t("price")} <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      {/* <Input
                        id="price"
                        name="price"
                        type="number"
                        invalid={
                          validation.errors.price && validation.touched.price
                        }
                        value={validation.values.price}
                        placeholder={i18n.t("price")}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                      /> */}
                      <InputCurrency
                                              name="price"
                                              value={validation.values.price}
                                              onChange={(e) => validation.setFieldValue("price", e)}
                                              onBlur={validation.handleBlur}
                                            />
                      {validation.touched.price && validation.errors.price && (
                        <InvalidFeedback>
                          {validation.errors.price}
                        </InvalidFeedback>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <h5>{i18n.t("product_option")}</h5>
              <Row>
                <Col md={6}>
                  <Row>
                    <Col md={4} className="float-start">
                      <Label for="id_service">{i18n.t("option")}</Label>
                    </Col>
                    <Col md={8}>
                      <Select
                        isMulti
                        id="variant_ids"
                        name="variant_ids"
                        options={listOption}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={selectedOption}
                        noOptionsMessage={()=> i18n.t("no_options")}
                        onChange={handleChangeOption}
                        placeholder={i18n.t("option")}
                        // styles={{
                        //   container: (provided) => ({
                        //     border: validation.errors.variant_ids
                        //       ? "1px solid #f46a6a"
                        //       : "",
                        //     borderRadius: 4,
                        //   }),
                        // }}
                        onBlur={validation.handleBlur}
                      />
                      {validation.errors.variant_ids && (
                        <InvalidFeedback>
                          {validation.errors.variant_ids}
                        </InvalidFeedback>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
              {selectedOption.length > 0 &&
                selectedOption.map((item) => (
                  <Row key={item.value}>
                    <Col md={6}>
                      <Row>
                        <Col
                          md={3}
                          className="float-end d-flex justify-content-end"
                        >
                          <div>{item.label} :</div>
                        </Col>
                        <Col md={1}></Col>
                        <Col md={8}>
                          <ListCheckbox
                            list={item.listItem || []}
                            selectedList={
                              selectedOptionValue[item?.value] || []
                            }
                            setSelectedList={(values) => {
                              setSelectedOptionValue((prev) => {
                                return { ...prev, [item.value]: values };
                              });
                            }}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                ))}
            </div>
          </div>
          <ModalFooter className="bg-light py-2">
            <div className="d-flex flex-row justify-content-end gap-3">
              <Button
                color="success"
                outline
                className="px-3  btn-back"
                onClick={onClose}
              >
                {i18n.t("back")}
              </Button>

              <button
                className="btn btn-primary btn-block px-3 d-flex gap-1"
                type="submit"
                disabled={!isChanged && serviceInfo}
                style={{
                  display: !updateInfo && serviceInfo ? "none" : "block",
                }}
                // onClick={handleSubmitForm}
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

export default ModalProduct;
