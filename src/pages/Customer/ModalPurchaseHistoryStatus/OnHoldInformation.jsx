import { Col, Input, Label, Row } from "reactstrap";
import styled from "styled-components";
import i18n from "../../../i18n";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const OnHoldInformation = ({ validation, readOnly }) => {
  return (
    <>
      <h5 className="text-start mt-3">{i18n.t("on_hold_information")}</h5>
      <Row className="mt-3">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="sale_package_detail_id">
                <div className="d-flex flex-row">{i18n.t("package")}</div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="sale_package_detail_id"
                name="sale_package_detail_id"
                type="text"
                invalid={
                  validation.errors.sale_package_detail_id &&
                  validation.touched.sale_package_detail_id
                }
                hidden
                disabled
                value={validation.values.sale_package_detail_id}
                placeholder={i18n.t("package")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              <Input
                id="package_name"
                name="package_name"
                type="text"
                disabled
                value={validation.values.package_name}
                placeholder={i18n.t("package")}
              />
              {validation.errors.sale_package_detail_id &&
                validation.touched.sale_package_detail_id && (
                  <InvalidFeedback>
                    {validation.errors.sale_package_detail_id}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <Row>
            <Col md={6}>
              <Label for="free_on_hold_days">
                <div className="d-flex flex-row">
                  {i18n.t("remaining_free_on_hold_days")}
                </div>
              </Label>
            </Col>
            <Col md={6}>
              <Input
                type="number"
                invalid={
                  validation.errors.free_on_hold_days &&
                  validation.touched.free_on_hold_days
                }
                disabled
                value={validation.values.free_on_hold_days}
                placeholder={i18n.t("remaining_free_on_hold_days")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="start_hold_date">
                <div className="d-flex flex-row">
                  {i18n.t("start_date")} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="start_hold_date"
                name="start_hold_date"
                type="date"
                invalid={
                  validation.errors.start_hold_date &&
                  validation.touched.start_hold_date
                }
                disabled={readOnly}
                value={validation.values.start_hold_date}
                placeholder={i18n.t("start_date")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.errors.start_hold_date &&
                validation.touched.start_hold_date && (
                  <InvalidFeedback>
                    {validation.errors.start_hold_date}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="hold_fee">
                <div className="d-flex flex-row">
                  {i18n.t("on_hold_fee")} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="hold_fee"
                name="hold_fee"
                type="number"
                invalid={
                  validation.errors.hold_fee && validation.touched.hold_fee
                }
                disabled={readOnly}
                value={validation.values.hold_fee}
                placeholder={i18n.t("on_hold_fee")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.errors.hold_fee && validation.touched.hold_fee && (
                <InvalidFeedback>{validation.errors.hold_fee}</InvalidFeedback>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="end_hold_date">
                <div className="d-flex flex-row">
                  {i18n.t("end_date")} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="end_hold_date"
                name="end_hold_date"
                type="date"
                invalid={
                  validation.errors.end_hold_date &&
                  validation.touched.end_hold_date
                }
                disabled={readOnly}
                value={validation.values.end_hold_date}
                placeholder={i18n.t("end_date")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.errors.end_hold_date &&
                validation.touched.end_hold_date && (
                  <InvalidFeedback>
                    {validation.errors.end_hold_date}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default OnHoldInformation;
