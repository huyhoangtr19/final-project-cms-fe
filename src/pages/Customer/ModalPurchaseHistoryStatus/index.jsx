// Function Name : Modal Schedule Detail
// Created date :  19/03/25             by :  VinhLQ
// Updated date :  19/03/25             by :  VinhLQ
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

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
import { toast } from "react-toastify";
import moment from "moment/moment";
import customerService from "../../../services/customer.service";
import saleService from "../../../services/sale.service";
import i18n from "../../../i18n";
import { STATUS_SALE_PACKAGE_DETAIL } from "../../../constants/app.const";
import OnHoldInformation from "./OnHoldInformation";
import TransferInformation from "./TransferInformation";

const ModalPurchaseHistoryStatus = ({
  salePackage,
  isOpen,
  onClose,
  afterSubmit,
}) => {
  const [status, setStatus] = useState(salePackage?.status ?? 1);
  const [valueDefault, setValueDefault] = useState(null);

  const schemaValidateOnHold = {
    start_hold_date: Yup.string()
      .required(i18n.t("field_required"))
      .test(
        "is-greater-and-equal-today",
        i18n.t("start_date_must_be_greater_or_equal_today"),
        function (value) {
          return moment(value).isSameOrAfter(moment().startOf("day"));
        }
      ),
    end_hold_date: Yup.string()
      .required(i18n.t("field_required"))
      .test(
        "is-greater-or-equal-start",
        i18n.t("end_date_must_be_greater_or_equal_start_date"),
        function (value) {
          const { start_hold_date } = this.parent;
          return moment(value).isSameOrAfter(
            moment(start_hold_date).startOf("day")
          );
        }
      ),
    hold_fee: Yup.number().required(i18n.t("field_required")),
  };

  const schemaValidateTransfer = {
    to_customer_id: Yup.string().required(i18n.t("field_required")),
    active_date: Yup.string()
      .required(i18n.t("field_required"))
      .test(
        "is-greater-and-equal-today",
        i18n.t("start_date_must_be_greater_or_equal_today"),
        function (value) {
          return moment(value).isSameOrAfter(moment().startOf("day"));
        }
      ),
    transfer_fee: Yup.number().required(i18n.t("field_required")),
    reason: Yup.string().required(i18n.t("field_required")),
    note: Yup.string().nullable(),
  };

  const schemaValidate = useMemo(() => {
    return (
      {
        3: schemaValidateTransfer,
        4: schemaValidateOnHold,
      }[status] ?? {}
    );
  }, [status, salePackage]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      status: 1,
      package_name: salePackage?.package.name ?? "",
      // default on hold package
      sale_package_detail_id: salePackage?.id ?? "",
      start_hold_date: moment().format("yyyy-MM-DD"),
      end_hold_date: moment().format("yyyy-MM-DD"),
      hold_fee: 0,

      // default transfer package
      transfer_date: moment().format("yyyy-MM-DD"),
      from_sale_package_id: salePackage?.id ?? "",
      to_customer_id: "",
      active_date: moment().format("yyyy-MM-DD"),
      start_date: moment().format("yyyy-MM-DD"),
      end_date: moment().format("yyyy-MM-DD"),
      transfer_fee: 0,
      reason: "",
      note: "",
    },
    validationSchema: Yup.object({
      status: Yup.string().required(i18n.t("field_required")),
      ...schemaValidate,
    }),
    onSubmit: (values) => {
      handleSubmitForm(values);
    },
  });

  const handleStatusUpdate = async (payload) => {
    const salePackageDetailId = salePackage.id;
    return await customerService.updateStatusCustomerPurchase(
      salePackageDetailId,
      payload.status
    );
  };

  const handleOnHold = async (payload) => {
    const { sale_package_detail_id, start_hold_date, end_hold_date, hold_fee } =
      payload;
    return await saleService.onHoldPackage({
      sale_package_detail_id,
      start_hold_date,
      end_hold_date,
      hold_fee,
    });
  };

  const handleTransfer = async (payload) => {
    const {
      from_sale_package_id,
      to_customer_id,
      active_date,
      reason,
      transfer_fee,
      note,
    } = payload;
    return await saleService.transferPackage({
      from_sale_package_id,
      to_customer_id,
      active_date,
      reason,
      transfer_fee,
      note,
    });
  };

  const onSubmitFn = useMemo(() => {
    return (
      {
        0: handleStatusUpdate,
        1: handleStatusUpdate,
        3: handleTransfer,
        4: handleOnHold,
      }[status] ?? null
    );
  }, [status, salePackage]);

  const handleSubmitForm = async () => {
    try {
      const payload = {
        ...validation.values,
      };

      const response = await onSubmitFn(payload);
      if (response.success) {
        afterSubmit && (await afterSubmit());
        onClose();
        toast.success(`Update successfully`, {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("Error", e);
      if (e.message == "package_is_booked") {
        toast.error("Package has used", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
      if (e.errors) {
        validation.setErrors(e.errors);
      }
    }
  };

  const handleOnChangeStatus = (status) => {
    validation.setFieldValue("status", status);
    setStatus(status);
    validation.setTouched({
      sale_package_detail_id: false,
      start_hold_date: false,
      end_hold_date: false,
      hold_fee: false,
      from_sale_package_id: false,
      to_customer_id: false,
      active_date: false,
      reason: false,
      transfer_fee: false,
      note: false,
    });
  };

  const isChanged = useMemo(() => {
    return JSON.stringify(validation.values) !== JSON.stringify(valueDefault);
  }, [validation.values, valueDefault]);

  const allowChangeStatus = useMemo(() => {
    if (!salePackage) return false;
    return [0, 1, 4].includes(salePackage.status);
  }, [salePackage]);

  useEffect(() => {
    if (!!salePackage) {
      const now = moment().format("yyyy-MM-DD");
      const status = salePackage?.status ?? 4;

      setStatus(status);

      const transfer = salePackage.transferred_to;
      const onHold = salePackage.on_hold;

      const valueDefault = {
        package_name: salePackage?.package.name ?? "",
        status: status,
        // default on hold package
        sale_package_detail_id: salePackage?.id ?? "",
        start_hold_date: onHold?.start_hold_date ?? now,
        end_hold_date: onHold?.end_hold_date ?? now,
        hold_fee: onHold?.hold_fee ?? 0,
        free_on_hold_days: salePackage?.free_on_hold_days ?? 0,

        // default transfer package
        transfer_date: transfer?.transfer_date ?? now,
        from_sale_package_id: salePackage?.id ?? "",
        to_customer_id: transfer?.to_customer_id ?? "",
        active_date: transfer?.active_date ?? now,
        start_date: moment(salePackage?.start_date).format("yyyy-MM-DD") ?? now,
        end_date: moment(salePackage?.end_date).format("yyyy-MM-DD") ?? now,
        remaining_duration: moment(salePackage?.end_date).diff(now, "days"),
        transfer_fee: transfer?.transfer_fee ?? 0,
        reason: transfer?.reason ?? "",
        note: transfer?.note ?? "",
      };

      setValueDefault(valueDefault);
      validation.setValues(valueDefault);
    }
  }, [salePackage, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      size="xl"
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
            validation.setTouched({
              // on hold
              sale_package_detail_id: true,
              start_hold_date: true,
              end_hold_date: true,
              hold_fee: true,

              // transfer
              from_sale_package_id: true,
              to_customer_id: true,
              active_date: true,
              reason: true,
              transfer_fee: true,
              note: true,
            });
            if (validation.isValid) {
              handleSubmitForm();
            }
            return false;
          }}
        >
          <ModalHeader
            className="border-bottom-0 py-2 bg-light"
            toggle={onClose}
          >
            {i18n.t("update_purchase_order")}
          </ModalHeader>
          <div className="py-2">
            <div className="d-flex flex-column gap-1 p-3">
              <Row className="my-3">
                {STATUS_SALE_PACKAGE_DETAIL.map((item) => {
                  const expiredStatus = 2;
                  if (item.value == expiredStatus) return null;
                  return (
                    <Col
                      xl="3"
                      sm="3"
                      className="d-flex align-items-center"
                      key={item.value}
                    >
                      <div className="d-flex w-100 justify-content-center">
                        <Input
                          type="radio"
                          value={item.value}
                          id={`status-${item.value}`}
                          name={`status`}
                          disabled={!allowChangeStatus}
                          className="form-check-input mt-0"
                          onChange={() => handleOnChangeStatus(item.value)}
                          onBlur={validation.handleBlur}
                          defaultChecked={salePackage?.status == item.value}
                        />
                        <Label
                          className="form-check-label font-size-13"
                          htmlFor={`status-${item.value}`}
                        >
                          <div className="ps-2">{item.label}</div>
                        </Label>
                      </div>
                    </Col>
                  );
                })}
              </Row>
              {status == 3 && (
                <TransferInformation
                  validation={validation}
                  readOnly={salePackage?.status == 3}
                />
              )}
              {status == 4 && (
                <OnHoldInformation
                  validation={validation}
                  readOnly={salePackage?.status == 4}
                />
              )}
            </div>
          </div>
          <ModalFooter className="py-2 justify-content-center mb-3">
            <div className="d-flex flex-row gap-5">
              <Button
                color="secondary"
                outline
                className="px-3"
                onClick={onClose}
              >
                {i18n.t("cancel")}
              </Button>

              <button
                className="btn btn-primary btn-block px-3 d-flex gap-1"
                type="submit"
                disabled={!allowChangeStatus || !isChanged}
              >
                <div className="">{i18n.t("save")}</div>
              </button>
            </div>
          </ModalFooter>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalPurchaseHistoryStatus;
