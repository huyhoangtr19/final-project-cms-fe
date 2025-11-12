// Function Name : Login Page
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";

//redux
import { useDispatch } from "react-redux";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

import {
  Row,
  Col,
  CardBody,
  Card,
  Alert,
  Container,
  Form,
  Input,
  Label,
} from "reactstrap";
import Cookies from "js-cookie";

import authService from "../../services/auth.service";
import { setIsToken, setToken, setUserInfo } from "../../store/reducers/auth";
import IcDanger from "../../assets/icon/IcDanger";
import IcWarning from "../../assets/icon/IcWarning";
import IcEye from "../../assets/icon/IcEye";
import IcEyeNone from "../../assets/icon/IcEyeNone";
import i18n from "../../i18n";
import { toast } from "react-toastify";
// import { handleGetInformationAdmin } from "../../utils/app";
// import { requestNotificationPermission } from "../../firebase/messaging";

const Login = (props) => {
  //meta title
  document.title = "Login | Fitness CMS";
  const dispatch = useDispatch();
  const [checkSave, setCheckSave] = React.useState(true);
  const [errorApi, setErrorApi] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(i18n.t("invalid_email"))
        .required("Please input email"),
      password: Yup.string().required("Please input  password"),
    }),
    onSubmit: async (values) => {
      try {
        const deviceToken = Cookies.get("device_token");
        console.log("deviceToken", deviceToken);
        const payload = {
          ...values,
          device_token: deviceToken,
        };
        const res = await authService.login(payload);
        if (res.success) {
          if (checkSave) {
            Cookies.set("accessToken", res?.data?.access_token, {
              expires: 1,
            });
            Cookies.set("userInfo", values);
          }
          sessionStorage.setItem("isToken", true);
          sessionStorage.setItem("accessToken", res?.data?.access_token);
          dispatch(setToken(res?.data?.access_token));
          dispatch(setIsToken(true));
          dispatch(setUserInfo(values));
          // handleGetInformationAdmin();
          props.router.navigate("/dashboard");
        }
      } catch (e) {
        console.log("ERROR", e);
        if (e.message && e.message === "Unauthenticated") {
          console.log("sasd");
          setErrorApi("Email or Password is incorrect!");
        } else if (e.message) {
          toast.error(message, {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        }
      }
      // dispatch(loginUser(values, props.router.navigate));
    },
  });

  const errorForm = useMemo(() => {
    return errorApi || validation.errors.password || validation.errors.email;
  }, [validation?.errors, errorApi]);

  useEffect(() => {
    if (validation.errors.email || validation.errors.password) {
      setErrorApi("");
    }
  }, [validation?.errors]);

  useEffect(() => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("userInfo");
    Cookies.remove("permissionUser");
    sessionStorage.removeItem("isToken");
    sessionStorage.removeItem("accessToken");
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
                        <h3 className="text-primary">FITPRO CMS</h3>
                      </div>
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-3">
                  <div className="auth-logo">
                    <h2 className="text-center">LOGIN</h2>
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
                      {errorForm ? (
                        <Alert color={errorApi ? "danger" : "warning"}>
                          <div className="d-flex flex-row align-center gap-2">
                            {errorApi ? <IcDanger /> : <IcWarning />}
                            {errorForm}
                          </div>
                        </Alert>
                      ) : null}

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
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">Password</Label>
                        <div className="position-relative">
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
                          <button
                            className="position-absolute right-0 btn btn-outline-none"
                            type="button"
                            style={{
                              right: 0,
                              top: 0,
                              bottom: 0,
                              height: 40,
                              width: 40,
                              zIndex: 1001,
                              boxShadow: 'none',
                            }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <IcEyeNone /> : <IcEye />}
                          </button>
                        </div>
                      </div>

                      <div className="d-flex flex-row justify-content-between">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="customControlInline"
                            checked={checkSave}
                            onChange={(e) => setCheckSave(e.target.checked)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="customControlInline"
                          >
                            Keep logged in
                          </label>
                        </div>
                        <div className="">
                          <Link to="/forgot-password" className="text-muted">
                            <i className="mdi mdi-lock me-1" />
                            Forgot your password?
                          </Link>
                        </div>
                      </div>
                      <div className="mt-3 d-grid">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                        >
                          Log In
                        </button>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              {/* <div className="mt-5 text-center">
                <p>
                  Don&#39;t have an account ?{" "}
                  <Link to="/register" className="fw-medium text-primary">
                    {" "}
                    Signup now{" "}
                  </Link>{" "}
                </p>
                <p>
                  © {new Date().getFullYear()} Skote. Crafted with{" "}
                  <i className="mdi mdi-heart text-danger" /> by Themesbrand
                </p>
              </div> */}
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(Login);

Login.propTypes = {
  history: PropTypes.object,
};
