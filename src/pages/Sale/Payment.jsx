import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState, useRef } from "react";
import withRouter from "../../components/Common/withRouter";
import { Button, Col, Input, Row } from "reactstrap";
import i18n from "../../i18n";
import InputCurrency from "../../components/Common/InputCurrency";
import saleService from "../../services/sale.service";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { getMessaging, onMessage } from "firebase/messaging";
// import { messaging } from "../../firebase/firebaseConfig";
import IcFaild from "../../assets/icon/IcFaild";
import paymentSuccessImage from "../../assets/images/payment_success.png";
import { toast } from "react-toastify";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebase/firebaseConfig";
import Receipt from "./Receipt";
const app = initializeApp(firebaseConfig);
const listPercent = [
  { label: "10%", value: 0.1 },
  { label: "20%", value: 0.2 },
  { label: "30%", value: 0.3 },
  { label: "50%", value: 0.5 },
  { label: "100%", value: 1 },
];
const listPaymentMethod = [
  { label: i18n.t("payment_cash"), value: 0 },
  { label: i18n.t("payment_transfer"), value: 1 },
  { label: i18n.t("payment_card"), value: 2 },
];

export const CheckBoxPay = (prop) => {
  const {
    index,
    item,
    checked,
    onChange,
    keyCheck,
    disabled = false,
    centered = false,
  } = prop;
  const handleChangeLocation = (value) => {
    onChange(value);
  };
  return (
    <div
      key={index}
      className={
        "sales-input-container " +
        (checked === item.value ? "sales-input-checked" : "")
      }
      onClick={() => {
        !disabled && handleChangeLocation(item.value);
      }}
    >
      <input
        style={{ display: "none" }}
        type="radio"
        id={item.value}
        disabled={disabled}
        name={keyCheck}
        value={item.value}
        checked={checked === item.value}
        onChange={() => {}}
      />
      <label
        htmlFor={item.value}
        className={
          "sales-label-input-payment " + (centered ? "text-center" : "")
        }
      >
        {item.label}
      </label>
    </div>
  );
};

