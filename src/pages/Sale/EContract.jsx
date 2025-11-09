import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import withRouter from "../../components/Common/withRouter";
import { Button, Col, Row } from "reactstrap";
import i18n from "../../i18n";
import saleService from "../../services/sale.service";
import { STATUS_SALE_ORDER_CONTRACT } from "../../constants/app.const";
import { toast } from "react-toastify";

const EContract = (props) => {
  const iframeRef = useRef(null);

  const [hasContract, setHasContract] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isExecutable, setIsExecutable] = useState(true);

  const getStatusEContract = async (id) => {
    return await saleService.getStatusEContract(id);
  };
  const previewEContract = async (id) => {
    if (hasContract) {
      return await saleService.previewEContract(id);
    }
    return null;
  };
  const handleCreateEContract = async () => {
    if (!hasContract && props.dataSale?.id) {
      const response = await saleService.createEContract(props.dataSale.id);
      console.log("create contract:", response);
      if (response?.data?.Data) {
        setHasContract(true);
      } else {
        toast.error(i18n.t("create_contract_fail"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    }
    return null;
  };
  const handleUpdateEContract = async () => {
    if (hasContract && props.dataSale?.id) {
      const response = await saleService.updateEContract(props.dataSale.id);
      console.log("update contract: ", response);
      await handleSetDataPreview(props.dataSale.id);
    }
    return null;
  };
  const handleStatusContract = async (id) => {
    const response = await getStatusEContract(id);
    if (response?.data?.Data) {
      const data = response.data.Data;
      setHasContract(true);
      setCompleted(data.contractStatus == STATUS_SALE_ORDER_CONTRACT.COMPLETED);
    } else {
      if (response?.message == "get_token_fail") {
        setIsExecutable(false);
      }
    }
  };
  const previewPdf = (base64) => {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters, (char) =>
      char.charCodeAt(0)
    );
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    if (iframeRef.current) {
      iframeRef.current.src = blobUrl;
    }
  };
  const handleSetDataPreview = async (id) => {
    const response = await previewEContract(id);
    console.log("res", response)
    if (response?.data?.Data) {
      previewPdf(response.data.Data);
    } else {
      toast.error(i18n.t("preview_contract_fail"), {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        hideProgressBar: true,
      });
    }
    return null;
  };

  useEffect(() => {
    if (props.dataSale?.id) {
      handleStatusContract(props.dataSale.id);
    }
  }, [props.dataSale?.id]);

  useEffect(() => {
    if (props.dataSale?.id && hasContract) {
      handleSetDataPreview(props.dataSale.id);
    }
  }, [props.dataSale?.id, hasContract]);

  return (
    <React.Fragment>
      <div className="d-flex flex-row gap-2"
        style={{ height: "calc(100dvh - 103px)" }}
      >
        <div
          style={{ flex: "1", border: "1px solid #9b9b9bff", borderRadius: "2px" }}
        >
          <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="PDF Preview"
          />
        </div>

        <div className="sales-card" style={{ height: "max-content" }}>
          <div className="sales-card-body">
            <div className="mt-1 ">
              <div>
                <h5>{i18n.t("e_contract_preview")}</h5>
              </div>

              <div className="mt-3 flex-1 text-center">
                <div className="d-flex flex-column justify-content-center align-items-center mb-2">
                  {completed
                    ? i18n.t("contract_completed")
                    : i18n.t("contract_sent", {
                      name:
                        props.dataSale?.customer?.first_name +
                        " " +
                        props.dataSale?.customer?.last_name,
                    })}
                </div>
              </div>
            </div>

            <div>
              <div className="d-flex flex-column">
                <div className="d-flex flex-row" style={{ justifyContent: "space-between" }}>
                  <div>
                    Contact ID
                  </div>
                  <strong>
                    Null
                  </strong>
                </div>

                <div className="d-flex flex-row" style={{ justifyContent: "space-between" }}>
                  <div>
                    Client name
                  </div>
                  <strong>
                    name
                  </strong>
                </div>
              </div>

              <div className="d-flex flex-row" style={{ justifyContent: "space-between" }}>
                <div>
                  Order total
                </div>
                <strong>
                  {props.dataSale?.total_amount}{" "}{ }
                </strong>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-4 mt-3">
              <Button
                color="success"
                className="px-4 btn-back"
                type="button"
                onClick={() => { props.router.navigate("/sale") }}
                outline
              >
                {i18n.t("back")}
              </Button>

              <Button color="primary" type="submit" onClick={props.onNext}>
                {i18n.t("payment")}
              </Button>
            </div>
            <div className="my-3">
              <div>
                {!hasContract && isExecutable ? (
                  <Button color="primary" onClick={handleCreateEContract}>
                    {i18n.t("send_for_client")}
                  </Button>
                ) : (
                  <Button color="primary" onClick={() => { handleUpdateEContract() }}>
                    {i18n.t("update")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

EContract.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
  onNext: PropTypes.func,
  onPrev: PropTypes.func,
  dataSale: PropTypes.object,
};

export default withRouter(EContract);