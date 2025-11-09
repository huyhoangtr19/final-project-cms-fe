import { Col, Input, Label, Row } from "reactstrap";
import styled from "styled-components";
import MyDropdownSearch from "../../../components/Common/MyDropdownSearch";
import { useEffect, useState } from "react";
import i18n from "../../../i18n";
import { debounce } from "lodash";
import customerService from "../../../services/customer.service";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const TransferInformation = ({ validation, readOnly }) => {
  const [customers, setCustomers] = useState([]);

  const handleGetCustomerForOperator = async (params = {}) => {
    try {
      const response = await customerService.getListCustomerForOperator(params);
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.customer_id,
            label: `${item.c_id} - ${item.last_name} ${item.first_name} - ${item.phone}`,
          };
        });
      }
    } catch (e) {}
  };

  const handleSearchCustomer = debounce(async (e) => {
    const data = await handleGetCustomerForOperator({
      keyword: e,
    });
    if (data) {
      setCustomers(data);
    }
  }, 300);

  const handleSelectCustomer = async (customerId) => {
    validation.setValues({
      ...validation.values,
      to_customer_id: customerId,
    });
  };

  useEffect(() => {
    handleGetCustomerForOperator().then((data) => {
      setCustomers(data);
    });
  }, []);
  return (
    <>
      <h5 className="text-start mt-3">{i18n.t("transfer_information")}</h5>
      <Row className="mt-3">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="to_customer_id">
                <div className="d-flex flex-row">
                  {i18n.t("target_customer")} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <MyDropdownSearch
                id="to_customer_id"
                name="to_customer_id"
                placeholder={i18n.t("customer")}
                options={customers}
                selected={validation.values.to_customer_id}
                setSelected={handleSelectCustomer}
                disabled={readOnly}
                invalid={
                  validation.errors.to_customer_id &&
                  validation.touched.to_customer_id
                }
                onSearch={handleSearchCustomer}
                onBlur={validation.handleBlur}
              />
              {validation.errors.to_customer_id &&
                validation.touched.to_customer_id && (
                  <InvalidFeedback>
                    {validation.errors.to_customer_id}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="transfer_date">
                <div className="d-flex flex-row">{i18n.t("transfer_date")}</div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                type="date"
                invalid={
                  validation.errors.transfer_date &&
                  validation.touched.transfer_date
                }
                disabled
                value={validation.values.transfer_date}
                placeholder={i18n.t("transfer_date")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.touched.transfer_date &&
                validation.errors.transfer_date && (
                  <InvalidFeedback>
                    {validation.errors.transfer_date}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="from_sale_package_id">
                <div className="d-flex flex-row">{i18n.t("package")}</div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="from_sale_package_id"
                name="from_sale_package_id"
                type="number"
                invalid={
                  validation.errors.from_sale_package_id &&
                  validation.touched.from_sale_package_id
                }
                disabled
                hidden
                value={validation.values.from_sale_package_id}
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
              {validation.errors.from_sale_package_id &&
                validation.touched.from_sale_package_id && (
                  <InvalidFeedback>
                    {validation.errors.from_sale_package_id}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="active_date">
                <div className="d-flex flex-row">
                  {i18n.t("active_date")} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                type="date"
                name="active_date"
                invalid={
                  validation.errors.active_date &&
                  validation.touched.active_date
                }
                value={validation.values.active_date}
                placeholder={i18n.t("active_date")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.touched.active_date &&
                validation.errors.active_date && (
                  <InvalidFeedback>
                    {validation.errors.active_date}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="start_date">
                <div className="d-flex flex-row">{i18n.t("start_date")}</div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                invalid={
                  validation.errors.start_date && validation.touched.start_date
                }
                disabled
                value={validation.values.start_date}
                placeholder={i18n.t("start_date")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.errors.start_date &&
                validation.touched.start_date && (
                  <InvalidFeedback>
                    {validation.errors.start_date}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="end_date">
                <div className="d-flex flex-row">{i18n.t("end_date")}</div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                invalid={
                  validation.errors.end_date && validation.touched.end_date
                }
                disabled
                value={validation.values.end_date}
                placeholder={i18n.t("end_date")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.errors.end_date && validation.touched.end_date && (
                <InvalidFeedback>{validation.errors.end_date}</InvalidFeedback>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="remaining_duration">
                <div className="d-flex flex-row">
                  {i18n.t("remaining_duration")}
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="remaining_duration"
                name="remaining_duration"
                type="text"
                invalid={
                  validation.errors.remaining_duration &&
                  validation.touched.remaining_duration
                }
                disabled
                value={validation.values.remaining_duration}
                placeholder={i18n.t("remaining_duration")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.errors.remaining_duration &&
                validation.touched.remaining_duration && (
                  <InvalidFeedback>
                    {validation.errors.remaining_duration}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="transfer_fee">
                <div className="d-flex flex-row">
                  {i18n.t("transfer_fee")} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="transfer_fee"
                name="transfer_fee"
                type="number"
                invalid={
                  validation.errors.transfer_fee &&
                  validation.touched.transfer_fee
                }
                disabled={readOnly}
                value={validation.values.transfer_fee}
                placeholder={i18n.t("transfer_fee")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.errors.transfer_fee &&
                validation.touched.transfer_fee && (
                  <InvalidFeedback>
                    {validation.errors.transfer_fee}
                  </InvalidFeedback>
                )}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="reason">
                <div className="d-flex flex-row">
                  {i18n.t("transfer_reason")} <p style={{ color: "red" }}>*</p>
                </div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="reason"
                name="reason"
                type="text"
                invalid={validation.errors.reason && validation.touched.reason}
                disabled={readOnly}
                value={validation.values.reason}
                placeholder={i18n.t("transfer_reason")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.errors.reason && validation.touched.reason && (
                <InvalidFeedback>{validation.errors.reason}</InvalidFeedback>
              )}
            </Col>
          </Row>
        </Col>
        <Col md={6}>
          <Row>
            <Col md={4}>
              <Label for="note">
                <div className="d-flex flex-row">{i18n.t("note")}</div>
              </Label>
            </Col>
            <Col md={8}>
              <Input
                id="note"
                name="note"
                type="text"
                invalid={validation.errors.note && validation.touched.note}
                disabled={readOnly}
                value={validation.values.note}
                placeholder={i18n.t("note")}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.errors.note && validation.touched.note && (
                <InvalidFeedback>{validation.errors.note}</InvalidFeedback>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default TransferInformation;
