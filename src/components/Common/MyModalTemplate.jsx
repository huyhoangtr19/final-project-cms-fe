// Function Name : Modal Component
// Created date :  25/7/24             by :  NgVinh
// Updated date :                      by :
import React from "react";
import { Modal, ModalHeader } from "reactstrap";

const MyModalTemplate = ({ isOpen, onClose, title = "", children, size = "md" }) => {
  return (
    <Modal
      isOpen={isOpen}
      role="dialog"
      autoFocus={true}
      centered
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
      // style={{ width: 400 }}
      size={size} // Better for reactivity
    >
      <div>
        <ModalHeader
          className="border-bottom-0"
          toggle={() => {
            onClose();
          }}
        >
          {title}
        </ModalHeader>
      </div>
      <div className="modal-body pt-0">
        <div className="text-center">
          {/* <div className="avatar-md mx-auto mb-4">
            <div className="avatar-title bg-light  rounded-circle text-primary h1">
              <i className="mdi mdi-email-open"></i>
            </div>
          </div> */}
          {children}
          {/* <div className="row justify-content-center">
            <div className="col-xl-10">
              <h4 className="text-primary">Subscribe !</h4>
              <p className="text-muted font-size-14 mb-4">
                Subscribe our newletter and get notification to stay update.
              </p>

              <div className="input-group rounded bg-light">
                <Input
                  type="email"
                  className="form-control bg-transparent border-0"
                  placeholder="Enter Email address"
                />
                <Button color="primary" type="button" id="button-addon2">
                  <i className="bx bxs-paper-plane"></i>
                </Button>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </Modal>
  );
};

export default MyModalTemplate;
