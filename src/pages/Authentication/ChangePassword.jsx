// Function Name : Change Password Page
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import PropTypes from "prop-types";
import React, { useEffect, useMemo } from "react";
import {
  Row,
  Col,
  Alert,
  Card,
  CardBody,
  Container,
  FormFeedback,
  Input,
  Label,
  Form,
} from "reactstrap";

//redux

import { Link } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// action
import authService from "../../services/auth.service";
import axios from "axios";
import { toast } from "react-toastify";
import { defaultConfig, tokenConfigInterceptors } from "../../api";
import { ApiConstant } from "../../constants";
import IcEyeNone from "../../assets/icon/IcEyeNone";
import IcEye from "../../assets/icon/IcEye";
import Cookies from "js-cookie";
import i18n from "../../i18n";

const ChangePassWord = (props) => {
  //meta title
  document.title = "Change Password | Actiwell System";

  const [showPassword, setShowPassword] = React.useState(false);
  const [showRePassword, setShowRePassword] = React.useState(false);
  const passwordErrorConst =
    "Password must be 8-20 characters and contain both numbers and letters/special characters";
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      password: "",
      rePassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required("Please enter a valid password")
        .min(8, passwordErrorConst)
        .max(20, passwordErrorConst)
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
          passwordErrorConst
        ),

      rePassword: Yup.string()
        .required("Please enter a valid password")
        .equals([Yup.ref("password")], "Password not match"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          password: values.password,
        };

        const axiosInstance = axios.create({
          ...defaultConfig(ApiConstant.HEADER_DEFAULT),
          headers: {
            ...ApiConstant.HEADER_DEFAULT.headers,
            Authorization: `Bearer ${newToken}`, // Include the token in the Authorization header
          },
        });
        const response = await axiosInstance.put("/v1/cms/users/set-password", {
          password: values.password,
          password_confirmation: values.rePassword,
        });
        if (response.data.success) {
          props.router.navigate("/login");
          toast.success(`Password changed successfully`, {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        }
      } catch (e) {
        console.log("error forgot", e);
      }
    },
    validateOnBlur: false,
  });
  const newToken = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("token") || "";
  }, []);

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
                        <h3 className="text-primary">ACTIWELL SYSTEM</h3>
                      </div>
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-3">
                  <div className="auth-logo">
                    <h2 className="text-center">Forgot Password</h2>
                  </div>
                  <div className="p-2">
                    {/* {forgetError && forgetError ? (
                      <Alert color="danger" style={{ marginTop: "13px" }}>
                        {forgetError}
                      </Alert>
                    ) : null} */}
                    {/* {forgetSuccessMsg ? (
                      <Alert color="success" style={{ marginTop: "13px" }}>
                        {forgetSuccessMsg}
                      </Alert>
                    ) : null} */}

                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="mb-3">
                        <Label className="form-label">New Password</Label>
                        <div className="position-relative">
                          <Input
                            name="password"
                            autoComplete="off"
                            style={{ backgroundImage: "none" }}
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
                          <button
                            className="position-absolute right-0 btn btn-outline-none"
                            type="button"
                            style={{
                              right: 0,
                              top: 0,
                              bottom: 0,
                              height: 36,
                              width: 36,
                              zIndex: 1001,
                              boxShadow: 'none',
                            }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <IcEyeNone /> : <IcEye />}
                          </button>
                          {validation.touched.password &&
                            validation.errors.password ? (
                            <FormFeedback type="invalid">
                              {validation.errors.password}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label className="form-label">
                          Confirm New Password
                        </Label>
                        <div className="position-relative">
                          <Input
                            name="rePassword"
                            autoComplete="off"
                            style={{ backgroundImage: "none" }}
                            value={validation.values.rePassword || ""}
                            type={showRePassword ? "text" : "password"}
                            placeholder="Enter Password"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.rePassword &&
                                validation.errors.rePassword
                                ? true
                                : false
                            }
                          />
                          <button
                            className="position-absolute right-0 btn btn-outline-none"
                            type="button"
                            style={{
                              right: 0,
                              top: 0,
                              bottom: 0,
                              height: 36,
                              width: 36,
                              zIndex: 1001,
                              boxShadow: 'none',
                            }}
                            onClick={() => setShowRePassword(!showRePassword)}
                          >
                            {showRePassword ? <IcEyeNone /> : <IcEye />}
                          </button>
                          {validation.touched.rePassword &&
                            validation.errors.rePassword ? (
                            <FormFeedback type="invalid">
                              {validation.errors.rePassword}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 d-grid mb-3">
                        <button className="btn btn-primary w-md " type="submit">
                          {i18n.t("change_password")}
                        </button>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <Link to="/login" className="font-weight-medium text-primary">
                  Go back to Login
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

ChangePassWord.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ChangePassWord);
