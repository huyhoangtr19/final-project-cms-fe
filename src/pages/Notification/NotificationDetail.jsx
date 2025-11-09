import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import Breadcrumb from "../../components/Common/Breadcrumb";
import i18n from "../../i18n";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { listLabelCustomer } from "../../constants/app.const";
import { useFormik } from "formik";
import * as Yup from "yup";
import notificationService from "../../services/notification.service";
import { useNavigate, useParams } from "react-router-dom";
import CustomDatePicker from "../../components/Common/CustomerDatePicker";
import styled from "styled-components";
import { toast } from "react-toastify";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const NotificationDetail = (props) => {
  const { id } = useParams();
  const [notificationDetail, setNotificationDetail] = useState(null);
  const [openSchedule, setOpenSchedule] = useState(false);
  const navigate = useNavigate();
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: notificationDetail?.title || "",
      body: notificationDetail?.body || "",
      group_type: notificationDetail?.group_type || [],
      date_push: notificationDetail?.date_push || "",
      // status: notificationDetail.status || "",
      // date_push: notificationDetail.date_push || "",
    },
    validationSchema: Yup.object({
      title: Yup.string().nullable(),
      body: Yup.string().nullable(),
      // service_location: Yup.array().min(1, i18n.t("location_required")),
    }),
    onSubmit: (values) => {
      handleSubmitForm();
    },
  });
  const setTouchedFields = () => {
    const touchedFields = {};
    Object.keys(validation.values).forEach((key) => {
      if (Array.isArray(validation.values[key])) {
        touchedFields[key] = validation.values[key].map((item) => {
          const subTouchedFields = {};
          Object.keys(item).forEach((subKey) => {
            subTouchedFields[subKey] = true;
          });
          return subTouchedFields;
        });
      } else {
        touchedFields[key] = true;
      }
    });
    validation.setTouched(touchedFields, true);
  };
  const handleBack = () => {
    navigate("/notification");
  };
  function formatDateSend(dateString) {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const formattedDate = date
      .toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', options)
      .replace(",", "");
    return formattedDate;
  }

  const handleChangePermissionItem = (id) => {
    validation.setFieldValue(
      "group_type",
      validation.values.group_type.includes(id)
        ? validation.values.group_type.filter((no) => no !== id)
        : [...validation.values.group_type, id]
    );
    // setListType((item) =>
    //   item.includes(id) ? item.filter((no) => no !== id) : [...item, id]
    // );
  };
  const handleCancel = async () => {
    try {
      const res = await notificationService.cancelSendSchedule(id);
      if (res.success) {
        toast.success(`Cancel send successfully`, {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("e", e);
    }
  };

  const handleChangeAll = () => {
    if (!isCheckAll) {
      validation.setFieldValue(
        "group_type",
        listLabelCustomer.map((item) => {
          return item.value;
        })
      );
    } else {
      validation.setFieldValue("group_type", []);
    }
  };

  const handleSubmitForm = async () => {
    try {
      const payload = {
        ...validation.values,
        immediately: true,
      };
      const response =
        props.type === "create"
          ? await notificationService.createNotification(payload)
          : await notificationService.updateNotification(id, payload);
      if (response.success) {
        // navigate("/users");
        toast.success(
          `${props.type === "create" ? "Create" : "Update"} Send successfully`,
          {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
            hideProgressBar: true,
          }
        );
        handleBack();
      }
    } catch (e) {
      console.log(e);
      validation.setErrors(e.errors);
      if (e?.errors?.date_push) {
        toast.error(e.errors.date_push, {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    }
  };
  const handleSendSchedule = async (date_push = "") => {
    try {
      const payload = {
        ...validation.values,
        immediately: false,
        status: 1,
        date_push: date_push.length ? date_push : validation.values.date_push,
      };
      const response =
        props.type === "create"
          ? await notificationService.createNotification(payload)
          : await notificationService.updateNotification(id, payload);
      if (response.success) {
        // navigate("/users");
        toast.success(
          `${props.type === "create" ? "Create" : "Update"
          } Send Schedule successfully`,
          {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
            hideProgressBar: true,
          }
        );
        handleBack();
      }
    } catch (e) {
      console.log(e);
      validation.setErrors(e.errors);
      if (e?.errors?.date_push) {
        toast.error(e.errors.date_push, {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    }
  };

  const handleSaveDraft = async () => {
    try {
      setTouchedFields();
      await validation.validateForm();
      if (!validation.isValid) {
        return;
      }
      const payload = {
        ...validation.values,
        // immediately: validation.values.date_push.length > 0,
        status: 0,
      };
      const response =
        props.type === "create"
          ? await notificationService.createNotification(payload)
          : await notificationService.updateNotification(id, payload);
      if (response.success) {
        // navigate("/users");
        toast.success(
          `${props.type === "create" ? "Create" : "Update"} Draft successfully`,
          {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
            hideProgressBar: true,
          }
        );
        handleBack();
      }
    } catch (e) {
      console.log("err", e);
      validation.setErrors(e.errors);
      if (e?.errors?.date_push) {
        toast.error(e.errors.date_push, {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    }
  };

  const getDetailNotification = async (id) => {
    try {
      const response = await notificationService.getNotificationDetail(id);
      if (response.success) {
        setNotificationDetail(response.data.data);
      }
    } catch (e) {
      console.log("e", e);
    }
  };

  useEffect(() => {
    if (id) {
      getDetailNotification(id);
    }
  }, [id]);

  const isCheckAll = useMemo(() => {
    return listLabelCustomer.every((item) =>
      validation.values.group_type.includes(item.value)
    );
  }, [validation.values.group_type, listLabelCustomer]);

  const isSend = useMemo(() => {
    return notificationDetail && notificationDetail.status === 2;
  }, [notificationDetail]);
  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values.group_type) !==
      JSON.stringify(validation.initialValues.group_type) ||
      JSON.stringify(validation.values.body) !==
      JSON.stringify(validation.initialValues.body) ||
      JSON.stringify(validation.values.title) !==
      JSON.stringify(validation.initialValues.title)
    );
  }, [validation.values, validation.initialValues]);

  return (
    <React.Fragment>
      <div className="page-content content-container">
        <Breadcrumb
          title={i18n.t("notification")}
          breadcrumbItem={
            props.type === "create"
              ? i18n.t('add_new_notification')
              : i18n.t("notification_detail")
          }
        />
        <div>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              setTouchedFields();
              await validation.validateForm();
              if (validation.isValid) {
                validation.handleSubmit();
              }
              return false;
            }}
          >
            <div className="action-buttons">
              <h5>{i18n.t("general_info")}</h5>
              <div className="action-buttons mb-0">
                <Button
                  color="success"
                  outline
                  className="px-4 btn-back"
                  type="button"
                  onClick={handleBack}
                >
                  {i18n.t("back")}
                </Button>
                {(!notificationDetail || notificationDetail.status === 0) && (
                  <div className="d-flex gap-3">
                    <Button
                      color="primary"
                      outline
                      className="px-4"
                      disabled={
                        validation.values.body.replace(/<[^>]*>/g, "")
                          .length === 0 || !isChanged
                      }
                      onClick={() => {
                        handleSaveDraft();
                      }}
                    >
                      <div className="d-flex gap-2">{i18n.t("save_draft")}</div>
                    </Button>
                    <div className="d-flex gap-1">
                      <Button
                        color="primary"
                        disabled={
                          validation.values.body.replace(/<[^>]*>/g, "")
                            .length === 0
                        }
                        type="submit"
                      >
                        {i18n.t("send")}
                      </Button>

                      <UncontrolledDropdown>
                        <DropdownToggle
                          caret
                          color="primary"
                          disabled={
                            validation.values.body.replace(/<[^>]*>/g, "")
                              .length === 0
                          }
                        >
                          <i className="bx bxs-down-arrow text-light"></i>
                        </DropdownToggle>
                        <DropdownMenu style={{ padding: 0, margin: "8px 0" }}>
                          <DropdownItem
                            style={{ background: '#556ee6', color: 'white', borderRadius: 4, textAlign: 'center' }}
                            key={"1"}
                            onClick={() => {
                              validation.values.body.replace(/<[^>]*>/g, "")
                                .length !== 0 && setOpenSchedule(true);
                            }}
                          >
                            {i18n.t("schedule")}
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>
                  </div>
                )}
                {notificationDetail && notificationDetail.status === 1 && (
                  <Button
                    color="danger"
                    outline={true}
                    className="px-2"
                    onClick={() => {
                      handleCancel();
                    }}
                  >
                    {i18n.t('cancel_send')}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-2">
              <Col md={3}>
                <Label>{i18n.t("group_type")}</Label>
              </Col>
              <Col md={3}>
                <Label>{i18n.t("subject")}</Label>
              </Col>
              <Col md={6}>
                {notificationDetail &&
                  (notificationDetail.status === 1 ||
                    notificationDetail.status === 2) && (
                    <div
                      className="d-flex text-primary justify-content-end"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        notificationDetail.status === 1 &&
                          setOpenSchedule(true);
                      }}
                    >
                      {notificationDetail.status === 1
                        ? `${i18n.t('schedule_send_on')} ${formatDateSend(
                          notificationDetail.date_push
                        )}`
                        : `${i18n.t('send_on')}: ${formatDateSend(
                          notificationDetail.date_push
                        )}`}
                    </div>
                  )}
              </Col>
            </div>
            <Row>
              <Col
                md={3}
                style={{
                  borderRadius: 4,
                  border:
                    validation.errors?.group_type &&
                      validation.touched?.group_type
                      ? "1px solid #f46a6a"
                      : "1px solid #ced4da",
                }}
              >
                <Row>
                  <div
                    className="d-flex"
                    style={{
                      flexDirection: "column",
                      height: "auto",
                      opacity: isSend ? 0.2 : 1,
                    }}
                  >
                    <Row>
                      <div className="d-flex flex-row align-items-start justify-content-between gap-1 p-2 w-full">
                        <div
                          style={{
                            color: "rgba(0, 0, 0, 0.85)",
                            fontSize: "14px",
                            lineHeight: "22px",
                            fontWeight: "400",
                          }}
                        >
                          {i18n.t("all")}
                        </div>
                        <div onClick={() => !isSend && handleChangeAll()}>
                          <input
                            style={{ marginTop: "4px" }}
                            type="checkbox"
                            id={"all"}
                            name={"all"}
                            value={"all"}
                            checked={isCheckAll}
                            onChange={() => { }}
                          />
                        </div>
                      </div>
                    </Row>
                    {listLabelCustomer.map((permission) => (
                      <Row key={permission.value}>
                        <div className="d-flex flex-row align-items-start justify-content-between gap-1 p-2 w-full">
                          <div
                            style={{
                              color: "rgba(0, 0, 0, 0.85)",
                              fontSize: "14px",
                              lineHeight: "22px",
                              fontWeight: "400",
                            }}
                          >
                            {i18n.t(permission.label)}
                          </div>
                          <div
                            onClick={() =>
                              !isSend &&
                              handleChangePermissionItem(permission.value)
                            }
                          >
                            <input
                              style={{ marginTop: "4px" }}
                              type="checkbox"
                              id={permission.value}
                              name={permission.value}
                              value={permission.value}
                              checked={validation.values.group_type.includes(
                                permission.value
                              )}
                              onChange={() => { }}
                            />
                          </div>
                        </div>
                      </Row>
                    ))}
                  </div>
                </Row>
                <Row>
                  {validation.errors?.group_type &&
                    validation.touched?.group_type && (
                      <InvalidFeedback>
                        {validation.errors?.group_type}
                      </InvalidFeedback>
                    )}
                </Row>
              </Col>
              <Col md={9}>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder={i18n.t("Subject")}
                  value={validation.values.title}
                  disabled={isSend}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={
                    validation.touched.title && validation.errors.title
                  }
                />
                {validation.errors.title && validation.touched.title && (
                  <InvalidFeedback>{validation.errors.title}</InvalidFeedback>
                )}
                <Label className="mt-3">Content</Label>
                <Row className="mt-2">
                  <div
                    style={{
                      height: "auto",
                      // borderRadius:8
                      // minHeight: 100,
                      // margin: 10,
                    }}
                  >
                    <ReactQuill
                      style={{
                        minHeight: 200,
                        borderRadius: 8,
                      }}
                      className={`${validation.touched?.body &&
                        validation.errors?.body &&
                        "notification-error"
                        }`}
                      theme="snow"
                      id="body"
                      name="body"
                      readOnly={isSend}
                      value={validation.values.body}
                      onChange={(e) => {
                        validation.setFieldValue("body", e);
                      }}
                      onBlur={validation.handleBlur}
                      invalid={
                        validation.touched.body && validation.errors.body
                      }
                    />
                    {validation.errors.body && validation.touched.body && (
                      <InvalidFeedback>
                        {validation.errors.body}
                      </InvalidFeedback>
                    )}
                  </div>
                </Row>
              </Col>
            </Row>
          </Form>
          {openSchedule && (
            <CustomDatePicker
              isOpen={openSchedule}
              title={i18n.t('schedule_send')}
              data={validation.values.date_push}
              onClose={() => setOpenSchedule(false)}
              onSend={(e) => {
                validation.setFieldValue("date_push", e);

                setOpenSchedule(false);
                setTouchedFields();
                validation.validateForm();
                if (validation.isValid) {
                  handleSendSchedule(e);
                }
              }}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default NotificationDetail;
