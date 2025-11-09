import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import { toast } from "react-toastify";
import i18n from "../../i18n";
import MyDropdownSearch from "../../components/Common/MyDropdownSearch";
import InputCurrency from "../../components/Common/InputCurrency";
import { useFormik } from "formik";
import * as Yup from "yup";

import { KIND_DISCOUNT } from "../../constants/app.const";

import optionService from "../../services/option.service";

const ProductModal = ({
  modifying,
  isOpen,
  onToggle,
  productIndex,
  data,
  validation,
  InvalidFeedback,
  FormFeedback,
  isEdit,
  currencyCode,
  deleteItem,
  handleSearchProduct,
  checkEmptyLocation,
  handleGetDetailSale,
}) => {
  const { id } = useParams();
  const [options, setOptions] = useState({});
  const productValidation = useFormik({
    enableReinitialize: true,
    initialValues: {
      product_id: validation.values?.products[productIndex]?.product_id ?? "",
      variant_ids: validation.values?.products[productIndex]?.variant_ids ?? [],
      quantity: validation.values?.products[productIndex]?.quantity ?? 1,
      discount_kind: validation.values?.products[productIndex]?.discount_kind ?? KIND_DISCOUNT.RATE,
      discount_kind_amount: validation.values?.products[productIndex]?.discount_kind_amount ?? 0,
      discount_kind_rate: validation.values?.products[productIndex]?.discount_kind_rate ?? 0,
      discount_value: validation.values?.products[productIndex]?.discount_value ?? 0,
      unit_price: validation.values?.products[productIndex]?.unit_price ?? 0,
      sub_total: validation.values?.products[productIndex]?.sub_total ?? 0,
      amount: validation.values?.products[productIndex]?.amount ?? 0,
      product_name: validation.values?.products[productIndex]?.product_name ?? "",
    },
    validationSchema: Yup.object({
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
  });

  const syncLocalToParent = () => {
    const values = productValidation.values;

    validation.setFieldValue(`products[${productIndex}].product_id`, values.product_id);
    validation.setFieldValue(`products[${productIndex}].variant_ids`, values.variant_ids);
    validation.setFieldValue(`products[${productIndex}].quantity`, values.quantity);
    validation.setFieldValue(`products[${productIndex}].discount_kind`, values.discount_kind);
    validation.setFieldValue(`products[${productIndex}].discount_kind_amount`, values.discount_kind_amount);
    validation.setFieldValue(`products[${productIndex}].discount_kind_rate`, values.discount_kind_rate);
    validation.setFieldValue(`products[${productIndex}].discount_value`, values.discount_value);
    validation.setFieldValue(`products[${productIndex}].unit_price`, values.unit_price);
    validation.setFieldValue(`products[${productIndex}].sub_total`, values.sub_total);
    validation.setFieldValue(`products[${productIndex}].amount`, values.amount);
    validation.setFieldValue(`products[${productIndex}].product_name`, values.product_name);
  };

  const getItemById = (data, id) => {
    const item = data.find((item) => item.id == id);
    return item;
  };

  const getListOptionByProduct = async (productId) => {
    const response = await optionService.getListOptionByProduct(productId);
    if (response.success) {
      return response.data;
    }
  };

  const handleSelectProduct = async (e) => {
    const product = getItemById(data.listProduct, e);
    const unitPrice = e ? product?.price : 0;
    productValidation.setFieldValue('product_id', e);
    productValidation.setFieldValue('variant_ids', []);
    productValidation.setFieldValue('unit_price', unitPrice);
    productValidation.setFieldValue('product_name', product.name);
    const option = await getListOptionByProduct(product.id);
    setOptions((prev) => ({
      ...prev,
      [product.id]: option,
    }));
  };

  const calcSubTotal = (quantity) => {
    if (quantity < 0 ||
      productValidation.values.unit_price < 0 ||
      (productValidation.values.discount_kind !== KIND_DISCOUNT.RATE &&
        productValidation.values.discount_kind !== KIND_DISCOUNT.AMOUNT)
    ) {
      return "NaN";
    }

    const subTotal = productValidation.values.unit_price * quantity;
    const total = productValidation.values.discount_kind === KIND_DISCOUNT.RATE
      ? subTotal * (1 - productValidation.values.discount_value / 100)
      : subTotal - productValidation.values.discount_value;

    productValidation.setFieldValue('quantity', quantity);
    productValidation.setFieldValue('sub_total', subTotal);
    productValidation.setFieldValue('amount', total);
  }

  const handlePercentChange = (e) => {
    let val = Number(e.target.value);
    if (isNaN(val)) val = 0;
    if (val > 100) val = 100;
    if (val < 0) val = 0;

    calcTotalAmount(val);
  };

  const handleMoneyChange = (e) => {
    const totalMoney = productValidation.values.sub_total;
    let val = e.target.value.replace(/\D/g, "");
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 0;
    if (num > totalMoney) num = totalMoney;
    if (num < 0) num = 0;

    calcTotalAmount(num);
  };

  const calcTotalAmount = (discountValue) => {
    if (discountValue < 0 ||
      productValidation.values.sub_total < 0 ||
      (productValidation.values.discount_kind !== KIND_DISCOUNT.RATE &&
        productValidation.values.discount_kind !== KIND_DISCOUNT.AMOUNT)
    ) {
      return "NaN";
    }

    const total = productValidation.values.discount_kind === KIND_DISCOUNT.RATE
      ? productValidation.values.sub_total * (1 - discountValue / 100)
      : productValidation.values.sub_total - discountValue;

    productValidation.setValues({
      ...productValidation.values,
      'discount_value': discountValue,
      'amount': total,
    })
  }

  useEffect(() => {
    calcSubTotal(productValidation.values.quantity);
  }, [productValidation.values.unit_price]);

  const formatFieldName = (field) => {
    return field
      .replace(/_/g, " ") // snake_case → space
      .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize words
  };

  const displayFormikErrorsAsToasts = (errors) => {
    Object.entries(errors).forEach(([field, message]) => {
      if (message) {
        toast.error(`${formatFieldName(field)}: ${message}`, {
          autoClose: 5000,
          hideProgressBar: true,
        });
      }
    });
  };

  const onClose = () => {
    if (!modifying) {
      deleteItem(productIndex, "products");
    }
  }

  const onSave = async () => {
    const errors = await productValidation.validateForm();

    if (Object.keys(errors).length === 0) {
      syncLocalToParent();
      handleGetDetailSale(id);
      onToggle();
    } else {
      console.log("form errors:", errors);
      displayFormikErrorsAsToasts(errors);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      role="dialog"
      autoFocus={true}
      centered
      data-toggle="modal"
      toggle={() => {
        onClose();
        onToggle();
      }}
      size="lg"
    >
      <ModalHeader
        toggle={() => {
          onClose();
          onToggle();
        }}
      >
        {i18n.t("add_product")}
      </ModalHeader>

      <ModalBody>
        <div className="sales-package-grid-form">
          <div className="sales-package-column">
            <div>
              <label
                htmlFor={'product_id'}
                className="form-label"
              >
                <div className="d-flex flex-row gap-1">
                  {i18n.t("product")}{" "}
                  <p className="text-danger m-0">*</p>
                </div>
              </label>
              <MyDropdownSearch
                id={'product_id'}
                name={'product_id'}
                placeholder={i18n.t("product")}
                options={data.products}
                selected={productValidation.values.product_id}
                setSelected={(e) => handleSelectProduct(e)}
                onSearch={handleSearchProduct}
                disabled={!isEdit}
                invalid={
                  productValidation.touched.product_id &&
                  productValidation.errors?.product_id
                }
                onBlur={productValidation.handleBlur}
                onFocus={checkEmptyLocation}
              />
              {productValidation.touched.product_id &&
                productValidation.errors?.product_id && (
                  <InvalidFeedback>
                    {productValidation.errors?.product_id}
                  </InvalidFeedback>
                )}
            </div>
            {options[productValidation.values.product_id] &&
              options[productValidation.values.product_id].map((option, optIndex) => (
                <div key={optIndex}>
                  <label
                    htmlFor={'product_id'}
                    className="form-label"
                  >
                    {option.name}
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {option.variants.map((variant, varIndex) => (
                      <div key={variant.id} className="d-flex gap-1">
                        <Input
                          type="radio"
                          value={variant.id}
                          id={`variant_ids${optIndex}${varIndex}`}
                          name={`variant_ids[${optIndex}]`}
                          className="form-check-input"
                          disabled={!isEdit}
                          onChange={(e) => {
                            const newVariantIds = [
                              ...(productValidation.values.variant_ids || []),
                            ];

                            newVariantIds[optIndex] = parseInt(
                              e.target.value
                            );

                            productValidation.setFieldValue('variant_ids', newVariantIds);
                          }}
                          onBlur={productValidation.handleBlur}
                          defaultChecked={
                            productValidation.values.variant_ids &&
                            productValidation.values.variant_ids.includes(variant.id)
                          }
                        />
                        <label
                          className="form-check-label font-size-13"
                          htmlFor={`variant_ids${optIndex}${varIndex}`}
                        >
                          <div className="ps-2">{variant.name}</div>
                        </label>
                        {productValidation.touched.variant_ids &&
                          productValidation.errors?.variant_ids && (
                            <div className="invalid-feedback d-block">
                              {productValidation.errors?.variant_ids}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            <div>
              <label
                htmlFor={'quantity'}
                className="form-label"
              >
                <div className="d-flex flex-row gap-1">
                  {i18n.t("quantity")}{" "}
                  <p className="text-danger m-0">*</p>
                </div>
              </label>
              <Input
                type="number"
                name={'quantity'}
                id={'quantity'}
                placeholder="Quantity"
                min={0}
                disabled={!isEdit}
                onChange={(e) => {
                  productValidation.setFieldValue('quantity', e.target.value);
                  calcSubTotal(e.target.value);
                }}
                onBlur={productValidation.handleBlur}
                value={productValidation.values.quantity}
                invalid={
                  productValidation.touched.quantity &&
                  productValidation.errors?.quantity
                }
              />
              {productValidation.touched.quantity &&
                productValidation.errors?.quantity && (
                  <FormFeedback>
                    {productValidation.errors?.quantity}
                  </FormFeedback>
                )}
            </div>
            <div>
              <label
                htmlFor={'unit_price'}
                className="form-label"
              >
                {i18n.t("unit_price")}
              </label>
              <Input
                type="text"
                name={'unit_price'}
                id={'unit_price'}
                placeholder="0"
                disabled
                readOnly
                onChange={() => productValidation.handleChange}
                onBlur={productValidation.handleBlur}
                value={productValidation.values.unit_price.toLocaleString("vi-VN", { maximumFractionDigits: 2 }) || ""}
              />
            </div>
          </div>
          <div className="sales-package-column">
            <div>
              <label
                htmlFor={'sub_total'}
                className="form-label"
              >
                {i18n.t("sub_total")}
              </label>
              <InputCurrency
                disabled
                value={productValidation.values.sub_total}
                onChange={productValidation.handleChange}
              />
            </div>
            <div>
              <label
                htmlFor={'discount_kind'}
                className="form-label"
              >
                {i18n.t("discount")}
              </label>
              <div className="d-flex gap-3">
                <div>
                  <div className="d-flex flex-nowrap align-items-center">
                    <Input
                      type="radio"
                      value={KIND_DISCOUNT.RATE}
                      id={'discount_kind_rate'}
                      name={'discount_kind'}
                      className="form-check-input"
                      onChange={(e) =>productValidation.setFieldValue("discount_kind", Number(e.target.value))}
                      onBlur={productValidation.handleBlur}
                      disabled={!isEdit}
                      defaultChecked={
                        productValidation.values.discount_kind ==
                        KIND_DISCOUNT.RATE
                      }
                    />
                    <label
                      className="form-check-label font-size-13"
                      htmlFor={'discount_kind_rate'}
                    >
                      <div className="ps-2">{i18n.t("percentage")}</div>
                    </label>
                  </div>
                  <div className="d-flex flex-nowrap align-items-center">
                    <Input
                      type="radio"
                      value={KIND_DISCOUNT.AMOUNT}
                      id={'discount_kind_amount'}
                      name={'discount_kind'}
                      onChange={(e) => productValidation.setFieldValue("discount_kind", Number(e.target.value))}
                      onBlur={productValidation.handleBlur}
                      className="form-check-input"
                      disabled={!isEdit}
                      defaultChecked={
                        productValidation.values.discount_kind ==
                        KIND_DISCOUNT.AMOUNT
                      }
                    />
                    <label
                      className="form-check-label font-size-13"
                      htmlFor={'discount_kind_amount'}
                    >
                      <div className="ps-2">{i18n.t("for_amount")}</div>
                    </label>
                  </div>
                </div>
                <div className="d-flex flex-nowrap align-items-center flex-fill">
                  <Input
                    type="number"
                    name={'discount_value'}
                    id={'discount_value'}
                    placeholder="0"
                    min={0}
                    onChange={(e) => {
                      if (productValidation.values.discount_kind === KIND_DISCOUNT.RATE) {
                        handlePercentChange(e);
                      } else {
                        handleMoneyChange(e);
                      }
                    }}
                    onBlur={productValidation.handleBlur}
                    value={productValidation.values.discount_value}
                    invalid={
                      !!(
                        productValidation.touched.discount_value &&
                        productValidation.errors?.discount_value
                      )
                    }
                  />
                  <label className="ps-1 m-0">
                    {productValidation.values.discount_kind == KIND_DISCOUNT.RATE
                      ? "%"
                      : currencyCode}
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor={'amount'}
                className="form-label"
              >
                {i18n.t("total_amount")}
              </label>
              <InputCurrency
                disabled
                value={productValidation.values.amount}
                onChange={productValidation.handleChange}
              />
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          className="btn btn-primary"
          onClick={() => onSave()}
        >
          {i18n.t("save")}
        </button>
      </ModalFooter>
    </Modal>
  )
}

export default ProductModal;