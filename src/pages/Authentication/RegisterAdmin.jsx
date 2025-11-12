// Function Name : Register Page
// Created date :  11/11/24             by :  VinhLQ
// Updated date :  11/11/24             by :  VinhLQ

import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import withRouter from "../../components/Common/withRouter";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

import {
  Row,
  Col,
  CardBody,
  Card,
  Container,
  Form,
  Input,
  Label,
  FormFeedback,
} from "reactstrap";

import IcEye from "../../assets/icon/IcEye";
import IcEyeNone from "../../assets/icon/IcEyeNone";
import i18n from "../../i18n";
import userService from "../../services/user.service";
import { toast } from "react-toastify";

const RegisterAdmin = (props) => {
  //meta title
  document.title = "Register admin | Fitness CMS";
  const [showPassword, setShowPassword] = React.useState(false);
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: "",
      password: "",
      username: "",
      verify_code: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(i18n.t("invalid_email"))
        .required("Please input email"),
      password: Yup.string().required("Please input password"),
      username: Yup.string().required("Please input username"),
      verify_code: Yup.string().required("Please input verify code"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await userService.createAdminOperator(values);
        if (res.success) {
          toast.success("Create success", {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
            hideProgressBar: true,
          });
        }
      } catch (e) {
        console.log("eRROR", e);
        if (e.errors) {
          validation.setErrors(e.errors);
        }
        if (e.response.data.message === "Unauthenticated") {
          validation.setErrors({
            verify_code: "Code not match",
          });
        }
      }
    },
  });

  useEffect(() => {}, []);

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div className="bg-primary-subtle">
                  <Row>
                    <Col>
                      <div className="text-center text-primary p-4">
                        <h3 className="text-primary">FITPRO CMS</h3>
                      </div>
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-3">
                  <div className="auth-logo">
                    <h2 className="text-center">Register admin</h2>
                  </div>
                  <div className="p-2">
                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="mb-3">
                        <Label className="form-label">
                          {i18n.t("username")}
                        </Label>
                        <Input
                          name="username"
                          className="form-control"
                          placeholder="Username"
                          type="text"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.username || ""}
                          invalid={
                            validation.touched.username &&
                            validation.errors.username
                              ? true
                              : false
                          }
                        />
                        {validation.errors.username && (
                          <FormFeedback>
                            {validation.errors.username}
                          </FormFeedback>
                        )}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">{i18n.t("email")}</Label>
                        <Input
                          name="email"
                          className="form-control"
                          placeholder="Enter email"
                          type="email"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.email || ""}
                          invalid={
                            validation.touched.email && validation.errors.email
                              ? true
                              : false
                          }
                        />
                        {validation.errors.email && (
                          <FormFeedback>{validation.errors.email}</FormFeedback>
                        )}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">
                          {i18n.t("password")}
                        </Label>
                        <div className="input-group position-relative">
                          <Input
                            name="password"
                            autoComplete="off"
                            value={validation.values.password || ""}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Password"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.password &&
                              validation.errors.password
                                ? true
                                : false
                            }
                          />
                          {validation.errors.password && (
                            <FormFeedback>
                              {validation.errors.password}
                            </FormFeedback>
                          )}
                          <button
                            className="position-absolute right-0 btn btn-outline-none"
                            type="button"
                            style={{
                              right: 0,
                              top: 0,
                              height: 36,
                              zIndex: 1001,
                            }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <IcEyeNone /> : <IcEye />}
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">
                          {i18n.t("verify_code")}
                        </Label>
                        <Input
                          name="verify_code"
                          className="form-control"
                          placeholder="Enter verify code"
                          type="text"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.verify_code || ""}
                          invalid={
                            validation.touched.verify_code &&
                            validation.errors.verify_code
                              ? true
                              : false
                          }
                        />
                        {validation.errors.verify_code && (
                          <FormFeedback>
                            {validation.errors.verify_code}
                          </FormFeedback>
                        )}
                      </div>

                      <div className="mt-3 d-grid">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                        >
                          Register
                        </button>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(RegisterAdmin);

RegisterAdmin.propTypes = {
  history: PropTypes.object,
};
