// Function Name : Sale Detail
// Created date :  6/8/24             by :  VinhLQ
// Updated date :                     by :  VinhLQ

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useParams, useSearchParams } from "react-router-dom";
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
import withRouter from "../../components/Common/withRouter";
import MyDropdown from "../../components/Common/MyDropdown";
import {
  KIND_DISCOUNT,
  STATUS_SALE_ORDER,
} from "../../constants/app.const";
import saleService from "../../services/sale.service";
import customerService from "../../services/customer.service";
import staffService from "../../services/staff.service";
import productService from "../../services/product.service";
import packageService from "../../services/package.service";
import optionService from "../../services/option.service";
import operatorService from "../../services/operator.service";
import moment from "moment/moment";
import IcPlus from "../../assets/icon/IcPlus";
import MyDropdownSearch from "../../components/Common/MyDropdownSearch";
import { debounce } from "lodash";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import MyCommission from "../../components/Common/MyCommission";
import CustomerDetail from "../Customer/CustomerDetail";
import PackageModal from "./PackageModal";
import PackageItem from "./PackageItem";
import ProductModal from "./ProductModal";
import ProductItem from "./ProductItem";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const SaleDetail = (props) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const callback = searchParams.get('callback');
  const [saleDetail, setSaleDetail] = useState(null);
  const [options, setOptions] = useState({});
  const [isEdit, setIsEdit] = useState(true);
  const [errorValidate, setErrorValidate] = useState("");
  const [isNext, setIsNext] = useState(false);
  const [oldFiles, setOldFiles] = useState([]);
  const [data, setData] = useState({
    customers: [],
    salespersons: [],
    locations: [],
    products: [],
    listPackage: [],
    packages: [],
  });
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCustomerSuccess, setNewCustomerSuccess] = useState(false);
  const [isShowPackageModal, setIsShowPackageModal] = useState(false);
  const [isModifying, setIsModifying] = useState(true);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [isShowProductModal, setIsShowProductModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [toPayment, setToPayment] = useState(false);

  const createSale = useMemo(() => {
    return permissionUser.includes("sale_order:update_info");
  }, [permissionUser]);

  document.title = "Sale | Fitness CMS";

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      customer_id: saleDetail?.customer.customer_id ?? "",
      commission_percent: saleDetail?.commission_percent ?? 0,
      commission_amount: Number(saleDetail?.commission_amount) ?? 0,
      location_id: saleDetail?.location.id ?? "",
      sale_persons: saleDetail?.sale_persons?.map((item) => ({
        ...item,
        commission_amount: Number(item.commission_amount) || 0,
        recognized_revenue_percent: Number(item.recognized_revenue_percent) || 0,
        recognized_revenue_amount: Number(item.recognized_revenue_amount) || 0,
      })) ?? [],
      packages: saleDetail?.packages ?? [],
      products: saleDetail?.products ?? [],
      clause: saleDetail?.clause ?? "",
      note: saleDetail?.note ?? "",
      contracts: saleDetail?.contracts ?? [],
      contracts_upload: [],
    },
    validationSchema: Yup.object({
      customer_id: Yup.string().required(i18n.t("field_required")),
      // staff_id: Yup.string().required(i18n.t("field_required")),
      location_id: Yup.string().required(i18n.t("location_required")),
      // status: Yup.bool().required(i18n.t("field_required")),
      packages: Yup.array().of(
        Yup.object().shape({
          package_id: Yup.number().required(i18n.t("field_required")),
          original_start_date: Yup.string().required(i18n.t("field_required")),
          original_end_date: Yup.string()
            .required(i18n.t("field_required"))
            .test(
              "is-greater-than-start-date",
              i18n.t("end_date_must_be_greater_than_start"),
              function (value) {
                const { original_start_date } = this.parent;
                return (
                  moment(value).isAfter(moment(original_start_date)) ||
                  moment(value).isAfter(moment())
                );
              }
            ),
          bonus_days: Yup.number()
            .nullable()
            .notRequired()
            .min(1, "Bonus days must be greater than 0"),
          bonus_sessions: Yup.number()
            .nullable()
            .notRequired()
            .min(1, "Bonus sessions must be greater than 0"),
          discount_kind: Yup.number().required(i18n.t("field_required")),
          discount_value: Yup.number()
            .nullable()
            .when("discount_kind", {
              is: KIND_DISCOUNT.RATE,
              then: () =>
                Yup.number()
                  .min(0, "Discount value must be between 0 and 100")
                  .max(100, "Discount value must be between 0 and 100"),
              otherwise: () =>
                Yup.number()
                  .min(0, "Discount value must be greater than 0")
                  .test(
                    "is-less-than-unit-price",
                    "Discount value must be less than unit price",
                    function (value) {
                      const { unit_price } = this.parent;
                      return !value || value <= unit_price;
                    }
                  ),
            }),
        })
      ),
      sale_persons: Yup.array().of(
        Yup.object().shape({
          staff_id: Yup.number().required(i18n.t("field_required")),
          commission_percent: Yup.number()
            .nullable()
            .notRequired()
            .min(0, "Commission percent must be greater than 0"),
          commission_amount: Yup.number().nullable().notRequired(),
          recognized_revenue_percent: Yup.number()
            .nullable()
            .notRequired()
            .min(0, "Recognized revenue percent must be greater than 0"),
          recognized_revenue_amount: Yup.number().nullable().notRequired(),
        })
      ),
      products: Yup.array().of(
        Yup.object().shape({
          product_id: Yup.number().required(i18n.t("field_required")),
          variant_ids: Yup.array()
            .of(Yup.number().required(i18n.t("field_required")))
            .test(
              "valid-variant-ids",
              "Invalid variant selection",
              function (value) {
                const { product_id } = this.parent;
                if (options[product_id] && options[product_id]?.length > 0) {
                  return value.length == options[product_id]?.length;
                }
                return true;
              }
            ),
          quantity: Yup.number()
            .required(i18n.t("field_required"))
            .min(1, "Quantity value must be greater than 1"),
          discount_kind: Yup.number().required(i18n.t("field_required")),
          discount_value: Yup.number()
            .nullable()
            .when("discount_kind", {
              is: KIND_DISCOUNT.RATE,
              then: () =>
                Yup.number()
                  .min(0, "Discount value must be between 0 and 100")
                  .max(100, "Discount value must be between 0 and 100"),
              otherwise: () =>
                Yup.number()
                  .min(0, "Discount value must be greater than 0")
                  .test(
                    "is-less-than-unit-price",
                    "Discount value must be less than unit price",
                    function (value) {
                      const { unit_price } = this.parent;
                      return !value || value <= unit_price;
                    }
                  ),
            }),
        })
      ),
    }),
    onSubmit: (values) => {
      handleSubmitForm(values);
    },
  });
  const createSaleDetail = (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "contracts") {
        value.forEach((item) => {
          formData.append("contracts[]", item, item?.name);
        });
      } else if (key === "products") {
        value.forEach((item, index) => {
          for (const key in item) {
            if (Array.isArray(item[key])) {
              item[key].forEach((itm, idx) => {
                formData.append(`products[${index}][${key}][${idx}]`, itm);
              });
            } else {
              formData.append(`products[${index}][${key}]`, item[key]);
            }
          }
        });
      } else if (key === "packages") {
        value.forEach((item, index) => {
          for (const key in item) {
            if (key === "past_burnt_sessions") {
              if (item[key] === null) {
                formData.append(`packages[${index}][${key}]`, 0)
              } else {
                formData.append(`packages[${index}][${key}]`, item[key])
              }
            } else {
              if (
                !(key === "bonus_sessions" && item[key] === null) &&
                !(key === "bonus_days" && item[key] === null)
              ) {
                formData.append(`packages[${index}][${key}]`, item[key]);
              }
            }
          }
        });
      } else if (key === "sale_persons") {
        value.forEach((item, index) => {
          for (const key in item) {
            formData.append(`staffs[${index}][${key}]`, item[key]);
          }
        });
      } else {
        formData.append(key, value);
      }
    });
    return formData;
  };
  const updateSaleDetail = (values) => {
    const formData = new FormData();
    // formData.append("operator_id", operator.id);
    formData.append("_method", "PUT");
    Object.entries(values).forEach(([key, value]) => {
      if (key === "contracts_upload") {
        value.forEach((item) => {
          formData.append("contracts_upload[]", item, item?.name);
        });
      } else if (key === "products") {
        value.forEach((item, index) => {
          delete item.variants;

          for (const key in item) {
            if (Array.isArray(item[key])) {
              if (item[key].length === 0) {
                if (key === 'variant_ids') {
                  // Force an empty array for variant_ids
                  formData.append(`products[${index}][variant_ids]`, []);
                }
              } else {
                item[key].forEach((itm, idx) => {
                  formData.append(`products[${index}][${key}][${idx}]`, itm);
                });
              }
            } else {
              formData.append(`products[${index}][${key}]`, item[key]);
            }
          }
        });

      } else if (key === "packages") {
        value.forEach((item, index) => {
          for (const key in item) {
            if (key === "past_burnt_sessions") {
              if (item[key] === null) {
                formData.append(`packages[${index}][${key}]`, 0)
              } else {
                formData.append(`packages[${index}][${key}]`, item[key])
              }
            } else {
              if (
                !(key === "bonus_sessions" && item[key] === null) &&
                !(key === "bonus_days" && item[key] === null)
              ) {
                formData.append(`packages[${index}][${key}]`, item[key]);
              }
            }
          }
        });
      } else if (key === "sale_persons") {
        value.forEach((item, index) => {
          for (const key in item) {
            formData.append(`staffs[${index}][${key}]`, item[key]);
          }
        });
      } else if (key === "contracts") {
        value.forEach((item, index) => {
          for (const key in item) {
            formData.append(`contracts[${index}][${key}]`, item[key]);
          }
        });
      } else {
        formData.append(key, value);
      }
    });
    return formData;
  };

  const handleSubmitForm = async (values) => {
    try {
      if (
        validation.values.products?.length +
        validation.values.packages?.length ==
        0
      ) {
        setErrorValidate("Please add at least 1 package or product");
        return;
      }
      const formData =
        props.type === "create"
          ? createSaleDetail(values)
          : updateSaleDetail(values);

      const response =
        props.type === "create"
          ? await saleService.createSale(formData)
          : await saleService.updateSale(formData, id);

      if (response.success) {
        if (props.type === "create") {
          props.onData(response.data);
        }
        toast.success(
          props.type === "create"
            ? "Create sale success"
            : "Update sale success",
          {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          }
        );
        if (props.type === "create") {
          props.router.navigate(`/sale/detail/${response.data.id}`);
        }
        if (isNext) {
          props.onNext();
        }
        if (toPayment) {
          props.toPayment();
        }
      }
    } catch (e) {
      console.log("eeerr", e);
      if (e.message == "previously_purchased_package") {
        toast.error("Previously purchased package", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
      if (e.errors) {
        validation.setErrors(e.errors);
        if (e.errors.staffs && Array.isArray(e.errors.staffs)) {
          toast.error(e.errors.staffs[0], {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        } else if (e.errors.staffs) {
          toast.error(e.errors.staffs, {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        }
      }
    } finally {
      validation.setSubmitting(false);
    }
  };

  const addPackage = () => {
    const newPackages = [
      ...validation.values.packages,
      {
        package_id: "",
        original_start_date: "",
        original_end_date: "",
        unit_price: 0,
        quantity: 1,
        discount_kind: KIND_DISCOUNT.RATE,
        discount_value: 0,
        bonus_days: null,
        original_sessions: 0,
        bonus_sessions: null,
        months: null,
      },
    ];
    validation.setFieldValue("packages", newPackages);
    setErrorValidate("");
    return newPackages.length - 1;
  };

  const addSalePerson = () => {
    const newSalePersons = [
      ...validation.values.sale_persons,
      {
        staff_id: "",
        commission_percent: null,
        recognized_revenue_percent: 0,
      }
    ]
    validation.setFieldValue("sale_persons", newSalePersons);
    return newSalePersons.length - 1;
  };

  const addProduct = () => {
    const newProducts = [
      ...validation.values.products,
      {
        product_id: "",
        quantity: 1,
        unit_price: 0,
        variant_ids: [],
        discount_kind: KIND_DISCOUNT.RATE,
        discount_value: 0,
      }
    ]
    validation.setFieldValue("products", newProducts);
    setErrorValidate("");
    return newProducts.length - 1;
  };

  const deleteItem = (index, key) => {
    validation.setFieldValue(
      key,
      validation.values[key].filter((item, i) => i !== index)
    );
  };

  const handleGetDetailSale = async (idSale) => {
    try {
      const response = await saleService.getDetailSale(idSale);
      if (response.success) {
        response.data.packages = response.data.packages?.map((item) => {
          return {
            ...item,
            package_kind: item?.kind,
            discount_money:
              (item?.discount_value / 100) *
              item?.unit_price *
              (item?.original_sessions || 1),
            original_start_date: item?.original_start_date
              ? moment(item.original_start_date).format("yyyy-MM-DD")
              : "",
            original_end_date: item?.original_end_date
              ? moment(item.original_end_date).format("yyyy-MM-DD")
              : "",
          };
        });
        response.data.products = response.data.products.map((item) => {
          return {
            ...item,
            variant_ids: item.variants.map((itm) => itm.id),
          };
        });
        response.data.sale_persons = response.data.sale_persons.map((item) => {
          return {
            ...item,
            staff_id: item.id,
          };
        });
        if (response.data.contracts.length > 0) {
          setOldFiles(response.data.contracts);
          // setFiles(response.data.contracts);
        }
        setSaleDetail(response.data);
        props.onData(response.data);

        if (response.data.payment_status == STATUS_SALE_ORDER.CONFIRMED) {
          setIsEdit(false);
        }

        // Set data options
        const options = await Promise.all(
          response.data.products.map(async (item) => {
            try {
              return {
                product_id: item.product_id,
                options: await getListOptionByProduct(item.product_id),
              };
            } catch (error) {
              console.log("errr", error);
            }
          })
        );

        setOptions(
          options.reduce((prev, crr) => {
            return { ...prev, [crr.product_id]: crr.options };
          }, {})
        );

        // Set data salesperson and packages
        await handleSelectLocation(response.data?.location.id);
      }
    } catch (e) { }
  };

  const handleGetCustomerForOperator = async (params = {}) => {
    try {
      const response = await customerService.getListCustomerForOperator(params);
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.customer_id,
            label: `${item.c_id} - ${item.last_name} ${item.first_name} - ${item.phone}`,
          };
        });
      }
    } catch (e) { }
  };

  const handleGetSalespersonForOperator = async (payload = {}) => {
    try {
      const params = {
        location: payload?.locationId ?? validation.values.location_id,
        keyword: payload?.keyword ?? "",
      };
      const response = await staffService.getListTrainerForOperator(params);
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.id,
            label: `${item.last_name} ${item.first_name}`,
          };
        });
      }
    } catch (e) { }
  };

  const handleGetPackageForOperator = async (payload = {}) => {
    try {
      const params = {
        location: payload?.locationId ?? validation.values.location_id,
        keyword: payload?.keyword ?? "",
      };
      const response = await packageService.getListPackageForOperator(params);
      if (response.success) {
        return {
          data: response.data,
          dropdown: response.data.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          }),
        };
      }
    } catch (e) { }
  };

  const handleGetProductForOperator = async (payload = {}) => {
    try {
      const params = {
        location: payload?.locationId ?? validation.values.location_id,
        keyword: payload?.keyword ?? "",
      };
      const response = await productService.getListProductOperator(params);
      if (response.success) {
        return {
          data: response.data,
          dropdown: response.data.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          }),
        };
      }
    } catch (e) { }
  };

  const handleGetLocationForOperator = async () => {
    try {
      const response = await operatorService.getListLocationForOperator();
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
            currency: item.currency.currency_code,
          };
        });
      }
    } catch (e) { }
  };

  const handleSearchCustomerForOperator = debounce(async (e) => {
    const data = await handleGetCustomerForOperator({
      keyword: e,
    });
    if (data) {
      setData((prev) => ({
        ...prev,
        customers: data,
      }));
    }
  });

  const handleSearchSalesperson = debounce(async (e) => {
    if (!validation.values.location_id) return;
    const data = await handleGetSalespersonForOperator({ keyword: e });
    if (data) {
      setData((prev) => ({
        ...prev,
        salespersons: data,
      }));
    }
  }, 300);

  const handleSearchPackage = debounce(async (e) => {
    if (!validation.values.location_id) return;
    const res = await handleGetPackageForOperator({ keyword: e });
    if (res) {
      setData((prev) => ({
        ...prev,
        packages: res.dropdown,
        listPackage: res.data,
      }));
    }
  }, 300);

  const handleSearchProduct = debounce(async (e) => {
    if (!validation.values.location_id) return;
    const res = await handleGetProductForOperator({ keyword: e });
    if (res) {
      setData((prev) => ({
        ...prev,
        products: res.dropdown,
        listProduct: res.data,
      }));
    }
  }, 300);

  const handleBack = () => {
    if (callback) {
      props.router.navigate(callback);
    } else {
      props.router.navigate("/sale");
    }
  };

  const calcByPercent = (item) => {
    const sessions = item.package_kind !== 0 ? item.original_sessions || 1 : 1;
    if (item.discount_value === 0) {
      return (item.unit_price || 0) * sessions;
    }
    const amount =
      ((item.unit_price || 0) * sessions * item.discount_value) / 100;
    return amount;
  };

  const calcAfterDiscount = (item) => {
    const sessions = item.package_kind !== 0 ? item.original_sessions || 1 : 1;
    if (item.discount_value === 0) {
      return (item.unit_price || 0) * sessions;
    }
    const amount =
      (item.unit_price || 0) * sessions * (1 - item.discount_value / 100);
    return amount;
  };

  const calcTotalByPercent = (item) => {
    const sessions = item.package_kind !== 0 ? item.original_sessions || 1 : 1;

    const amount = (item.unit_price || 0) * sessions;
    return amount;
  };

  const calcDiscount = (item, isProduct = false) => {
    const type = item.discount_kind;
    const callback = {
      [KIND_DISCOUNT.RATE]: calcDiscountByRate,
      [KIND_DISCOUNT.AMOUNT]: calcDiscountByAmount,
    };
    return callback[Number(type)](item, isProduct) ?? "NaN";
  };

  const calcDiscountByAmount = (item, isProduct = false) => {
    if (item?.quantity < 0 || item.discount_value < 0) {
      return "NaN";
    }
    let amount = item.unit_price - item.discount_value;
    if (isProduct) {
      amount = item.unit_price * item.quantity - item.discount_value;
    }
    if (amount < 0) return "NaN";

    return amount;
  };

  const calcDiscountByRate = (item, isProduct = false) => {
    if (item?.quantity < 0 || item.discount_value < 0) {
      return "NaN";
    }
    const discount = item.unit_price * (1 - item.discount_value / 100);
    if (discount < 0) return "NaN";
    return isProduct ? discount * item.quantity : discount;
  };

  const calcTotalAmount = () => {
    let totalAmount = 0;
    for (const item of validation.values.packages) {
      const amount = calcAfterDiscount(item);
      if (typeof amount !== "number" || isNaN(amount)) {
        return "NaN";
      }
      totalAmount += amount;
    }

    for (const item of validation.values.products) {
      const amount = calcDiscount(item, true);
      if (typeof amount !== "number" || isNaN(amount)) {
        return "NaN";
      }
      totalAmount += amount;
    }

    return totalAmount;
  };

  const calcTotalPackageDiscount = () => {
    let totalDiscount = 0;
    for (const item of validation.values.packages) {
      totalDiscount += (item.discount_value / 100) * ((item.amount ?? 0) + (item.discount_money ?? 0));
    }
    return totalDiscount;
  }

  const calcTotalProductDiscount = () => {
    let totalDiscount = 0;
    for (const item of validation.values.products) {
      totalDiscount += item.sub_total - (item.amount ?? 0);
    }
    return totalDiscount;
  }

  const calcTotalDiscount = () => {
    return calcTotalPackageDiscount() + calcTotalProductDiscount();
  }

  const calcTotalPackageSubTotal = () => {
    let total = 0;
    for (const item of validation.values.packages) {
      total += (item.amount ?? 0) + (item.discount_money ?? 0);
    }
    return total;
  }

  const calcTotalProductSubTotal = () => {
    let total = 0;
    for (const item of validation.values.products) {
      total += item.sub_total ?? 0;
    }
    return total;
  }

  const calcTotalSubTotal = () => {
    return calcTotalPackageSubTotal() + calcTotalProductSubTotal();
  }

  const getListOptionByProduct = async (productId) => {
    const response = await optionService.getListOptionByProduct(productId);
    if (response.success) {
      return response.data;
    }
  };

  const handleSelectSalePercent = (e, index) => {
    validation.setFieldValue(`sale_persons[${index}].staff_id`, e);
  };

  const handleSelectLocation = async (locationId) => {
    validation.setFieldValue("location_id", locationId);
    const [salespersons, packages, products] = await Promise.all([
      handleGetSalespersonForOperator({ locationId: locationId }),
      handleGetPackageForOperator({ locationId: locationId }),
      handleGetProductForOperator({ locationId: locationId }),
    ]);

    setData((prev) => ({
      ...prev,
      salespersons: salespersons,
      listPackage: packages.data,
      packages: packages.dropdown,
      listProduct: products.data,
      products: products.dropdown,
    }));
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

  const fetchData = async () => {
    try {
      const [customers, locations] = await Promise.all([
        handleGetCustomerForOperator(),
        handleGetLocationForOperator(),
      ]);

      setData((prev) => ({
        ...prev,
        customers: customers,
        locations: locations,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const checkEmptyLocation = () => {
    if (!validation.values.location_id) {
      toast.warning("Please select location", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        hideProgressBar: true,
      });
    }
  };

  const printOrder = () => {
    setIsOpenReceipt(true);
  };
  const handleRemovePaymentRequest = async (item) => {
    try {
      const res = await saleService.removePaymentRequest(item.code);
      if (res.success) {
        toast.success(i18n.t("request_payment_remove"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("eeeee", e);
    }
  };

  const handleRetry = async (item) => {
    try {
      const res = await saleService.retryPaymentRequest(item.code);
      if (res.success) {
        setIsRetry(true);
        toast.success(i18n.t("retry_payment_request"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("eeeee", e);
    }
  };

  const dataSalePerson = useMemo(() => {
    return data.salespersons.filter((item) => {
      return (
        validation.values.sale_persons.find(
          (sp) => sp.staff_id === item.value
        ) === undefined
      );
    });
  }, [data.salespersons, validation.values.sale_persons]);

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !==
      JSON.stringify(validation.initialValues)
    );
  }, [validation.values, validation.initialValues]);

  const setNewCustomer = () => {
    const newCustomer = data.customers[0];
    validation.setFieldValue("customer_id", newCustomer.value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currencyCode = useMemo(() => {
    if (!validation.values.location_id || !data.locations) {
      return "";
    } else {
      return data.locations.find(
        (item) => item.value == validation.values.location_id
      )?.currency;
    }
  }, [data.locations, validation.values.location_id]);

  useEffect(() => {
    if (id) {
      handleGetDetailSale(id);
    }
  }, [id]);

  useEffect(() => {
    if (newCustomerSuccess) {
      setNewCustomer();
      setNewCustomerSuccess(false);
    }
  }, [data.customers])

  useEffect(() => {
    // Synchronise commission_amount <-> commission_percent for each sale_person
    const updatedSalePersons = validation.values.sale_persons.map((person, _) => {
      const percent = Number(person.commission_percent);
      const total = Number(validation.values.commission_amount) || 0;
      let newAmount = person.commission_amount;
      // If commission_percent changed, we compute commission_amount
      if (!isNaN(percent) && percent !== null && total > 0) {
        const calcAmount = Math.round((percent / 100) * total);
        if (person.commission_amount !== calcAmount) {
          newAmount = calcAmount;
        }
      }
      return {
        ...person,
        commission_amount: newAmount,
      };
    });
    // We update only if it changed (prevent infinite loop)
    if (JSON.stringify(updatedSalePersons) !== JSON.stringify(validation.values.sale_persons)) {
      validation.setFieldValue("sale_persons", updatedSalePersons, false);
    }
  }, [validation.values.sale_persons.map(p => p.commission_percent).join(','), validation.values.commission_amount]);

  return (
    <React.Fragment>
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
        <div className="sales-grid">
          <div className="sales-order">
            <div className="sales-card sales-order-details">
              <div className="sales-card-header">
                <h5 className="sales-card-title">{i18n.t("order_details")}</h5>
              </div>
              <div className="sales-card-body sales-form-grid">
                <div className="">
                  <label
                    htmlFor="location_id"
                    className="form-label"
                  >
                    <div className="d-flex flex-row gap-1">
                      {i18n.t("location")} <p className="text-danger m-0">*</p>
                    </div>
                  </label>
                  <MyDropdown
                    id="location_id"
                    name="location_id"
                    placeholder={i18n.t("location")}
                    options={data.locations}
                    selected={validation.values.location_id}
                    setSelected={handleSelectLocation}
                    disabled={!isEdit}
                    invalid={
                      validation.errors.location_id &&
                      validation.touched.location_id
                    }
                    onBlur={validation.handleBlur}
                    isForm={true}
                  />
                  {validation.errors.location_id &&
                    validation.touched.location_id && (
                      <InvalidFeedback>
                        {validation.errors.location_id}
                      </InvalidFeedback>
                    )}
                </div>
                <div className="">
                  <label
                    htmlFor="customer_id"
                    className="form-label"
                  >
                    <div className="d-flex flex-row gap-1">
                      {i18n.t("customer")} <p className="text-danger m-0">*</p>
                    </div>
                  </label>
                  <div className={props.type === "create" ? "d-flex gap-2" : ""}>
                    <div style={{ flex: 1 }}>
                      <MyDropdownSearch
                        id="customer_id"
                        name="customer_id"
                        placeholder={i18n.t("customer")}
                        options={data.customers}
                        selected={validation.values.customer_id}
                        setSelected={(e) => {
                          validation.setFieldValue("customer_id", e);
                        }}
                        onSearch={handleSearchCustomerForOperator}
                        disabled={!isEdit}
                        invalid={
                          validation.errors.customer_id &&
                          validation.touched.customer_id
                        }
                        onBlur={validation.handleBlur}
                      />
                      {modalOpen && (
                        <div style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          width: "100dvw",
                          height: "100dvh",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 9999,
                        }}>
                          <div style={{
                            backgroundColor: "transparent",
                            borderRadius: "8px",
                            display: "flex",
                            flexDirection: "column",
                            height: "max-content",
                          }}>
                            <CustomerDetail type="create" modalOpen={setModalOpen} fetchDataCustomer={fetchData} newCustomerSuccess={setNewCustomerSuccess} />
                          </div>
                        </div>
                      )}
                    </div>
                    {props.type === "create" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setModalOpen(!modalOpen)}>
                        {i18n.t("new")}
                      </button>
                    )}
                    {validation.errors.customer_id &&
                      validation.touched.customer_id && (
                        <InvalidFeedback>
                          {validation.errors.customer_id}
                        </InvalidFeedback>
                      )}
                  </div>
                </div>
              </div>
            </div>
            <div className="sales-card sales-order-items">
              <div className="sales-card-header">
                <h5 className="sales-card-title">{i18n.t("order_items")}</h5>
                <div className="d-flex gap-3">
                  <Button
                    color="primary"
                    outline
                    onClick={() => {
                      const newIndex = addPackage();
                      setIsModifying(false);
                      setSelectedPackageIndex(newIndex);
                      setIsShowPackageModal(true);
                    }}
                    disabled={!isEdit}
                    className="d-flex gap-1"
                  >
                    <IcPlus color="currentColor" />
                    {i18n.t("add_package")}
                  </Button>
                  {isShowPackageModal && (
                    <PackageModal
                      key={JSON.stringify(validation.values.packages[selectedPackageIndex])}
                      modifying={isModifying}
                      isOpen={isShowPackageModal}
                      onToggle={() => setIsShowPackageModal(false)}
                      packageIndex={selectedPackageIndex}
                      data={data}
                      validation={validation}
                      InvalidFeedback={InvalidFeedback}
                      FormFeedback={FormFeedback}
                      isEdit={isEdit}
                      currencyCode={currencyCode}
                      deleteItem={deleteItem}
                      handleSearchPackage={handleSearchPackage}
                      checkEmptyLocation={checkEmptyLocation}
                      handleGetDetailSale={handleGetDetailSale}
                    />
                  )}
                  <Button
                    color="primary"
                    outline
                    onClick={() => {
                      const newIndex = addProduct();
                      setIsModifying(false);
                      setSelectedProductIndex(newIndex);
                      setIsShowProductModal(true);
                    }}
                    disabled={!isEdit}
                    className="d-flex gap-1"
                  >
                    <IcPlus color="currentColor" />
                    {i18n.t("add_product")}
                  </Button>
                  {isShowProductModal && (
                    <ProductModal
                      key={JSON.stringify(validation.values.products[selectedProductIndex])}
                      modifying={isModifying}
                      isOpen={isShowProductModal}
                      onToggle={() => setIsShowProductModal(false)}
                      productIndex={selectedProductIndex}
                      data={data}
                      validation={validation}
                      InvalidFeedback={InvalidFeedback}
                      FormFeedback={FormFeedback}
                      isEdit={isEdit}
                      currencyCode={currencyCode}
                      deleteItem={deleteItem}
                      handleSearchProduct={handleSearchProduct}
                      checkEmptyLocation={checkEmptyLocation}
                      handleGetDetailSale={handleGetDetailSale}
                    />
                  )}
                </div>
              </div>
              <div className="sales-card-body">
                {validation.values.packages.length === 0 &&
                  validation.values.products.length === 0 ? (
                  <>
                    <p className="m-0">No item added yet.</p>
                    <div className="invalid-feedback d-block">{errorValidate}</div>
                  </>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {validation.values.packages?.map((item, index) => (
                      <PackageItem
                        key={index}
                        item={item}
                        packageIndex={index}
                        deleteItem={deleteItem}
                        currencyCode={currencyCode}
                        onOpenModal={() => {
                          setSelectedPackageIndex(index);
                          setIsModifying(true);
                          setIsShowPackageModal(true);
                        }}
                      />
                    ))}
                    {validation.values.products?.map((item, index) => (
                      <ProductItem
                        key={index}
                        item={item}
                        productIndex={index}
                        deleteItem={deleteItem}
                        currencyCode={currencyCode}
                        onOpenModal={() => {
                          setSelectedProductIndex(index);
                          setIsModifying(true);
                          setIsShowProductModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="sales-card sales-commissions">
              <div className="sales-card-header">
                <h5 className="sales-card-title">{i18n.t("sales_and_commissions")}</h5>
                <Button
                  color="primary"
                  outline
                  onClick={() => {
                    addSalePerson();
                  }}
                  disabled={!isEdit}
                  className="d-flex gap-1"
                >
                  <IcPlus color="currentColor" />
                  <div className="" style={{ lineHeight: "17px" }}>
                    {i18n.t("add_sale_person")}
                  </div>
                </Button>
              </div>
              <div className="sales-card-body d-flex flex-column gap-3">
                <div>
                  <label
                    htmlFor="total_commission"
                    className="form-label"
                  >
                    {i18n.t("total_commission")}
                  </label>
                  <MyCommission
                    totalMoney={calcTotalAmount()}
                    idPercent={"commission_percent"}
                    idMoney={"commission_amount"}
                    valuePercent={validation.values.commission_percent}
                    valueMoney={validation.values.commission_amount}
                    onChangePercent={(value) => {
                      validation.setFieldValue(
                        "commission_percent",
                        value.target.value
                      );
                    }}
                    onChangeMoney={(value) =>
                      validation.setFieldValue(
                        "commission_amount",
                        value.target.value
                      )
                    }
                    onBlurPercent={validation.handleBlur}
                    onBlurMoney={validation.handleBlur}
                  />
                </div>
                {validation.values.sale_persons.length === 0 ? (
                  <>
                    <p className="m-0">No sale person added yet.</p>
                    {!validation.isValid && (
                      <div className="invalid-feedback d-block">{errorValidate}</div>
                    )}
                  </>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {validation.values.sale_persons?.map((_, index) => (
                      <div
                        key={index}
                        className="commission-item-container"
                      >
                        <i
                          onClick={() => deleteItem(index, "sale_persons")}
                          className="fa fa-times commission-item-close"
                        ></i>
                        <div>
                          <label
                            htmlFor={`sale_persons[${index}].staff_id`}
                            className="form-label"
                          >
                            <div className="d-flex flex-row gap-1">
                              {i18n.t("sale_person")}{" "}
                              <p className="text-danger m-0">*</p>
                            </div>
                          </label>
                          <MyDropdownSearch
                            id={`sale_persons[${index}].staff_id`}
                            name={`sale_persons[${index}].staff_id`}
                            placeholder={i18n.t("sale_person")}
                            options={data.salespersons}
                            optionsChoose={dataSalePerson}
                            selected={
                              validation.values.sale_persons[index].staff_id
                            }
                            onSearch={handleSearchPackage}
                            disabled={!isEdit}
                            setSelected={(e) => handleSelectSalePercent(e, index)}
                            invalid={
                              validation.errors.sale_persons &&
                              validation.touched.sale_persons &&
                              validation.touched.sale_persons[index] &&
                              validation.touched.sale_persons[index].staff_id &&
                              validation.errors.sale_persons[index] &&
                              validation.errors.sale_persons[index]?.staff_id
                            }
                            onBlur={validation.handleBlur}
                            onFocus={checkEmptyLocation}
                          />
                          {validation.errors.sale_persons &&
                            validation.touched.sale_persons &&
                            validation.touched.sale_persons[index] &&
                            validation.touched.sale_persons[index].staff_id &&
                            validation.errors.sale_persons[index] &&
                            validation.errors.sale_persons[index]?.staff_id && (
                              <InvalidFeedback>
                                {validation.errors.sale_persons[index]?.staff_id}
                              </InvalidFeedback>
                            )}
                        </div>
                        <div>
                          <label
                            htmlFor={`sale_persons[${index}].commission_percent`}
                            className="form-label"
                          >
                            {i18n.t("commission")}
                          </label>
                          <MyCommission
                            totalMoney={validation.values.commission_amount}
                            idPercent={`sale_persons[${index}].commission_percent`}
                            idMoney={`sale_persons[${index}].commission_amount`}
                            valuePercent={
                              validation.values.sale_persons[index]
                                .commission_percent
                            }
                            valueMoney={
                              validation.values.sale_persons[index]
                                .commission_amount
                            }
                            onChangePercent={(value) => {
                              validation.setFieldValue(
                                `sale_persons[${index}].commission_percent`,
                                value.target.value
                              );
                            }}
                            onChangeMoney={(value) =>
                              validation.setFieldValue(
                                `sale_persons[${index}].commission_amount`,
                                value.target.value
                              )
                            }
                            onBlurPercent={validation.handleBlur}
                            onBlurMoney={validation.handleBlur}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`sale_persons[${index}].recognized_revenue_percent`}
                            className="form-label"
                          >
                            {i18n.t("recognized_revenue")}
                          </label>
                          <MyCommission
                            totalMoney={calcTotalAmount()}
                            idPercent={`sale_persons[${index}].recognized_revenue_percent`}
                            idMoney={`sale_persons[${index}].recognized_revenue_amount`}
                            valuePercent={
                              validation.values.sale_persons[index]
                                .recognized_revenue_percent
                            }
                            valueMoney={
                              validation.values.sale_persons[index]
                                .recognized_revenue_amount
                            }
                            onChangePercent={(value) => {
                              validation.setFieldValue(
                                `sale_persons[${index}].recognized_revenue_percent`,
                                value.target.value
                              );
                            }}
                            onChangeMoney={(value) =>
                              validation.setFieldValue(
                                `sale_persons[${index}].recognized_revenue_amount`,
                                value.target.value
                              )
                            }
                            onBlurPercent={validation.handleBlur}
                            onBlurMoney={validation.handleBlur}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="sales-card sales-notes">
              <div className="sales-card-header">
                <h5 className="sales-card-title">{i18n.t("terms_and_notes")}</h5>
              </div>
              <div className="sales-card-body sales-notes-body">
                <div>
                  <label
                    htmlFor="clause"
                    className="form-label"
                  >
                    {i18n.t("clause")}
                  </label>
                  <Input
                    type="text"
                    name="clause"
                    id="clause"
                    disabled={!isEdit}
                    placeholder={i18n.t("clause")}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.clause}
                  />
                </div>
                <div>
                  <label
                    htmlFor="note"
                    className="form-label"
                  >
                    {i18n.t("note")}
                  </label>
                  <Input
                    type="textarea"
                    name="note"
                    id="note"
                    placeholder={i18n.t("note")}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.note}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="sales-summaries sales-sticky">
            <div className="sales-card sales-order-summary">
              <div className="sales-card-header">
                <h5 className="sales-card-title">{i18n.t("order_summary")}</h5>
              </div>
              <div className="sales-card-body">
                <div className="sales-summary-infos">
                  <div className="sales-summary-info">
                    <label className="sales-summary-label">
                      {i18n.t("sub_total")}
                    </label>
                    <p>
                      {calcTotalSubTotal().toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
                        " " +
                        currencyCode || ""}
                    </p>
                  </div>
                  <div className="sales-summary-info">
                    <label className="sales-summary-label">
                      {i18n.t("total_discount")}
                    </label>
                    <p className="sales-summary-total-discount">
                      {"- " + calcTotalDiscount().toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
                        " " +
                        currencyCode || ""}
                    </p>
                  </div>
                  <hr className="separator" />
                  <div className="sales-summary-total">
                    <label className="sales-summary-label">
                      {i18n.t("total_amount")}
                    </label>
                    <p>
                      {calcTotalAmount().toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
                        " " +
                        currencyCode || ""}
                    </p>
                  </div>
                </div>
                <div className="action-buttons mt-4">
                   
                  <Button
                    color="success"
                    className="btn-back"
                    type="button"
                    onClick={handleBack}
                    outline
                  >
                    {i18n.t("back")}
                  </Button>
                  {props.type === "create" ? (
                    <>
                      <Button
                        color="primary"
                        type="submit"
                      >
                        {i18n.t("save")}
                      </Button>
                      <Button
                        color="primary"
                        type="submit"
                        onClick={() => {
                          setIsNext(true);
                        }}
                      >
                        {i18n.t("go_to_payment")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        color="primary"
                        type="submit"
                        disabled={!isChanged}
                      >
                        {i18n.t("update")}
                      </Button>
                      <Button
                        color="primary"
                        onClick={() => {
                          props.onNext();
                        }}
                      >
                        {i18n.t("go_to_payment")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="sales-card sales-order-summary">
              <div className="sales-card-header">
                <h5 className="sales-card-title">{i18n.t("commission")}</h5>
              </div>
              <div className="sales-card-body">
                <div className="sales-summary-infos">
                  <div className="sales-summary-info">
                    <label className="sales-summary-label">
                      {i18n.t("total_commission")}
                    </label>
                    <p>
                      {Number(validation.values.commission_amount).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
                        " " +
                        currencyCode || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </Form>
    </React.Fragment>
  );
};
SaleDetail.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
  onNext: PropTypes.func,
  onData: PropTypes.func,
  step: PropTypes.number,
};
export default withRouter(SaleDetail);
