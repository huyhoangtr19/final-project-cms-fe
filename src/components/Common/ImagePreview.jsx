import React, { useState } from "react";
import styled from "styled-components";
import IcDel from "../../assets/icon/IcDel";
import IcWhiteEye from "../../assets/icon/IcWhiteEye";
import { Modal, ModalBody } from "reactstrap";
const ImagePre = styled.img`
  width: 143px;
  height: 160px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  object-fit: cover;
  border-radius: 5px;
`;
const ImageShow = styled.img`
  object-fit: cover;
  border-radius: 5px;
`;
const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const Hover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImagePreview = ({ image, handleDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const handleShow = () => {
    setIsShow(true);
    console.log("show");
  };
  return (
    <Container
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ImagePre src={image} alt="preview" />
      {isHovered && (
        <Hover className="hover-overlay">
          <div className="d-flex gap-2">
            <div onClick={handleShow}>
              <IcWhiteEye />
            </div>
            <div className="icon square" onClick={handleDelete}>
              <IcDel />
            </div>
          </div>
        </Hover>
      )}
      {isShow && (
        <Modal
          isOpen={isShow}
          toggle={() => {
            setIsShow(false);
          }}
          centered={true}
        >
          <div className="modal-content">
            <div className="position-relative">
              <ImageShow src={image} width={500} height={510} />
              <button
                type="button"
                onClick={() => {
                  setIsShow(false);
                }}
                className="btn-close position-absolute end-0 top-0 m-3"
              ></button>
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default ImagePreview;
