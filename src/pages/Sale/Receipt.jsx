import { useEffect, useRef, useState } from "react";
import { Col, Label, Modal, Row } from "reactstrap";
import { useAppSelector } from "../../hook/store.hook";
import moment from "moment";
import { convertToWords, formatNumberAsCurrency, readThreeDigits } from "../../utils/app";
import saleService from "../../services/sale.service";
import   { usePDF }  from 'react-to-pdf';

function Receipt({ isOpen, data, onClose }) {
  const { operator } = useAppSelector((state) => state.operator);
  const [receiptCode, setReceiptCode] = useState("");
  const { toPDF, targetRef } = usePDF({filename: 'page.pdf'});
  const handleGeneratePdf = async () => {
    toPDF();
    await saleService.updateDetailReceiptCode(data.location.id);
  };
  const getDetailReceiptCode = async () => {
    try{
      const res = await saleService.getDetailReceiptCode(data.location.id);
    setReceiptCode(res.data);
    }catch (error) {
      console.log("error", error);
    }
  };
// console.log('data',data)
  useEffect(() => {
    if (isOpen) {
      getDetailReceiptCode();
      setTimeout(() => {
        handleGeneratePdf();
      }, 2000);
    }
  }, [isOpen, operator ]);
  return (
    <Modal
      isOpen={isOpen}
      centered
      size="xl"
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
    >
       
            <div
        ref={targetRef}
        id="reportTemplateRef"
        className="receipt"
        style={{
          display: "flex",
          background: "white",
          flexDirection: "column",
          width: "100%",
          padding: 50,
          paddingBottom: 100,
        }}
      >
        <Row>
          <Col md={4}>
            <img
              height={150}
              width={150}
              src={operator.logo_path}
              alt="My logo"
            />
          </Col>
          <Col md={1}></Col>
          <Col md={7}>
            <div
              className="d-flex"
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="name-ope text-center" style={{ fontSize: 32 }}>
                {operator.name}
              </div>
              <div
                className="adddress-ope text-center"
                style={{ fontSize: 18 }}
              >
                Địa chỉ: {operator.address}
              </div>
              {/* <a style={{ fontSize: 18 }}>Website:</a> */}
            </div>
          </Col>
        </Row>
        {/* </div> */}
        <Row className="mt-4">
          <div
            className="d-flex text-center"
            style={{ flexDirection: "column" }}
          >
            <div style={{ fontSize: 24, fontWeight: "600" }}>
              PHIẾU THU TIỀN - RECEIPT
            </div>
            <div style={{ fontSize: 16 }}>
              Mã phiếu thu : {receiptCode} <br />
              Ngày thu: {moment().format("DD/MM/YYYY")} <br />
              Chi nhánh: {data.location.name}
            </div>
          </div>
        </Row>
        <Row className="mt-1">
          <Label>Mã hội viên/MemberID:</Label>
        </Row>
        <Row>
          <div className="ml-1">{data.customer.id}</div>
        </Row>
        <Row className="mt-1">
          <Label>Họ và tên/Member name:</Label>
        </Row>
        <Row>
          <div className="ml-1">
            {data?.customer?.last_name} {data?.customer?.first_name} 
          </div>
        </Row>
        <Row className="mt-1">
          <Label>Email:</Label>
        </Row>
        <Row>
          <div className="ml-1">{data?.customer?.email}</div>
        </Row>
        <Row className="mt-1">
          <Label>Số điện thoại/Phone number:</Label>
        </Row>
        <Row>
          <div className="ml-1">{data?.customer?.phone}</div>
        </Row>
        <div className="member-info mt-1">
          <table
            // bordered
            className="bg-white border-receipt"
            style={{ border: "1px solid black" , width: "100%"}}
          >
            <tbody>
              <tr>
                <td className="font-medium w-50 p-3">Gói dịch vụ/Package</td>
                <td className="p-3">
                  {data.packages.map((item) => item?.package_name).join(", ")}
                </td>
              </tr>
              <tr>
                <td className="font-medium w-50 p-3">
                  Lý do thu/Payment reason
                  <div className="text-gray-500 text-sm"></div>
                </td>
                <td className="p-3"></td>
              </tr>
              <tr>
                <td className="font-medium w-50 p-3">
                  Số tiền/Total money number
                </td>
                <td className="p-3">{formatNumberAsCurrency(data?.total_amount)}</td>
              </tr>
              <tr>
                <td className="font-medium w-50 p-3">
                  Số tiền bằng chữ/Total money writing
                  <div className="text-gray-500 text-sm"></div>
                </td>
                <td className="p-3">
                  {convertToWords(Number(data?.total_amount) | 0)}
                </td>
              </tr>
              {/* <tr>
                <td className="font-medium w-50 p-3">
                  PTTT/Payment by
                  <div className="text-gray-500 text-sm"></div>
                </td>
                <td className="p-3">
                  {listPaymentMethod[data?.payment_method].label}
                </td>
              </tr> */}
              <tr>
                <td className="font-medium w-50 p-3">
                  Điều khoản
                  <div className="text-gray-500 text-sm"></div>
                </td>
                <td className="p-3">{data?.clause}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <section className="package-details mb-4" style={{paddingBottom:50}}>
          <div className="">Ghi chú:</div>
          <div>
            {data?.note?.length > 0
              ? data.note
              : ""}
          </div>
        </section>

        <div className="payment-info">
          <Row className="mb-4">
            <Col md={4}>
              <div
                className="d-flex text-center"
                style={{ flexDirection: "column" }}
              >
                <div>
                  Người nộp/
                  <br />
                  Member
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div
                className="d-flex text-center"
                style={{ flexDirection: "column" }}
              >
                <div>
                  Nhân viên lễ tân/
                  <br />
                  Advisor Staff
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div
                className="d-flex text-center"
                style={{ flexDirection: "column" }}
              >
                <div>
                  Quản lý/
                  <br />
                  Manager
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
}

export default Receipt;
