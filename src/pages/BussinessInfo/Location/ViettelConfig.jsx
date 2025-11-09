import React, { useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Form,
  Input,
  Label,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import i18n from "../../../i18n";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import viettelService from "../../../services/viettel.service";
import { PAYMENT_STRATEGY } from "../../../constants/app.const";
import MyDropdown from "../../../components/Common/MyDropdown";
import { toast } from "react-toastify";
const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const ViettelConfig = () => {
  const { id } = useParams();
  const [configDetail, setConfigDetail] = React.useState(null);
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      supplier_tax_code: configDetail?.supplier_tax_code || "",
      seller_legal_name: configDetail?.seller_legal_name || "",
      seller_address: configDetail?.seller_address || "",
      seller_phone: configDetail?.seller_phone || "",
      seller_email: configDetail?.seller_email || "",
      seller_fax: configDetail?.seller_fax || "",
      seller_website: configDetail?.seller_website || "",
      seller_bank_name: configDetail?.seller_bank_name || "",
      seller_bank_account: configDetail?.seller_bank_account || "",
      template_code: configDetail?.template_code || "",
      invoice_series: configDetail?.invoice_series || "",
      api_base_url: configDetail?.api_base_url || "",
      username: configDetail?.username || "",
      password: configDetail?.password || "",
      payment_strategy: configDetail?.payment_strategy || "",
    },
    validationSchema: Yup.object({
      supplier_tax_code: Yup.string().required(i18n.t("tax_code_required")),
      seller_legal_name: Yup.string().required(i18n.t("legal_name_required")),
      seller_address: Yup.string().required(i18n.t("address_required")),
      seller_phone: Yup.string().required(i18n.t("phone_required")),
      seller_website: Yup.string().url('1 link'),
      seller_email: Yup.string()
        .email(i18n.t("invalid_email"))
        .required(i18n.t("email_required")),
      template_code: Yup.string().required(i18n.t("template_code_required")),
      invoice_series: Yup.string().required(i18n.t("invoice_series_required")),
     password: Yup.string().required(i18n.t("password_required")),
      api_base_url: Yup.string().required(i18n.t("api_base_url_required")).url('1 link'),
      username: Yup.string().required(i18n.t("username_required")),  
    }),
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const handleGetConfig = async () => {
    try {
      const response = await viettelService.getConfigViettel(id);
      setConfigDetail(response.data);
    } catch (error) {
      console.error("Error fetching Viettel config:", error);
    }
  };

  const handleSubmitForm = async () => {
    try {
      const response = await viettelService.updateConfigViettel(
        id,
        validation.values
      );
      if (response.status === 200) {
        console.log("Viettel config updated successfully");
      }
    } catch (error) {
      console.error("Error submitting Viettel config:", error);
      // Handle error appropriately, e.g., show a notification
    }
  };

  const handleCheckHealth = async () => {
    try{
      validation.setTouched({
        supplier_tax_code: true,
        username: true,
        password: true,
        template_code: true,
      });
      if (!validation.isValid) {
        console.log("Validation errors:", validation.errors);
        return;
      }
      const response = await viettelService.updateHealthViettel(id,{
        supplier_tax_code: validation.values.supplier_tax_code,
        username: validation.values.username,
        password: validation.values.password,
        template_code: validation.values.template_code,
      });
      console.log('response',response)
      if(response.data.success){
        toast.success('Kết nối thành công',{
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        })
      }else{
        toast.error(response.data.message , {
           position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        })
      }

    }catch (error) {
      console.error("Error checking health:", error);
      // Handle error appropriately, e.g., show a notification
    }
  }

  useEffect(() => {
    if (id) {
      handleGetConfig();
    }
  }, [id]);

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        validation.setTouched({
          supplier_tax_code: true,
          seller_legal_name: true,
          seller_address: true,
          seller_phone: true,
          seller_email: true,
          seller_fax: true,
          seller_website: true,
          seller_bank_name: true,
          seller_bank_account: true,
          template_code: true,
          invoice_series: true,
          api_base_url: true,
          username: true,
          password: true,
          payment_strategy: true,
        });
        console.log("validation.isValid", validation.errors);
        if (validation.isValid) {
          handleSubmitForm();
        }
        return false;
      }}
    >
      <Card className="mb-4">
        <CardBody>
          <CardTitle tag="h5" id="viettel-config">
            {i18n.t("viettel_config")}
          </CardTitle>
          <div className="mt-4">
            {Object.keys(validation.values).map((key, idx) => (
              <React.Fragment key={key}>
                {idx % 2 === 0 && (
                  <Row className="mb-2">
                    <Col md={6}>
                      <Row>
                        <Col md={4}>
                          <Label for={key}>
                            <div className="d-flex flex-row">
                              {i18n.t(key)} <p style={{ color: "red" }}>*</p>
                            </div>
                          </Label>
                        </Col>
                        <Col md={8}>
                          {key === "payment_strategy" ? (
                            <MyDropdown
                              id="payment_strategy"
                              name="payment_strategy"
                              placeholder={i18n.t("payment_strategy")}
                              options={PAYMENT_STRATEGY}
                              displayEmpty
                              selected={validation.values.payment_strategy}
                              setSelected={(e) => {
                                validation.setFieldValue("payment_strategy", e);
                              }}
                              invalid={
                                validation.errors.payment_strategy &&
                                validation.touched.payment_strategy
                              }
                              onBlur={validation.handleBlur}
                              isForm={true}
                            />
                          ) : (
                            <Input
                              id={key}
                              name={key}
                              type="text"
                              placeholder={i18n.t(key)}
                              required
                              value={validation.values[key]}
                              invalid={
                                validation.errors[key] &&
                                validation.touched[key]
                              }
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                            />
                          )}

                          {validation.touched[key] &&
                            validation.errors[key] && (
                              <InvalidFeedback>
                                {validation.errors[key]}
                              </InvalidFeedback>
                            )}
                        </Col>
                      </Row>
                    </Col>
                    {Object.keys(validation.values)[idx + 1] && (
                      <Col md={6}>
                        <Row>
                          <Col md={4}>
                            <Label
                              for={Object.keys(validation.values)[idx + 1]}
                            >
                              <div className="d-flex flex-row">
                                {i18n.t(
                                  Object.keys(validation.values)[idx + 1]
                                )}{" "}
                                <p style={{ color: "red" }}>*</p>
                              </div>
                            </Label>
                          </Col>
                          <Col md={8}>
                            <Input
                              id={Object.keys(validation.values)[idx + 1]}
                              name={Object.keys(validation.values)[idx + 1]}
                              type="text"
                              placeholder={i18n.t(
                                Object.keys(validation.values)[idx + 1]
                              )}
                              required
                              value={
                                validation.values[
                                  Object.keys(validation.values)[idx + 1]
                                ]
                              }
                              invalid={
                                validation.errors[
                                  Object.keys(validation.values)[idx + 1]
                                ] &&
                                validation.touched[
                                  Object.keys(validation.values)[idx + 1]
                                ]
                              }
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                            />
                            {validation.touched[
                              Object.keys(validation.values)[idx + 1]
                            ] &&
                              validation.errors[
                                Object.keys(validation.values)[idx + 1]
                              ] && (
                                <InvalidFeedback>
                                  {
                                    validation.errors[
                                      Object.keys(validation.values)[idx + 1]
                                    ]
                                  }
                                </InvalidFeedback>
                              )}
                          </Col>
                        </Row>
                      </Col>
                    )}
                  </Row>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="d-flex gap-3 justify-content-end">
            <Button
              outline={true}
              // onClick={addWifiSetting}
              type="submit"
              className="float-end mt-2"
            >
              {i18n.t("save")}
            </Button>
            <Button
              color="primary"
              onClick={handleCheckHealth}
              disabled={validation?.errors?.supplier_tax_code || validation?.errors?.username || validation?.errors?.password|| validation?.errors?.template_code}
              type="button"
              id="check-health"
              className="float-end mt-2"
            >
              {i18n.t("check_health")}
            </Button>
            <UncontrolledTooltip target="check-health" placement="top">
              {i18n.t("check_health_tooltip")}{i18n.t('supplier_tax_code')},{i18n.t('username')},{i18n.t('password')},{i18n.t('template_code')}
            </UncontrolledTooltip>
          </div>
        </CardBody>
      </Card>
    </Form>
  );
};

export default ViettelConfig;
