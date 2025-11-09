import { useFormik } from "formik";
import React from "react";
import { FormFeedback, Input, Label, Form, Col, Row } from "reactstrap";
import * as Yup from "yup";
import IcEyeNone from "../../assets/icon/IcEyeNone";
import IcEye from "../../assets/icon/IcEye";
import userService from "../../services/user.service";
import { toast } from "react-toastify";
import i18n from "../../i18n";

const ChangePassWordCustom = (props) => {
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showRePassword, setShowRePassword] = React.useState(false);
  const passwordErrorConst =
    "Password must be 8-20 characters and contain both numbers and letters/special characters";
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      currentPassword: "",
      password: "",
      rePassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string()
        .required(i18n.t("please_enter_valid"))
        .min(8, passwordErrorConst)
        .max(20, passwordErrorConst)
      ,
      password: Yup.string()
        .required(i18n.t("please_enter_valid"))
        .min(8, passwordErrorConst)
        .max(20, passwordErrorConst)
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
          passwordErrorConst
        ),

      rePassword: Yup.string()
        .required(i18n.t("please_enter_valid"))
        .equals([Yup.ref("password")], i18n.t("pass_not_match")),
    }),
    onSubmit: async (values) => {
      handleChangePassword();
      // try {
      //   const payload = {
      //     password: values.password,
      //   };
      //   const axiosInstance = axios.create({
      //     ...defaultConfig(ApiConstant.HEADER_DEFAULT),
      //     headers: {
      //       ...ApiConstant.HEADER_DEFAULT.headers,
      //       Authorization: `Bearer ${newToken}`, // Include the token in the Authorization header
      //     },
      //   });
      //   const response = await axiosInstance.put(
      //     "/v1/cms/users/change-password",
      //     { password: values.password }
      //   );
      //   if (response.data.success) {
      //     sessionStorage.setItem("isToken", true);
      //     Cookies.set("accessToken", newToken, {
      //       expires: 1,
      //     });
      //     props.router.navigate("/operator-info");
      //   }
      // } catch (e) {
      //   console.log("error forgot", e);
      // }
    },
    validateOnBlur: false,
  });

  const handleChangePassword = async () => {
    try {
      const response = await userService.changePassword({
        password: validation.values.password,
        password_confirmation: validation.values.rePassword,
        current_password: validation.values.currentPassword,
      });
      if (response.success) {
        toast.success("Change password successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        validation.resetForm();
      }
    } catch (e) { }
  };

  return (
    <Form
      className="form-horizontal"
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit();
        return false;
      }}
    >
      <div className="action-buttons">
        <h5>{i18n.t("change_password")}</h5>
        <div className="action-buttons mb-0">
          <button className="btn btn-primary w-md " type="submit">
            {i18n.t("change_password")}
          </button>
        </div>
      </div>
      <Row className="mb-3">
        <Col md={2}>
          <Label className="form-label">{i18n.t("current_pass")}</Label>
        </Col>
        <Col md={3}>
          <div className="position-relative">
            <Input
              name="currentPassword"
              autoComplete="off"
              style={{ backgroundImage: "none" }}
              value={validation.values.currentPassword || ""}
              type={showCurrentPassword ? "text" : "password"}
              placeholder={i18n.t("enter_current_pass")}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={
                validation.touched.currentPassword &&
                  validation.errors.currentPassword
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
                height: 38,
                zIndex: 1001,
                boxShadow: 'unset',
              }}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showPassword ? <IcEyeNone /> : <IcEye />}
            </button>
            {validation.touched.currentPassword &&
              validation.errors.currentPassword ? (
              <FormFeedback type="invalid">
                {validation.errors.currentPassword}
              </FormFeedback>
            ) : null}
          </div>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={2}>
          <Label className="form-label">{i18n.t("new_pass")}</Label>
        </Col>
        <Col md={3}>
          <div className="position-relative">
            <Input
              name="password"
              autoComplete="off"
              style={{ backgroundImage: "none" }}
              value={validation.values.password || ""}
              type={showPassword ? "text" : "password"}
              placeholder={i18n.t("enter_current_pass")}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={
                validation.touched.password && validation.errors.password
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
                height: 38,
                zIndex: 1001,
                boxShadow: 'unset'
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IcEyeNone /> : <IcEye />}
            </button>
            {validation.touched.password && validation.errors.password ? (
              <FormFeedback type="invalid">
                {validation.errors.password}
              </FormFeedback>
            ) : null}
          </div>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={2}>
          <Label className="form-label">{i18n.t("confirm_pass")}</Label>
        </Col>
        <Col md={3}>
          <div className="position-relative">
            <Input
              name="rePassword"
              autoComplete="off"
              style={{ backgroundImage: "none" }}
              value={validation.values.rePassword || ""}
              type={showRePassword ? "text" : "password"}
              placeholder={i18n.t("enter_current_pass")}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={
                validation.touched.rePassword && validation.errors.rePassword
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
                height: 38,
                zIndex: 1001,
                boxShadow: 'unset',
              }}
              onClick={() => setShowRePassword(!showRePassword)}
            >
              {showRePassword ? <IcEyeNone /> : <IcEye />}
            </button>
            {validation.touched.rePassword && validation.errors.rePassword ? (
              <FormFeedback type="invalid">
                {validation.errors.rePassword}
              </FormFeedback>
            ) : null}
          </div>
        </Col>
      </Row>
    </Form>
  );
};
export default ChangePassWordCustom;
