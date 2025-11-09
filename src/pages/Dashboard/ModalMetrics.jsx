import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalHeader,
  Row,
} from "reactstrap";
import { useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import dashboardService from "../../services/dashboard.service";
import { toast } from "react-toastify";
import i18n from "../../i18n";

const ModalMetrics = ({ isOpen, onClose, onSave, isRisk, data }) => {
  const rangeText = (is) => {
    return is ? i18n.t('below_threshold') : i18n.t('above_threshold');
  };
  // const labelMetric = useMemo(() => {
  //   return isRisk ? "Risk" : "Potential";
  // }, [isRisk]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      completion_rate: data?.completion_rate || 0,
      cancel_rate: data?.cancel_rate || 0,
      absence_rate: data?.absence_rate || 0,
      day_last_booking: data?.day_last_booking || 0,
      training_frequency: data?.training_frequency || 0,
    },
    validationSchema: Yup.object({
      completion_rate: Yup.string().nullable(),
      cancel_rate: Yup.string().nullable(),
      absence_rate: Yup.string().nullable(),
      day_last_booking: Yup.string().nullable(),
      training_frequency: Yup.string().nullable(),
    }),
    onSubmit: (values) => {
      handleSubmitForm();
    },
  });
  const handleSubmitForm = async () => {
    try {
      const payload = {
        ...validation.values,
      };
      const response = isRisk
        ? await dashboardService.updateMetricsRisk(payload)
        : await dashboardService.updateMetricsPotential(payload);
      if (response.success) {
        // navigate("/users");
        toast.success(
          ` Save ${isRisk ? "Risk" : "Potential"} Metrics successfully`,
          {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
            hideProgressBar: true,
          }
        );
        onClose();
        onSave();
      }
    } catch (e) {
      console.log(e);
      validation.setErrors(e.errors);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      autoFocus={true}
      centered
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
    >
      <ModalHeader
        className="border-bottom-0 pb-0"
        toggle={() => {
          onClose();
        }}
      >
        <h4>
          {isRisk
            ? i18n.t("configure_risk_customers_metrics")
            : i18n.t("configure_potential_customers_metrics")}
        </h4>
      </ModalHeader>
      <p style={{ color: "#BABABA", padding: "0 20px" }}>
        {isRisk
          ? i18n.t(
              "set_thresholds_for_identifying_risks_clients_based_on_their_activity_patterns"
            )
          : i18n.t(
              "set_thresholds_for_identifying_potential_clients_based_on_their_activity_patterns"
            )}
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 20px 20px 20px",
        }}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.setTouched({
              cancel_rate: true,
              completion_rate: true,
              absence_rate: true,
              day_last_booking: true,
              training_frequency: true,
            });
            if (validation.isValid) {
              handleSubmitForm();
            }
            return false;
          }}
        >
          <Row>
            <Col md={6}>
              <Row>
                <Label>{i18n.t('completion_rate')}</Label>
              </Row>
              <Row>
                <Col md={4}>
                  <Input
                    type="number"
                    name="completion_rate"
                    id="completion_rate"
                    placeholder={""}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    value={validation.values.completion_rate}
                    invalid={
                      validation.errors.completion_rate &&
                      validation.touched.completion_rate
                    }
                  />
                </Col>
                <Col md={8}>
                  <span style={{ fontWeight: "600" }}>%</span>{" "}
                  {rangeText(isRisk)} 
                </Col>
              </Row>
            </Col>
            <Col md={6}>
              <Row>
                <Label>{i18n.t('days_since_last_booking')}</Label>
              </Row>
              <Row>
                <Col md={4}>
                  <Input
                    type="number"
                    name="day_last_booking"
                    id="day_last_booking"
                    placeholder={""}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    value={validation.values.day_last_booking}
                    invalid={
                      validation.errors.day_last_booking &&
                      validation.touched.day_last_booking
                    }
                  />
                </Col>
                <Col md={8}>
                  {" "}
                  <span style={{ fontWeight: "600" }}>{i18n.t('days')}</span>{" "}
                  {rangeText(!isRisk)} 
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col md={6}>
              <Row>
                <Label>{i18n.t('absence_rate')}</Label>
              </Row>
              <Row>
                <Col md={4}>
                  <Input
                    type="number"
                    name="absence_rate"
                    id="absence_rate"
                    placeholder={""}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    value={validation.values.absence_rate}
                    invalid={
                      validation.errors.absence_rate &&
                      validation.touched.absence_rate
                    }
                  />
                </Col>
                <Col md={8}>
                  <span style={{ fontWeight: "600" }}>%</span>{" "}
                  {rangeText(!isRisk)} 
                </Col>
              </Row>
            </Col>
            <Col md={6}>
              <Row>
                <Label>{i18n.t('training_frequency')}</Label>
              </Row>
              <Row>
                <Col md={4}>
                  <Input
                    type="number"
                    name="training_frequency"
                    id="training_frequency"
                    placeholder={""}
                    onBlur={validation.handleBlur}
                    onChange={validation.handleChange}
                    value={validation.values.training_frequency}
                    invalid={
                      validation.errors.training_frequency &&
                      validation.touched.training_frequency
                    }
                  />
                </Col>
                <Col md={8}>
                  {" "}
                  <span style={{ fontWeight: "600" }}>/{i18n.t('weeks')}</span>{" "}
                  {rangeText(isRisk)} 
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col md={6}>
              <Row>
                <Label>{i18n.t('cancellation_rate')}</Label>
              </Row>
              <Row>
                <Col md={4}>
                  <Input
                    type="number"
                    name="cancel_rate"
                    id="cancel_rate"
                    placeholder={""}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.cancel_rate}
                    invalid={
                      validation.errors.cancel_rate &&
                      validation.touched.cancel_rate
                    }
                  />
                </Col>
                <Col md={8}>
                  <span style={{ fontWeight: "600" }}>%</span>{" "}
                  {rangeText(!isRisk)} 
                </Col>
              </Row>
            </Col>
            <Col md={6}></Col>
          </Row>
          <Row className="mt-2">
            <Col md={9}></Col>
            <Col md={3}>
              <Button color="primary" block>
                {i18n.t('save')}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};
export default ModalMetrics;
