import { useParams } from "react-router-dom";
import { Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import { toast } from "react-toastify";
import i18n from "../../i18n";
import MyDropdownSearch from "../../components/Common/MyDropdownSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import MyCommission from "../../components/Common/MyCommission";
import moment from "moment/moment";
import { useFormik } from "formik";
import * as Yup from "yup";

import { KIND_DISCOUNT, listKindPackage } from "../../constants/app.const";

const PackageModal = ({
  modifying,
  isOpen,
  onToggle,
  packageIndex,
  data,
  validation,
  InvalidFeedback,
  FormFeedback,
  isEdit,
  currencyCode,
  deleteItem,
  handleSearchPackage,
  checkEmptyLocation,
}) => {
  const { id } = useParams();
  const packageValidation = useFormik({
    enableReinitialize: true,
    initialValues: {
      package_id: validation.values?.packages[packageIndex]?.package_id ?? "",
      package_name: validation.values?.packages[packageIndex]?.package_name ?? "",
      quantity: validation.values?.packages[packageIndex]?.quantity ?? 1,
      unit_price: validation.values?.packages[packageIndex]?.unit_price ?? 0,
      original_sessions: validation.values?.packages[packageIndex]?.original_sessions ?? 0,
      original_start_date: validation.values?.packages[packageIndex]?.original_start_date ?? "",
      original_end_date: validation.values?.packages[packageIndex]?.original_end_date ?? "",
      bonus_days: validation.values?.packages[packageIndex]?.bonus_days ?? null,
      bonus_sessions: validation.values?.packages[packageIndex]?.bonus_sessions ?? null,
      discount_kind: validation.values?.packages[packageIndex]?.discount_kind ?? 1,
      discount_value: validation.values?.packages[packageIndex]?.discount_value ?? 0,
      months: validation.values?.packages[packageIndex]?.months ?? null,
      package_kind: validation.values?.packages[packageIndex]?.package_kind ?? null,
      past_burnt_sessions: validation.values?.packages[packageIndex]?.past_burnt_sessions ?? 0,
    },
    validationSchema: Yup.object({
      package_id: Yup.number().required(i18n.t("field_required")),
      original_start_date: Yup.string().required(i18n.t("field_required")),
      original_end_date: Yup.string()
        .required(i18n.t("field_required"))
        .test(
          "is-greater-than-start-date",
          i18n.t("end_date_must_be_greater_than_start"),
          function (value) {
            const { start_date } = this.parent;
            return (
              moment(value).isAfter(moment(start_date)) ||
              moment(value).isAfter(moment())
            );
          }
        ),
      bonus_days: Yup.number()
        .nullable()
        .notRequired()
        .min(0, "Bonus days must be greater than 0"),
      bonus_sessions: Yup.number()
        .nullable()
        .notRequired()
        .min(0, "Bonus sessions must be greater than 0"),
      discount_kind: Yup.number().required(i18n.t("field_required")),
      past_burnt_sessions: Yup.number().nullable(),
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
        })
    })
  });

  const syncLocalToParent = () => {
    const values = packageValidation.values;

    validation.setFieldValue(`packages[${packageIndex}].package_id`, values.package_id);
    validation.setFieldValue(`packages[${packageIndex}].package_name`, values.package_name);
    validation.setFieldValue(`packages[${packageIndex}].quantity`, values.quantity);
    validation.setFieldValue(`packages[${packageIndex}].unit_price`, values.unit_price);
    validation.setFieldValue(`packages[${packageIndex}].original_sessions`, values.original_sessions);
    validation.setFieldValue(`packages[${packageIndex}].original_start_date`, values.original_start_date);
    validation.setFieldValue(`packages[${packageIndex}].original_end_date`, values.original_end_date);
    validation.setFieldValue(`packages[${packageIndex}].bonus_days`, values.bonus_days);
    validation.setFieldValue(`packages[${packageIndex}].bonus_sessions`, values.bonus_sessions);
    validation.setFieldValue(`packages[${packageIndex}].discount_kind`, values.discount_kind);
    validation.setFieldValue(`packages[${packageIndex}].discount_value`, values.discount_value);
    validation.setFieldValue(`packages[${packageIndex}].package_kind`, values.package_kind);
    validation.setFieldValue(`packages[${packageIndex}].months`, values.months);
    validation.setFieldValue(`packages[${packageIndex}].amount`, calcAmount(packageValidation.values));
    validation.setFieldValue(`packages[${packageIndex}].past_burnt_sessions`, values.past_burnt_sessions);
  };

  const getItemById = (data, id) => {
    const item = data.find((item) => item.id == id);
    return item;
  };

  const handleSelectPackage = (e) => {
    const item = getItemById(data.listPackage, e);
    packageValidation.setFieldValue('package_id', e);
    packageValidation.setFieldValue('package_name', item?.name);
    packageValidation.setFieldValue('package_kind', item?.kind);
    packageValidation.setFieldValue(
      'original_sessions',
      item?.sessions || 1
    );
    packageValidation.setFieldValue(
      'unit_price',
      e ? item?.price : 0
    );
    // packageValidation.setFieldValue('quantity',item.quantity);
    packageValidation.setFieldValue('months', item.months);
    packageValidation.setFieldValue('original_start_date', "");
    packageValidation.setFieldValue('original_end_date', "");
    packageValidation.setFieldValue('bonus_days', null);
    packageValidation.setFieldValue('bonus_sessions', null);
    // packageValidation.setFieldValue('discount_kind', KIND_DISCOUNT.RATE);
    packageValidation.setFieldValue('discount_value', 0);
    packageValidation.setFieldValue('discount_money', 0);
  };

  const handleChangeStartDate = (e) => {
    const value = e.target.value;
    packageValidation.setFieldValue('original_start_date', value);
    if (packageValidation.values?.months != null) {
      packageValidation.setFieldValue(
        'original_end_date',
        moment(value)
          .add(packageValidation.values?.months, "months")
          .format("yyyy-MM-DD")
      );
    }
  };

  const calcAmount = (item) => {
    const sessions = item.package_kind !== 0 ? item.original_sessions || 1 : 1;

    const amount =
      (item.unit_price || 0) * sessions;
    return amount;
  }

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
      deleteItem(packageIndex, "packages");
    }
  }

  const onSave = async () => {
    const errors = await packageValidation.validateForm();

    if (Object.keys(errors).length === 0) {
      syncLocalToParent();
      // handleGetDetailSale(id);
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
      size="xl"
    >
      <ModalHeader
        toggle={() => {
          onClose();
          onToggle();
        }}
      >
        {i18n.t("add_package")}
      </ModalHeader>

      <ModalBody>
        <div className="sales-package-grid-form">
          <div className="sales-package-column">
            <div>
              <label
                htmlFor={'package_id'}
                className="form-label"
              >
                <div className="d-flex flex-row gap-1">
                  {i18n.t("package")} <p className="text-danger m-0">*</p>
                </div>
              </label>
              <MyDropdownSearch
                id={'package_id'}
                name={'package_id'}
                placeholder={i18n.t("package")}
                options={data.packages}
                selected={packageValidation.values.package_id}
                onSearch={handleSearchPackage}
                disabled={!isEdit}
                setSelected={(e) => handleSelectPackage(e)}
                invalid={
                  packageValidation.touched.package_id && !!packageValidation.errors.package_id
                }
                onBlur={packageValidation.handleBlur}
                onFocus={checkEmptyLocation}
              />
              {packageValidation.touched.package_id && packageValidation.errors.package_id && (
                <InvalidFeedback>
                  {packageValidation.errors.package_id}
                </InvalidFeedback>
              )}
            </div>
            <div>
              <label
                htmlFor={'package_kind'}
                className="form-label"
              >
                <div className="d-flex flex-row gap-1">
                  {i18n.t("package_kind")}{" "}
                  <p className="text-danger m-0">*</p>
                </div>
              </label>
              <MyDropdown
                id={'package_kind'}
                name={'package_kind'}
                placeholder={i18n.t("package_kind")}
                options={listKindPackage}
                disabled={true}
                selected={
                  packageValidation.values.package_kind
                }
                setSelected={(e) => {
                  packageValidation.setFieldValue('package_kind', e);
                }}
                isForm={true}
              />
            </div>
            <div>
              <label
                htmlFor={'original_sessions'}
                className="form-label"
              >
                {i18n.t("sessions")}
              </label>
              <Input
                type="number"
                min={0}
                name={'original_sessions'}
                id={'original_sessions'}
                disabled={!isEdit || packageValidation.values.package_kind !== 0}
                placeholder="0"
                onChange={packageValidation.handleChange}
                onBlur={packageValidation.handleBlur}
                value={
                  packageValidation.values.original_sessions
                }
              />
            </div>
            <div>
              <label htmlFor={'past_burnt_sessions'} className="form-label">
                {i18n.t("past_burnt_sessions")}
              </label>
              <Input
                type="number"
                min={0}
                name={'past_burnt_sessions'}
                id={'past_burnt_sessions'}
                placeholder="0"
                onChange={packageValidation.handleChange}
                onBlur={packageValidation.handleBlur}
                value={packageValidation.values.past_burnt_sessions}
              />
            </div>
          </div>
          <div className="sales-package-column">
            <div>
              <label
                htmlFor={'original_start_date'}
                className="form-label"
              >
                <div className="d-flex flex-row gap-1">
                  {i18n.t("start_date")}{" "}
                  <p className="text-danger m-0">*</p>
                </div>
              </label>
              <Input
                type="date"
                name={'original_start_date'}
                id={'original_start_date'}
                placeholder={i18n.t("start_date")}
                onChange={(e) => handleChangeStartDate(e)}
                onBlur={packageValidation.handleBlur}
                value={
                  packageValidation.values.original_start_date || ""
                }
                disabled={!isEdit}
                invalid={
                  !!(
                    packageValidation.touched.original_start_date &&
                    packageValidation.errors?.original_start_date
                  )
                }
              />
              {packageValidation.touched.original_start_date &&
                packageValidation.errors?.original_start_date && (
                  <InvalidFeedback>
                    {packageValidation.errors?.original_start_date}
                  </InvalidFeedback>
                )}
            </div>
            <div>
              <label
                htmlFor={'end_date'}
                className="form-label"
              >
                <div className="d-flex flex-row gap-1">
                  {i18n.t("end_date")}{" "}
                  <p className="text-danger m-0">*</p>
                </div>
              </label>
              <Input
                type="date"
                name={'original_end_date'}
                id={'original_end_date'}
                placeholder={i18n.t("end_date")}
                onChange={packageValidation.handleChange}
                onBlur={packageValidation.handleBlur}
                value={
                  packageValidation.values.original_end_date ||
                  ""
                }
                disabled={
                  !isEdit ||
                  packageValidation.values.months != null
                }
                invalid={
                  !!(
                    packageValidation.touched.original_end_date &&
                    packageValidation.errors?.original_end_date
                  )
                }
              />
              {packageValidation.touched.original_end_date &&
                packageValidation.errors?.original_end_date && (
                  <FormFeedback>
                    {packageValidation.errors?.original_end_date}
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
                disabled
                style={{ textAlign: "right" }}
                placeholder="0"
                readOnly
                onChange={packageValidation.handleChange}
                onBlur={packageValidation.handleBlur}
                value={
                  packageValidation.values.unit_price.
                    toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
                  " " +
                  currencyCode || ""
                }
              />
            </div>
          </div>
          <div className="sales-package-column">
            <div>
              <label
                htmlFor='total_value_before_discount'
                className="form-label"
              >
                {i18n.t("total_value_before_discount")}
              </label>
              <Input
                type="text"
                name='total_value_before_discount'
                id='total_value_before_discount'
                disabled
                placeholder="0"
                style={{ textAlign: "right" }}
                readOnly
                onChange={packageValidation.handleChange}
                onBlur={packageValidation.handleBlur}
                value={
                  calcTotalByPercent(
                    packageValidation.values
                  ).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
                  " " +
                  currencyCode || ""
                }
              />
            </div>
            <div>
              <label
                htmlFor={'discount_kind'}
                className="form-label"
              >
                {i18n.t("discount")}
              </label>
              <MyCommission
                totalMoney={
                  packageValidation.values.unit_price *
                  (packageValidation.values.package_kind !== 0
                    ? packageValidation.values
                      .original_sessions || 1
                    : 1)
                }
                idPercent={'discount_value'}
                disabled={!isEdit}
                idMoney={'discount_money'}
                valuePercent={
                  packageValidation.values.discount_value
                }
                valueMoney={
                  packageValidation.values.discount_money
                }
                onChangePercent={(e) =>
                  packageValidation.setFieldValue(
                    'discount_value',
                    e.target.value
                  )
                }
                onChangeMoney={(e) => {
                  packageValidation.setFieldValue(
                    'discount_money',
                    e.target.value
                  );
                }}
                onBlurPercent={packageValidation.handleBlur}
                onBlurMoney={packageValidation.handleBlur}
                currency={currencyCode}
              />
            </div>
            <div>
              <label
                htmlFor={'amount'}
                className="form-label"
              >
                {i18n.t("total_amount")}
              </label>
              <Input
                type="text"
                name={'amount'}
                id={'amount'}
                disabled
                placeholder="0"
                style={{ textAlign: "right" }}
                readOnly
                onChange={packageValidation.handleChange}
                onBlur={packageValidation.handleBlur}
                value={
                  calcAfterDiscount(
                    packageValidation.values
                  ).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
                  " " +
                  currencyCode || ""
                }
              />
            </div>
          </div>
          <div className="sales-package-column">
            {packageValidation.values.package_kind !== 0 && (
              <div>
                <label
                  htmlFor={'bonus_sessions'}
                  className="form-label"
                >
                  {i18n.t("bonus_sessions")}
                </label>
                <Input
                  type="number"
                  min={0}
                  name={'bonus_sessions'}
                  id={'bonus_sessions'}
                  placeholder="0"
                  disabled={!isEdit}
                  onChange={packageValidation.handleChange}
                  onBlur={packageValidation.handleBlur}
                  value={
                    packageValidation.values.bonus_sessions
                  }
                  invalid={
                    packageValidation.touched.bonus_sessions &&
                    packageValidation.errors?.bonus_sessions
                  }
                />
                {packageValidation.touched.bonus_sessions &&
                  packageValidation.errors?.bonus_sessions && (
                    <FormFeedback>
                      {packageValidation.errors?.bonus_sessions}
                    </FormFeedback>
                  )}
              </div>
            )}
            <div>
              <label
                htmlFor={'bonus_days'}
                className="form-label"
              >
                {i18n.t("bonus_days")}
              </label>
              <Input
                type="number"
                min={0}
                name={'bonus_days'}
                id={'bonus_days'}
                placeholder="0"
                disabled={!isEdit
                  || packageValidation.values.package_kind !== 0
                }
                onChange={packageValidation.handleChange}
                onBlur={packageValidation.handleBlur}
                value={packageValidation.values.bonus_days}
                invalid={
                  packageValidation.touched.bonus_days &&
                  packageValidation.errors?.bonus_days
                }
              />
              {packageValidation.touched.bonus_days &&
                packageValidation.errors?.bonus_days && (
                  <FormFeedback>
                    {packageValidation.errors?.bonus_days}
                  </FormFeedback>
                )}
            </div>
            <div>
              <label
                htmlFor={'new_expiry_date'}
                className="form-label"
              >
                <div className="d-flex flex-row gap-1">
                  {i18n.t("new_expiry_date")}{" "}
                  <p className="text-danger m-0">*</p>
                </div>
              </label>
              <Input
                type="date"
                name={'new_expiry_date'}
                id={'new_expiry_date'}
                placeholder={i18n.t("end_date")}
                onChange={packageValidation.handleChange}
                onBlur={packageValidation.handleBlur}
                value={(() => {
                  const startDate =
                    packageValidation.values.original_end_date;
                  const bonusDays =
                    Number(
                      packageValidation.values.bonus_days
                    ) || 0;
                  if (!startDate) return "";
                  const newDate = moment(startDate).add(
                    bonusDays,
                    "days"
                  );
                  return newDate.format("YYYY-MM-DD");
                })()}
                disabled={true}
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

export default PackageModal;