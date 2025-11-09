import { Input } from "reactstrap";
import i18n from "../../i18n";
import { useState } from "react";
import InputCurrency from "../../components/Common/InputCurrency";
import { TIER_COMMISSION_KIND, TIER_KIND } from "../../constants/app.const";
import styled from "styled-components";
import { round } from "lodash";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const PolicyTierCard = (props) => {
  const [isPercentage, setIsPercentage] = useState(
    props.validation.values.tiers[props.index]?.commission_kind === TIER_COMMISSION_KIND.RATE
  );

  const handleDeleteTierClick = () => {
    props.validation.setFieldValue("tiers",
      props.validation.values.tiers.filter((_, i) => i !== props.index)
    );
  };

  const handlePercentChange = (value) => {
    // Prevent values that aren't in [0..100]
    if (value === "") {
      props.validation.setFieldValue(`tiers[${props.index}].commission_percent`, "");
      props.validation.setFieldValue(`tiers[${props.index}].commission_value`, "");
      return;
    }

    value = parseFloat(value);

    if (isNaN(value) || value < 0) value = 0;
    if (value > 100) value = 100;

    props.validation.setFieldValue(`tiers[${props.index}].commission_percent`, value);
    props.validation.setFieldValue(`tiers[${props.index}].commission_value`, value);
  };

  return (
    <div className="tier-card-container">
      <div
        className="delete"
        onClick={() => handleDeleteTierClick()}
      >
        <i className="fa fa-times" />
      </div>
      <div className="global-inputs">
        <div>
          <label
            htmlFor="name"
            className="form-label"
          >
            {i18n.t("tier_name")}
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={props.validation.values.tiers[props.index]?.name}
            placeholder={i18n.t("tier_name")}
            onChange={(e) => props.validation.setFieldValue(`tiers[${props.index}].name`, e.target.value)}
            onBlur={props.validation.handleBlur}
            invalid={
              props.validation.errors.tiers &&
              props.validation.touched.tiers &&
              props.validation.errors.tiers[props.index]?.name &&
              props.validation.touched.tiers[props.index]?.name
            }
          />
          {props.validation.errors.tiers &&
            props.validation.touched.tiers &&
            props.validation.errors.tiers[props.index]?.name &&
            props.validation.touched.tiers[props.index]?.name && (
              <InvalidFeedback>
                {props.validation.errors.tiers[props.index]?.name}
              </InvalidFeedback>
            )}
        </div>
        <div>
          <label
            htmlFor="min"
            className="form-label"
          >
            {props.type === TIER_KIND.AMOUNT
              ? i18n.t("minimum_amount")
              : i18n.t("minimum_sessions")
            }
          </label>
          <Input
            id="min"
            name="min"
            type="number"
            min={0}
            value={props.validation.values.tiers[props.index]?.min}
            placeholder={
              props.type === TIER_KIND.AMOUNT
                ? i18n.t("minimum_amount")
                : i18n.t("minimum_sessions")
            }
            onChange={(e) => props.validation.setFieldValue(`tiers[${props.index}].min`, e.target.value)}
            onBlur={props.validation.handleBlur}
            invalid={
              props.validation.errors.tiers &&
              props.validation.touched.tiers &&
              props.validation.errors.tiers[props.index]?.min &&
              props.validation.touched.tiers[props.index]?.min
            }
          />
          {props.validation.errors.tiers &&
            props.validation.touched.tiers &&
            props.validation.errors.tiers[props.index]?.min &&
            props.validation.touched.tiers[props.index]?.min && (
              <InvalidFeedback>
                {props.validation.errors.tiers[props.index]?.min}
              </InvalidFeedback>
            )}
        </div>
        <div>
          <label
            htmlFor="max"
            className="form-label"
          >
            {props.type === TIER_KIND.AMOUNT
              ? i18n.t("maximum_amount")
              : i18n.t("maximum_sessions")
            }
          </label>
          <Input
            id="max"
            name="max"
            type="number"
            min={0}
            value={props.validation.values.tiers[props.index]?.max}
            placeholder={
              props.type === TIER_KIND.AMOUNT
                ? i18n.t("maximum_amount")
                : i18n.t("maximum_sessions")
            }
            onChange={(e) => props.validation.setFieldValue(`tiers[${props.index}].max`, e.target.value)}
            onBlur={props.validation.handleBlur}
            invalid={
              props.validation.errors.tiers &&
              props.validation.touched.tiers &&
              props.validation.errors.tiers[props.index]?.max &&
              props.validation.touched.tiers[props.index]?.max
            }
          />
          {props.validation.errors.tiers &&
            props.validation.touched.tiers &&
            props.validation.errors.tiers[props.index]?.max &&
            props.validation.touched.tiers[props.index]?.max && (
              <InvalidFeedback>
                {props.validation.errors.tiers[props.index]?.max}
              </InvalidFeedback>
            )}
        </div>
      </div>
      <div className="details-container">
        <div
          className={"details" + (isPercentage ? " active" : "")}
          onClick={() => {
            setIsPercentage(true);
            props.validation.setFieldValue(`tiers[${props.index}].commission_kind`, TIER_COMMISSION_KIND.RATE);
            props.validation.setFieldValue(
              `tiers[${props.index}].commission_value`,
              props.validation.values.tiers[props.index]?.commission_percent
            );
          }}
        >
          <h5 className="title">{i18n.t("percentage_rate")}</h5>
          <Input
            id="percentage_rate"
            name="percentage_rate"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={props.validation.values.tiers[props.index]?.commission_percent}
            placeholder={i18n.t("percentage_rate")}
            onChange={(e) => handlePercentChange(e.target.value)}
            onBlur={(e) => {
              let newValue = round(props.validation.values.tiers[props.index]?.commission_percent, 2);
              if (isNaN(newValue)) return;
              props.validation.handleBlur(e);
              props.validation.setFieldValue(
                `tiers[${props.index}].commission_percent`,
                newValue
              )
            }}
            disabled={!isPercentage}
            invalid={
              props.validation.errors.tiers &&
              props.validation.touched.tiers &&
              props.validation.errors.tiers[props.index]?.commission_percent &&
              props.validation.touched.tiers[props.index]?.commission_percent
            }
          />
          {props.validation.errors.tiers &&
            props.validation.touched.tiers &&
            props.validation.errors.tiers[props.index]?.commission_percent &&
            props.validation.touched.tiers[props.index]?.commission_percent && (
              <InvalidFeedback>
                {props.validation.errors.tiers[props.index]?.commission_percent}
              </InvalidFeedback>
            )
          }
        </div>
        <div
          className={"details" + (isPercentage ? "" : " active")}
          onClick={() => {
            setIsPercentage(false);
            props.validation.setFieldValue(`tiers[${props.index}].commission_kind`, TIER_COMMISSION_KIND.AMOUNT);
            props.validation.setFieldValue(
              `tiers[${props.index}].commission_value`,
              props.validation.values.tiers[props.index]?.commission_amount
            );
          }}
        >
          <h5 className="title">
            {props.type === TIER_KIND.AMOUNT
              ? i18n.t("fixed_amount")
              : i18n.t("per_session")
            }
          </h5>
          <InputCurrency
            name="trainer-revenue"
            value={props.validation.values.tiers[props.index]?.commission_amount}
            onChange={(newValue) => {
              props.validation.setFieldValue(`tiers[${props.index}].commission_amount`, newValue);
              props.validation.setFieldValue(`tiers[${props.index}].commission_value`, newValue);
            }}
            onBlur={props.validation.handleBlur}
            disabled={isPercentage}
          />
          {props.validation.errors.tiers &&
            props.validation.touched.tiers &&
            props.validation.errors.tiers[props.index]?.commission_amount &&
            props.validation.touched.tiers[props.index]?.commission_amount && (
              <InvalidFeedback>
                {props.validation.errors.tiers[props.index]?.min}
              </InvalidFeedback>
            )
          }
        </div>
      </div>
    </div>
  )
};

export default PolicyTierCard;