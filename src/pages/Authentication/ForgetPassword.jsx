// Function Name : Forgot Password Page
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import PropTypes from "prop-types";
import React, { useState } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { Link, redirect } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";
import { toast } from "react-toastify";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// action
import { userForgetPassword } from "../../store/actions";
import authService from "../../services/auth.service";
import i18n from "../../i18n";

const ForgetPasswordPage = (props) => {
  //meta title
  document.title = "Forgot Password | Actiwell System";

  const [forgetSuccessMsg, setForgetSuccessMsg] = useState(false);
  const [forgetError, setForgetError] = useState("");
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(i18n.t("invalid_email"))
        .required("Please input email"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          redirect_url: `${window.location.origin}/reset-password`,
        };
        const response = await authService.forgotPassword(payload);
        if (response.success) {
          props.router.navigate("/login");
          toast.success(`The link to reset your password has been sent to ${validation.values.email}`, {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        }
      } catch (e) {
        console.log(e);
        if (e.message === "Resource not found") {
          setForgetError(i18n.t("invalid_email"));
        }
        if (e.message === 'MOB-06') {
          toast.error("No user for this email", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        } else {
          toast.error(e.message, {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        }
      }
    },
  });

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
                    {forgetSuccessMsg ? (
                      <Alert color="success" style={{ marginTop: "13px" }}>
                        {`The link to reset your password has been sent to ${validation.values.email}`}
                      </Alert>
                    ) : null}

                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="mb-3">
                        <Label className="form-label">{i18n.t("email")}</Label>
                        <Input
                          name="email"
                          className="form-control"
                          placeholder={i18n.t("email")}
                          type="email"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.email || ""}
                          invalid={
                            (validation.touched.email &&
                              validation.errors.email) ||
                              forgetError
                              ? true
                              : false
                          }
                        />
                        {(validation.touched.email &&
                          validation.errors.email) ||
                          forgetError ? (
                          <FormFeedback type="invalid">
                            {validation.errors.email || forgetError}
                          </FormFeedback>
                        ) : null}
                      </div>
                      <div className="mt-3 d-grid mb-3">
                        <button className="btn btn-primary w-md " type="submit">
                          Send Link
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

ForgetPasswordPage.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
