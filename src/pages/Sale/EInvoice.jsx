import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Table } from "reactstrap";
import PropTypes from "prop-types";
import moment from "moment";
import i18n from "../../i18n";
import { useParams } from "react-router-dom";
import viettelService from "../../services/viettel.service";
import PdfViewer from "./PdfViewer";
import { toast } from "react-toastify";
import ModalChangeStatus from "./ModalChangeStatus";
const EInvoice = (props) => {
  const { history, dataSale, isActive } = props;
  const { id } = useParams();
  // console.log("EInvoice props:", props.dataSale);
  const [logInvoices, setLogInvoices] = useState([]);
  const [currentInvoices, setCurrentInvoices] = useState(null);
  const [configDetail, setConfigDetail] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const currencyCode = useMemo(() => {
    if (!dataSale?.location) {
      return "";
    } else {
      return dataSale.location?.currency_code || "VND";
    }
  }, [dataSale?.location]);

  const handleGetInVoices = async () => {
    try {
      const response = await viettelService.getInVoices(id);
      console.log("Invoices data:", response.data);
      setCurrentInvoices(response.data[0] || null);
      getFiles(response.data[0]?.invoice_number);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleGetInVoicesLog = async () => {
    try {
      const response = await viettelService.getLogInVoices(id);
      console.log("Invoice logs data:", response.data);
      if (response.success) {
        setLogInvoices(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching invoice logs:", error);
    }
  };

  const handleGetConfig = async () => {
    try {
      const response = await viettelService.getConfigViettel(
        dataSale?.location?.id
      );
      setConfigDetail(response.data);
    } catch (error) {
      console.error("Error fetching Viettel config:", error);
    }
  };
  const getFiles = async (invoice_no) => {
    try {
      const response = await viettelService.getInVoiceFiles({
        invoice_no: invoice_no,
        sale_order_id: id,
      });
      console.log("Invoice files data:", response.data);
              const fileToBytes = response.data.fileToBytes;

        if (fileToBytes) {
          // Chuyển đổi chuỗi base64 thành một Blob
          // Bất cứ khi nào bạn thấy "JVBERi0xLjQK" thì nó luôn là header của một file PDF base64
          const byteCharacters = atob(fileToBytes);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setFileBlob(url);
        } else {
          console.log('Không có dữ liệu file PDF.');
        }
      // Handle the response data as needed
    } catch (error) {
      console.error("Error fetching invoice files:", error);
    }
  };
  const downloadPDF = ()=>{
    const link = document.createElement('a');
      link.href = fileBlob;
      link.download = 'invoice.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const sendMail = async () => {
    try {
      const response = await viettelService.sendMail({
        sale_order_id: id,
        transaction_id: currentInvoices?.transaction_uuid,
      });
      console.log("Send mail response:", response);
      if(response.success) {
        // alert("Email đã được gửi thành công!");
        toast.success("Email đã được gửi thành công!",{
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
      }
    } catch (error) {
      console.log("Error sending mail:", error);
      toast.error("Gửi email thất bại!", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        hideProgressBar: true,
      });
    }
  }

  const handleUpdateStatus = async (select, name)=>{
    try {
      const response = await viettelService.updatePaymentStatus({
        sale_order_id: id,
        invoice_no: currentInvoices?.invoice_number,
        payment_type: select,
        payment_type_name: name
      });
      setIsOpen(false)
      if(response.success) {
        toast.success('Cập nhật phương thức thanh toán thành công',{
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
      console.log('res',response);
    } catch (error) {
      console.log('Error updating status:', error);
      toast.error('Cập nhật phương thức thanh toán không thành công',{
         position: "top-right",
        autoClose: 5000,
        theme: "light",
        hideProgressBar: true,
      })
    }
  }

  const logsActivityTitle = (type) => {
    switch (type) {
      case "CREATE_ATTEMPT":
        return i18n.t("invoice.CREATE_ATTEMPT");
      case "CREATE_SUCCESS":
        return i18n.t("invoice.CREATE_SUCCESS");
      case "CREATE_FAILED":
        return i18n.t("invoice.CREATE_FAILED");
      case "RETRY":
        return i18n.t("invoice.RETRY");
      case "CANCEL":
        return i18n.t("invoice.CANCEL");
      case "MANUAL_RETRY":
        return i18n.t("invoice.MANUAL_RETRY");
      default:
        return i18n.t("invoice.unknown_activity");
    }
    // 'CREATE_ATTEMPT', 'CREATE_SUCCESS', 'CREATE_FAILED', 'RETRY', 'CANCEL', 'MANUAL_RETRY'
  };

  useEffect(() => {
    if (id && isActive) {
      handleGetInVoices();
      handleGetInVoicesLog();
      handleGetConfig();
    }
  }, [id, isActive]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Row className="gap-6">
        {/* Left Column - Order Info & Payment Status */}
        <Col md={5} className="">
          {/* Order Information */}

          <div className="sales-card mb-4">
            <div className="sales-card-header">
              <h5 className="sales-card-title">Thông Tin Đơn Hàng</h5>
            </div>
            <Row className="sales-card-body d-flex flex-col">
              <Col md={6} className="space-y-4">
                <div className="d-flex justify-content-between w-full">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="sale-bold">
                    {dataSale?.customer?.first_name +
                      " " +
                      dataSale?.customer?.last_name}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="sale-bold">
                    {dataSale?.customer?.phone || ""}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="sale-bold">Email:</span>
                  <span className="sale-bold text-blue-600">
                    {dataSale?.customer?.email || ""}
                  </span>
                </div>
              </Col>

              <Col md={6} className="space-y-4">
                <div className="d-flex justify-content-between">
                  <span className="text-gray-600">
                    Gói tập 6 tháng Premium:
                  </span>
                  <span className="sale-bold">
                    {Number(dataSale?.total_amount || 0).toLocaleString(
                      "vi-VN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-gray-600">Chiết khấu VIP:</span>
                  <span className="sale-bold text-red-600">-0đ</span>
                </div>
                <div className="d-flex justify-content-between border-t ">
                  <span className="text-gray-800 font-semibold">
                    Tổng cộng:
                  </span>
                  <span className="sale-bold text-danger text-lg">
                    {Number(dataSale?.total_amount || 0).toLocaleString(
                      "vi-VN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                    đ
                  </span>
                </div>
              </Col>
            </Row>
          </div>

          {/* Payment Status */}
          <div className="sales-card mb-4">
            <div className="sales-card-header">
              <h5 className="sales-card-title">Trạng Thái Thanh Toán</h5>
            </div>

            <Row className="sales-card-body">
              <div className="flex items-center gap-3">
                {/* <CheckCircle className="w-6 h-6 text-green-600" /> */}
                <div
                  style={{
                    backgroundColor: "rgba(20, 243, 109, 0.1)",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                >
                  <h3 className="font-semibold text-green-800">
                    {dataSale?.paid_amount >=
                    Number(dataSale?.total_amount || 0)
                      ? "Đã thanh toán đầy đủ"
                      : "Chưa thanh toán đầy đủ"}
                  </h3>
                  <p className="text-green-600 text-sm">
                    Thanh toán {dataSale?.payment_histories?.length} lần - Tổng:{" "}
                    {((dataSale?.paid_amount) ?? 0).toLocaleString("vi-VN", {
                      maximumFractionDigits: 2,
                    })}
                    đ
                  </p>
                </div>
              </div>
            </Row>

            {dataSale?.payment_histories &&
              dataSale?.payment_histories?.length > 0 && (
                <div className=" p-2">
                  {(dataSale?.payment_histories?.length
                    ? dataSale.payment_histories
                    : []
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        borderLeft: "4px solid rgb(20, 243, 109)",
                        borderRadius: "12px",
                        backgroundColor: "rgba(137, 143, 139, 0.1)",
                      }}
                    >
                      <div className="d-flex flex-column gap-1">
                        <p
                          className="sale-bold text-xl"
                          style={{ fontSize: "18px" }}
                        >
                          {idx === 0 && dataSale.payment_histories.length > 1
                            ? "Tiền đặt cọc"
                            : "Thanh toán"}{" "}
                        </p>
                        <span className="text-gray-600">
                          {item.paid_at
                            ? moment(item.paid_at).format(
                                "HH:mm:ss DD/MM/YYYY "
                              )
                            : ""}
                          -{item?.payment_type}
                        </span>
                      </div>

                      <div
                        className="sale-bold"
                        style={{
                          color: "rgb(20, 243, 109)",
                          fontSize: "1rem",
                        }}
                      >
                        {item.amount.toLocaleString("vi-VN", {
                          maximumFractionDigits: 2,
                        }) +
                          " " +
                          currencyCode || ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Electronic Invoice History */}
          <div className="sales-card mb-4">
            <div className="sales-card-header">
              <h5 className="sales-card-title">Lịch Sử Hóa Đơn Điện Tử</h5>
            </div>

            <Row className="sales-card-body ">
              {logInvoices.length > 0 &&
                logInvoices.map((item, index) => (
                  <div className="sale-card-items mb-2" key={index}>
                    {/* <CheckCircle className="w-5 h-5 text-green-600 mt-1" /> */}
                    <div className="flex-1">
                      <h3 className="font-medium text-green-800">
                        {logsActivityTitle(item?.action)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mã hóa đơn: {item?.invoice?.transaction_uuid} - Số tiền:{" "}
                        {Number(
                          item?.invoice?.total_paid_amount
                        ).toLocaleString("vi-VN", {
                          maximumFractionDigits: 2,
                        })}
                        đ
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item?.invoice?.issue_date}
                      </p>
                    </div>
                  </div>
                ))}

              {/* <div className="sale-card-items mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800">
                    Gửi email thành công
                  </h3>
                  <p className="text-sm text-gray-600">
                    Đã gửi hóa đơn tới: nguyenminh@email.com
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    18/08/2025 14:31:10
                  </p>
                </div>
              </div> */}
            </Row>
          </div>
        </Col>

        {/* Right Column - Invoice Details & Actions */}
        <Col md={7} className="">
          {/* Electronic Invoice */}
          <div className="sales-card mb-4 ">
            <div className="sales-card-header">
              <h5 className="sales-card-title ">Hóa Đơn Điện Tử</h5>
            </div>

            <Row className="sales-card-body ">
              {/* <button
                className="btn btn-outline d-flex justify-content-center align-items-center p-3 mb-4 bg-green-500 rounded-lg"
                style={{
                  // backgroundColor: "rgba(21, 245, 111, 0.99)",
                  // color: "white",
                  borderRadius: "8px",
                }}
              >
                <span className="sale-bold " style={{ fontSize: "18px" }}>
                  ĐÃ PHÁT HÀNH
                </span>
              </button> */}

              <div className="space-y-3 text-sm">
                <div className="d-flex  justify-content-between">
                  <span className="opacity-90">Mã hóa đơn:</span>
                  <span className="sale-bold">
                    {currentInvoices?.invoice_number || ""}
                  </span>
                </div>
                <div className="d-flex  justify-content-between">
                  <span className="opacity-90">Ngày phát hành:</span>
                  <span className="sale-bold">
                    {currentInvoices?.issue_date || ""}
                  </span>
                </div>
                <div className="d-flex  justify-content-between">
                  <span className="opacity-90">Số tiền:</span>
                  <span className="sale-bold">
                    {Number(currentInvoices?.total_paid_amount)?.toLocaleString(
                      "vi-VN",
                      {
                        maximumFractionDigits: 2,
                      }
                    ) || ""}
                    đ
                  </span>
                </div>
                <div className="d-flex  justify-content-between">
                  <span className="opacity-90">MST:</span>
                  <span className="sale-bold">
                    {configDetail?.supplier_tax_code}
                  </span>
                </div>
                <div className="d-flex  justify-content-between">
                  <span className="opacity-90">Mã giao dịch:</span>
                  <span className="sale-bold">
                    {currentInvoices?.transaction_uuid || ""}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-column gap-3 mt-4">
                {/* <button className="btn btn-outline w-full py-2  sale-bold">
                  Xem Hóa Đơn
                </button> */}
                <button className="btn btn-outline w-full py-2  sale-bold" onClick={downloadPDF}>
                  {/* <Download className="w-4 h-4" /> */}
                  Tải PDF
                </button>
                <button className="btn btn-outline w-full py-2  sale-bold" onClick={sendMail}>
                  {/* <Mail className="w-4 h-4" /> */}
                  Gửi Email
                </button>
                <button className="btn btn-outline w-full py-2 sale-bold" onClick={()=>setIsOpen(true)}>
                  {/* <RefreshCw className="w-4 h-4" /> */}
                  Cập Nhật
                </button>
                <button className="btn btn-outline w-full py-2  sale-bold">
                  {/* <XCircle className="w-4 h-4" /> */}
                  Hủy Hóa Đơn
                </button>
              </div>
            </Row>
          </div>

          {/* Quick Actions */}
          <div className="sales-card mb-4 " style={{display:'none'}}>
            <div className="sales-card-header">
              <h5 className="sales-card-title ">Thao Tác Nhanh</h5>
            </div>

            <Row className="sales-card-body">
              <button className="btn btn-outline w-full py-2 rounded  sale-bold mb-2">
                {/* <Search className="w-4 h-4" /> */}
                Kiểm Tra Trạng Thái
              </button>
              <button className="btn btn-outline w-full py-2 rounded  sale-bold">
                {/* <Plus className="w-4 h-4" /> */}
                Tạo Hóa Đơn Thay Thế
              </button>
            </Row>
          </div>
          <div className="sales-card mb-4 ">
            <div className="sales-card-header">
              <h5 className="sales-card-title ">Trạng thái hệ thống</h5>
            </div>

            <Row className="sales-card-body">
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span className="opacity-90">Kết nối Viettel:</span>
                  <span
                    className="sale-bold text-white p-2"
                    style={{ backgroundColor: "#28a745", borderRadius: "12px" }}
                  >
                    {configDetail ? 'ONLINE' : 'OFFLINE' }
                    
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="opacity-90">Cấu hình Location:</span>
                  <span
                    className="sale-bold text-white p-2 text-uppercase"
                    style={{ backgroundColor: "#28a745", borderRadius: "12px" }}
                  >
                    {configDetail?.is_active === 1 ? i18n.t("active") : i18n.t("inactive")}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="opacity-90">Tự động tạo HĐ:</span>
                  <span
                    className="sale-bold text-white p-2 text-uppercase"
                    style={{ backgroundColor: "#17a2b8", borderRadius: "12px" }}
                  >
                    {configDetail?.auto_issue_enabled === 1 ? "Đã bật" : "Tắt"}
                  </span>
                </div>
                {/* <div className="d-flex justify-content-between">
                  <span className="opacity-90">Hạn mức HĐ:</span>
                  <span
                    className="sale-bold text-black p-2"
                    style={{ backgroundColor: "#ffc107", borderRadius: "12px" }}
                  >
                    1245/5000
                  </span>
                </div> */}
              </div>
            </Row>
          </div>
        </Col>
      </Row>
      <ModalChangeStatus isOpen={isOpen} toggle={()=>setIsOpen(false)} onConfirm={handleUpdateStatus} status={currentInvoices} />
      {/* <PdfViewer fileBlob={fileBlob} /> */}
    </div>
  );
};
EInvoice.propTypes = {
  history: PropTypes.object,
  dataSale: PropTypes.object,
  isActive: PropTypes.bool,
};

export default EInvoice;