const Payment = (props) => {
  const { id } = useParams();
  const [amount, setAmount] = useState(
    props?.dataSale?.total_amount - props?.dataSale?.paid_amount || 0
  );
  const [percent, setPercent] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const deviceToken = Cookies.get("device_token");
  const [codePayment, setCodePayment] = useState("");
  const [isOpenReceipt, setIsOpenReceipt] = useState(false);

  const handleSubcribe = async (code) => {
    try {
      setIsLoading(true);
      const res = await saleService.subscribeSale(code, deviceToken);
      // props.dataSale?.id;

      if (res.success) {
        setIsPaid(true);
      }
    } catch (e) {
      console.log("eeeee", e);
    }
  };

  const handleUnScribe = async (id) => {
    try {
      const res = await saleService.unsubscribeSale(id, deviceToken);

      if (res.success) {
      }
    } catch (e) {
      console.log("eeeee", e);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await saleService.paymentRequest(
        {
          payment_value: amount,
          payment_method: paymentMethod,
        },
        props.dataSale?.id
      );
      if (res.success) {
        setCodePayment(res.data?.code);

        if (paymentMethod === 0) {
          setIsSuccess(true);
          setIsLoading(false);
          toast.success(i18n.t("payment_success"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });

          props.handleReload(props.dataSale?.id);
        } else {
          handleSubcribe(res.data?.code);
          toast.success(i18n.t("request_payment_send_success"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
          // setIsLoading(true);
        }
      }
    } catch (e) {
      console.log("eeeee", e);
      toast.error(i18n.t("payment_request_failed"), {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        hideProgressBar: true,
      });
    }
  };

  const handleReCheckPending = async (code = "") => {
    try {
      const res = await saleService.getPaymentStatus(
        code.length > 0 ? code : codePayment
      );
      if (res.success) {
        if (res.data?.trans_status === 100 || res.data?.trans_status === 104) {
          setIsSuccess(true);
          setIsLoading(false);
          toast.success(i18n.t("payment_success"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        } else if (res?.data.trans_status === 90) {
          toast.success(i18n.t("payment_processing"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        }
      }
    } catch (e) {
      console.log("eeeee", e);
    }
  };

  const printOrder = () => {
    //
    setIsOpenReceipt(true);
  };

  const isSubmitting = useRef(false);

  const handleThreadPayment = async () => {
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setIsLoading(true);
    await handlePayment();
    isSubmitting.current = false;
  };

  const renderResult = () => {
    if (isLoading) {
      return (
        <div
          className="d-flex flex-column justify-content-center align-items-center mb-2"
          style={{
            display: isLoading ? "flex" : "none",
            visibility: isLoading ? "visible" : "hidden",
          }}
        >
          <div>
            <i
              className="bx bx-loader bx-spin align-middle me-2 mb-4"
              style={{ fontSize: 60 }}
            ></i>
          </div>
          <p>{i18n.t("payment_processing")}</p>
          <p>{i18n.t("please_waiting")}</p>
          <span
            className="mt-2"
            onClick={() => {
              handleReCheckPending();
            }}
            style={{ color: "#4071EE" }}
          >
            {i18n.t("check")}
          </span>
        </div>
      );
    } else if (isSuccess) {
      return <img src={paymentSuccessImage} alt="success" />;
    } else {
      return (
        <div
          className="d-flex flex-column justify-content-center align-items-center mb-2"
          style={{
            display: "flex",
          }}
        >
          <div>
            <IcFaild />
          </div>
          <p>
            {i18n.t("payment_fail")}{" "}
            <span
              onClick={() => {
                handleThreadPayment();
              }}
              style={{ color: "#4071EE" }}
            >
              {i18n.t("try_again")}
            </span>
          </p>
        </div>
      );
    }
  };
  const setupIOSFallback = (checkInterval = 30000) => {
    // Chỉ sử dụng cho iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (!isIOS) return;

    // Thiết lập polling để kiểm tra thông báo
    setInterval(async () => {
      try {
        // Gọi API backend của bạn để kiểm tra thông báo mới
        handleReCheckPending();
      } catch (error) {
        console.error("Lỗi khi kiểm tra thông báo:", error);
      }
    }, checkInterval);
  };
  const fallBackNotif = useCallback(() => {
    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received in foreground. Payment:", payload);
      if (
        payload.data?.trans_status === "100" ||
        payload.data.trans_status === "104" ||
        payload.data.payment_status === "1"
      ) {
        setIsSuccess(true);
        if (payload?.data?.payment_method === "1") {
          props.handleReload(props.dataSale?.id);
        }
        setIsLoading(false);
      } else if (payload?.data?.trans_status === "90") {
        // toast.success("Thanh toán đang chờ", {
        //   position: "top-right",
        //   autoClose: 5000,
        //   theme: "light",
        //   hideProgressBar: true,
        // });
      } else {
        setIsSuccess(false);
      }
      // Perform your custom actions here
      handleUnScribe(codePayment);

      // Example: Display a toast notification
      const { title, body } = payload.notification || {};
      if (title && body) {
        alert(`Notification: ${title} - ${body}`);
      }
    });
    return () => unsubscribe();
  }, [codePayment]);

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      setupIOSFallback();
    } else {
      fallBackNotif();
    }
  }, []);

  const [localSale, setLocalSale] = useState(props.dataSale);

  useEffect(() => {
    setLocalSale(props.dataSale);
    if (localSale.paid_amount) {
      setAmount(
        (localSale.total_amount - localSale.paid_amount) * percent || 0
      );
    } else {
      setAmount(localSale.total_amount * percent);
    }
  }, [percent, localSale.total_amount, localSale.paid_amount]);

  return (
    <React.Fragment>
      <div className="sales-grid">
        <div className="sales-order">
          <div className="sales-card">
            <div className="sales-card-header">
              <h5 className="sales-card-title">{i18n.t("payment_details")}</h5>
            </div>
            <div className="sales-card-body d-flex flex-column gap-3">
              <div>
                <label className="form-label">{i18n.t("total_value")}</label>
                <InputCurrency
                  value={props?.dataSale?.total_amount || 0}
                  disabled
                />
              </div>
              <div>
                <label className="form-label">{i18n.t("enter_amount")}</label>
                <InputCurrency
                  placeholder="10,000,000"
                  value={amount}
                  maxValue={
                    props?.dataSale?.total_amount -
                      props.dataSale?.paid_amount || 0
                  }
                  onChange={(e) => setAmount(e)}
                />
              </div>
              <div className="sales-percent-container">
                {listPercent.map((item, index) => {
                  return (
                    <div className="sales-percent" key={index}>
                      <CheckBoxPay
                        index={index}
                        item={item}
                        disabled={
                          props?.dataSale?.paid_amount ===
                          props.dataSale.total_amount
                        }
                        keyCheck="paymentPercent"
                        checked={percent}
                        onChange={(value) => {
                          setPercent(value);
                        }}
                        centered={true}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="sales-card">
            <div className="sales-card-header">
              <h5 className="sales-card-title">
                {i18n.t("choose_payment_method")}
              </h5>
            </div>
            <div className="sales-card-body d-flex flex-column gap-3">
              {listPaymentMethod.map((item, index) => {
                return (
                  <div className="sales-payment-method" key={index}>
                    <CheckBoxPay
                      index={index}
                      item={item}
                      keyCheck="paymentMethod"
                      checked={paymentMethod}
                      onChange={(value) => {
                        setPaymentMethod(value);
                      }}
                    />
                  </div>
                );
              })}
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
                    {i18n.t("total_amount")}
                  </label>
                  <p>
                    {Number(props.dataSale?.total_amount).toLocaleString(
                      "vi-VN",
                      { maximumFractionDigits: 2 }
                    ) + " VND"}
                  </p>
                </div>
                <div className="sales-summary-info">
                  <label className="sales-summary-label">
                    {i18n.t("amount_paid")}
                  </label>
                  <p>
                    {(props.dataSale?.paid_amount || 0).toLocaleString(
                      "vi-VN",
                      { maximumFractionDigits: 2 }
                    ) + " VND"}
                  </p>
                </div>
                <hr className="separator" />
                <div className="sales-summary-total">
                  <label className="sales-summary-label">
                    {i18n.t("amount_due")}
                  </label>
                  <p>
                    {(
                      props.dataSale?.total_amount -
                        props.dataSale?.paid_amount || 0
                    ).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
                      " VND"}
                  </p>
                </div>
              </div>
              <div className="action-buttons mt-4">
                {props.dataSale?.payment_status === 1 && (
                  <Button color="primary" outline onClick={() => printOrder()}>
                    <div className="d-flex gap-2">
                      <i className="fa fa-print"></i>
                      {i18n.t("print")}
                    </div>
                  </Button>
                )}
                <Button
                  color="success"
                  className="btn-back"
                  type="button"
                  onClick={() => {
                    props.router.navigate("/sale");
                  }}
                  outline
                >
                  {i18n.t("back")}
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  onClick={() => {
                    handleThreadPayment();
                  }}
                >
                  {i18n.t("payment")}
                </Button>
              </div>
            </div>
          </div>
          <div className="sales-card sales-order-summary">
            <div className="sales-card-header">
              <h5 className="sales-card-title">
                {i18n.t("client_informations")}
              </h5>
            </div>
            <div className="sales-card-body">
              <div className="sales-summary-infos">
                <div className="sales-summary-info">
                  <label className="sales-summary-label">
                    {i18n.t("name")}
                  </label>
                  <p>
                    {props.dataSale?.customer?.last_name +
                      " " +
                      props.dataSale?.customer?.first_name}
                  </p>
                </div>
                <div className="sales-summary-info">
                  <label className="sales-summary-label">
                    {i18n.t("phone")}
                  </label>
                  <p>{props.dataSale?.customer?.phone || "-"}</p>
                </div>
                <div className="sales-summary-info">
                  <label className="sales-summary-label">
                    {i18n.t("email")}
                  </label>
                  <p>{props.dataSale?.customer?.email || "-"}</p>
                </div>
                <div className="sales-summary-info">
                  <label className="sales-summary-label">
                    {i18n.t("address")}
                  </label>
                  <p>{props.dataSale?.customer?.address || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Row>
        <Col
          md={6}
          className="d-flex flex-column justify-content-center align-items-center"
        >
          {!isPaid ? <></> : renderResult()}
        </Col>
      </Row>
      {isOpenReceipt && (
        <Receipt
          isOpen={isOpenReceipt}
          data={props?.dataSale}
          onClose={() => {
            setIsOpenReceipt(false);
          }}
        />
      )}
    </React.Fragment>
  );
};

Payment.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
  handleReload: PropTypes.func,
  dataSale: PropTypes.object,
};

export default withRouter(Payment);
