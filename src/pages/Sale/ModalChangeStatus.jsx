import React from "react";
import {
  Button,
  Col,
  Input,
  Label,
  Modal,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import MyDropdown from "../../components/Common/MyDropdown";
import { listPaymentMethod } from "../../constants/app.const";

const ModalChangeStatus = ({ isOpen, toggle, onConfirm, status }) => {
  const [selectedStatus, setSelectedStatus] = React.useState(status);
  const [name, setName] = React.useState("");

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Thay đổi trạng thái</ModalHeader>
      <div className="p-4">
        <Row>
          <Col md={4}>
            <Label>Phương thức thanh toán</Label>
          </Col>
          <Col md={8}>
            <MyDropdown
              options={listPaymentMethod}
              selected={selectedStatus}
              setSelected={setSelectedStatus}
            />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col md={4}>
            <Label>Tên Phuơng thức</Label>
          </Col>
          <Col md={8}>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên"
            />
          </Col>
        </Row>
      </div>
      <ModalFooter>
        <Button color="primary" onClick={() => onConfirm(selectedStatus, name)}>
          Xác nhận
        </Button>
        <Button color="secondary" onClick={toggle}>
          Hủy
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalChangeStatus;
