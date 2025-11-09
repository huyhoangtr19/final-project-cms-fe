import { Button, Col, Modal, ModalFooter, ModalHeader, Row } from "reactstrap";
import i18n from "../../i18n";
import { convertHtmlToTextContent } from "../../utils/app";
import moment from "moment";

const ModalNotice = ({ isOpen, onClose, isUnread, noticeInfo = null }) => {
  // const titleModal = useMemo(()=>{

  // },[isUnread])
  return (
    <Modal
      isOpen={isOpen}
      autoFocus={true}
      centered
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
    >
      <div className="modal-content border-0">
        <ModalHeader
          className="border-bottom-0 py-2 bg-light"
          toggle={() => {
            onClose();
          }}
        >
          {i18n.t("notification_detail")}
        </ModalHeader>
        <div className="py-2">
          <div className="d-flex flex-column gap-3 p-3">
            <h5 className="text-start">{noticeInfo?.title}</h5>

            <Row className="mt-2">
              <div>{convertHtmlToTextContent(noticeInfo?.body || "")}</div>
            </Row>
            <Row className="mt-2">
              <div className="d-flex gap-2">
                <label>{i18n.t("create_date")}:</label>
                <div>
                  {moment(noticeInfo?.created_at).format("DD/MM/yyyy HH:mm:ss")}
                </div>
              </div>

              <div className="d-flex gap-2">
                <label>{i18n.t("class_name")}:</label>
                <div>{noticeInfo?.data?.class_name}</div>
              </div>

              <div className="d-flex gap-2">
                <label>{i18n.t("location_name")}:</label>
                <div>{noticeInfo?.data?.location_name}</div>
              </div>
            </Row>
          </div>
        </div>
        <ModalFooter className="bg-light py-2">
          <div className="d-flex flex-row justify-content-end gap-3">
            <Button
              color="success"
              outline
              className="px-3 btn-back"
              onClick={onClose}
            >
              {i18n.t("back")}
            </Button>

            {/* <button
              className="btn btn-primary btn-block px-3 d-flex gap-1"
              type="submit"
              disabled={!isChanged && serviceInfo}
              // onClick={handleSubmitForm}
              style={{
                display: !update_info && serviceInfo ? "none" : "block",
              }}
            >
              <div className="">
                {serviceInfo ? i18n.t("update") : i18n.t("save")}
              </div>
            </button> */}
          </div>
        </ModalFooter>
      </div>
    </Modal>
  );
};

export default ModalNotice;
