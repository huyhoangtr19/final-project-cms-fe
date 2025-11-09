import React, { useState, forwardRef, useImperativeHandle } from "react";
import { QrReader } from "react-qr-reader";
import { Button, Input, Label } from "reactstrap";
import styled from "styled-components";
import operatorService from "../../services/operator.service";
import { toast } from "react-toastify";
import IcQR from "../../assets/icon/IcQR";
import moment from "moment";
import i18n from "../../i18n";

const MaskerBlur = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #00000054;
  z-index: 99999;
`;

const BoxSelectLocation = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 300px;
  background-color: #ffff;
  gap: 8px;
  padding: 16px;
`;

const BoxLocationContent = styled.div`
  overflow-y: auto;
  max-height: 400px;
`;

const RadioItem = styled.label`
  display: flex;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #556ee6;
  padding: 8px;
`;

const BoxCamera = styled.div`
  display: flex;
  flex-direction: column;
  width: 600px;
  height: 650px;
  background-color: #ffff;
`;

const FooterBoxCamera = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const QRCodeCheckInScanner = forwardRef(({
  showCamera = false,
  setShowCamera = () => { },
  onResult = () => { },
  hide = false,
}, ref) => {
  const [locations, setLocations] = useState([]);
  const [locationSelected, setLocationSelected] = useState(null);
  const [isShowModelSelectLocation, setIsShowModelSelectLocation] = useState(false);

  useImperativeHandle(ref, () => ({
    triggerCamera: () => {
      handleShowCamera();
    }
  }));

  const handleScan = (data) => {
    if (!data || !locationSelected) return;
    const dataDecode = JSON.parse(data.text)
    onResult({
      location_id: locationSelected.id,
      customer_id: dataDecode?.customer_id,
      expired_time: dataDecode?.expired_time,
    });
    setLocationSelected(null);
  };

  const handleShowCamera = () => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(async (devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        const hasCamera = videoDevices.length > 0;

        if (!hasCamera) {
          toast.error("Thiết bị của bạn không hỗ trợ camera!", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
          return;
        }

        try {
          await navigator.mediaDevices.getUserMedia({ video: true });

          const { data } = await getLocationsForUser();
          setLocations(data);
          if (data.length === 1) {
            setLocationSelected(data[0]);
            setShowCamera(true);
          } else {
            setIsShowModelSelectLocation(true);
          }
        } catch (error) {
          if (error.name === "NotAllowedError") {
            toast.error(
              "Bạn đã từ chối quyền truy cập camera. Vui lòng cho phép quyền truy cập để tiếp tục.",
              {
                position: "top-right",
                autoClose: 5000,
                theme: "light",
                hideProgressBar: true,
              }
            );
          } else {
            toast.error("Không thể truy cập camera: " + error.message, {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              hideProgressBar: true,
            });
          }
          setShowCamera(false);
        }
      })
      .catch((error) => {
        toast.error("Có lỗi khi kiểm tra thiết bị: " + error.message, {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      });
  };

  const getLocationsForUser = async () => {
    return await operatorService.getLocationsForUser();
  };

  const handleCloseModalSelectLocation = () => {
    setIsShowModelSelectLocation(false);
    setLocationSelected(null);
  };

  const handleNextStep = () => {
    setIsShowModelSelectLocation(false);
    setShowCamera(true);
  };

  return (
    <div>
      <div style={{display: hide ? "none" : "block"}}>
        <Button color="secondary" type="button" onClick={handleShowCamera}>
          <div className="d-flex align-items-center gap-2">
            <IcQR />
            <div className="" style={{ lineHeight: "17px" }}>
              QR Check in
            </div>
          </div>
        </Button>
      </div>

      {showCamera && (
        <MaskerBlur>
          <BoxCamera>
            <QrReader
              delay={1500}
              onResult={handleScan}
              style={{ width: "100%" }}
            />
            <FooterBoxCamera>
              <Button
                color="secondary"
                type="button"
                outline={true}
                onClick={() => setShowCamera(false)}
              >
                Stop Scanning
              </Button>
            </FooterBoxCamera>
          </BoxCamera>
        </MaskerBlur>
      )}

      {isShowModelSelectLocation && (
        <MaskerBlur>
          <BoxSelectLocation>
            <div className="d-flex justify-content-end">
              <button
                type="button"
                onClick={handleCloseModalSelectLocation}
                className="btn-close position-absolute end-0 top-0 m-3"
              ></button>
            </div>
            <div className="fw-bold text-center py-2">
              Please choose a location
            </div>
            <BoxLocationContent>
              {locations?.map((location) => (
                <RadioItem
                  htmlFor={`location-${location.id}`}
                  key={location.id}
                >
                  <Input
                    type="radio"
                    value={0}
                    id={`location-${location.id}`}
                    name={`location_id`}
                    className="form-check-input"
                    onChange={() => setLocationSelected(location)}
                  />
                  <div className="form-check-label font-size-13">
                    <div className="ps-2">{location.name}</div>
                  </div>
                </RadioItem>
              ))}
            </BoxLocationContent>
            <div className="d-flex justify-content-between">
              <Button
                color="secondary"
                size="md"
                type="button"
                className="px-4"
                outline={true}
                onClick={handleCloseModalSelectLocation}
              >
                {i18n.t("cancel")}
              </Button>
              <Button
                color="primary"
                type="button"
                size="md"
                className="px-4"
                disabled={!locationSelected}
                onClick={handleNextStep}
              >
                Next
              </Button>
            </div>
          </BoxSelectLocation>
        </MaskerBlur>
      )}
    </div>
  );
});

export default QRCodeCheckInScanner;
