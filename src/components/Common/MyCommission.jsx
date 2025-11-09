import { useState, useEffect } from "react";
import {
  Col,
  InputGroup,
  InputGroupText,
  Input,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported for reactstrap styles
/**
 * MyCommission component allows editing commission as percentage and VND value.
 * Both fields have onChange and onBlur handlers for value management.
 */

function MyCommission({
  idPercent,
  idMoney,
  disabled = false,
  valuePercent = 0,
  valueMoney = 0,
  onChangePercent,
  onChangeMoney,
  onBlurPercent,
  onBlurMoney,
  totalMoney = 0,
  currency = "VND", // Default currency is VND
}) {
  const [localPercent, setLocalPercent] = useState(() => {
    const val = Math.round((valuePercent || 0) * 100) / 100;
    return val.toString();
  });
  const [localMoney, setLocalMoney] = useState(() => {
    const num = parseInt(valueMoney || 0, 10);
    return num.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
  });

  const [isWritingPercent, setIsWritingPercent] = useState(false);
  const [isWritingMoney, setIsWritingMoney] = useState(false);

  const handlePercentChange = (e) => {
    if (isWritingMoney) return
    setIsWritingPercent(true);
    let val = Number(e.target.value);
    if (isNaN(val)) val = 0;
    if (val > 100) val = 100;
    if (val < 0) val = 0;

    setLocalPercent(val);
    // Calculate money based on percent
    const calcMoney = ((val / 100) * totalMoney);
    if (onChangePercent) onChangePercent({ ...e, target: { ...e.target, value: val } });
    if (onChangeMoney) onChangeMoney({ ...e, target: { ...e.target, value: calcMoney } });
  };

  // Handler for money input
  const handleMoneyChange = (e) => {
    if (isWritingPercent) return
    setIsWritingMoney(true);
    let val = e.target.value.replace(/\D/g, "");
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 0;
    if (num > totalMoney) num = totalMoney;
    if (num < 0) num = 0;
    setLocalMoney(num.toString());

    // Calculate percent based on money
    const calcPercent = totalMoney ? ((num / totalMoney) * 100) : 0;
    if (onChangeMoney) onChangeMoney({ ...e, target: { ...e.target, value: num } });
    if (onChangePercent) onChangePercent({ ...e, target: { ...e.target, value: calcPercent } });
  };

  useEffect(() => {
    if (onChangeMoney && !isWritingMoney && !isWritingPercent) {
      const calcMoney = ((valuePercent / 100) * totalMoney);
      onChangeMoney({
        target: { value: calcMoney }
      });
    }
  }, [valuePercent, totalMoney]);

  useEffect(() => {
    if (!isWritingPercent) {
      const rounded = Math.round(valuePercent * 100) / 100;
      setLocalPercent(rounded.toString());
    }
  }, [valuePercent, isWritingPercent]);

  useEffect(() => {
    if (!isWritingMoney) {
      const num = parseInt(valueMoney || 0, 10);
      setLocalMoney(num.toLocaleString("vi-VN", { maximumFractionDigits: 2 }));
    }
  }, [valueMoney]);

  return (
    <div className="align-items-center">
      <div className="d-flex flex-column flex-md-row w-full gap-1">
        {/* Percentage Input Group */}
        <Col md={5}>
          <InputGroup className="w-auto ">
            <Input
              id={idPercent}
              type="number"
              max={100}
              min={0}
              disabled={disabled}
              step={0.01}
              value={localPercent}
              onChange={handlePercentChange}
              onFocus={(e) => e.target.select()}
              onBlur={(e) => {
                setIsWritingPercent(false);

                const val = parseFloat(localPercent);
                const rounded = isNaN(val) ? 0 : Math.round(val * 100) / 100;
                setLocalPercent(rounded.toString());

                const num = parseInt(localMoney.replace(/\D/g, ""), 10) || 0;
                const formatted = num.toLocaleString("vi-VN", {
                  maximumFractionDigits: 2,
                });

                setLocalMoney(formatted);
                onBlurPercent(e);
              }}
              style={{
                // maxWidth: "80px",
                textAlign: "right",
                minWidth: "40px",
                padding: "6px 4px",
              }} // Adjust width as needed
              className="form-control"
            />
            <InputGroupText>%</InputGroupText>
          </InputGroup>
        </Col>

        {/* VND Input Group */}
        <Col md={7}>
          <InputGroup>
            <Input
              id={idMoney}
              type="text" // Use text to allow for comma formatting
              value={localMoney}
              disabled={disabled}
              onChange={handleMoneyChange}
              onFocus={(e) => {
                setLocalMoney(e.target.value.replace(/\D/g, ""))
              }}
              onBlur={(e) => {
                setIsWritingMoney(false);

                const num = parseInt(localMoney.replace(/\D/g, ""), 10) || 0;
                const formatted = num.toLocaleString("vi-VN", {
                  maximumFractionDigits: 2,
                });
                setLocalMoney(formatted);
                onBlurMoney(e);
              }}
              style={{
                // maxWidth: "120px",
                textAlign: "right",
                padding: "6px 4px",
              }} // Adjust width as needed
              className="form-control"
            />
            <InputGroupText>{currency}</InputGroupText>
          </InputGroup>
        </Col>
      </div>
    </div>
  );
}

export default MyCommission;
