// Function Name : Staff Availability
// Created date :  31/7/24             by :  NgVinh
// Updated date :                      by :
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik } from "formik";
import staffService from "../../services/staff.service";
import { Button, Col, FormFeedback, Input, Label, Row } from "reactstrap";
import MyDropdown from "../../components/Common/MyDropdown";
import styled from "styled-components";
import { listDayOfWeek } from "../../constants/app.const";
import IcTrash from "../../assets/icon/IcTrash";
import IcPlusCircle from "../../assets/icon/IcPlusCircle";
import moment from "moment/moment";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import operatorService from "../../services/operator.service";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;
const StaffAvailability = (props) => {
  const navigate = useNavigate();
  const { profile } = props;
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [listLocation, setListLocation] = useState([]);
  const [isMultiLocation, setIsMultiLocation] = useState("");
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      time_available:
        profile?.time_available ||
        [
          // {
          //   weekday: 0,
          //   from: 0,
          //   to: 0,
          //   location_id: "",
          // },
        ],
      specific_time_available:
        profile?.specific_time_available ||
        [
          // {
          //   date: moment().format("yyyy-MM-DD"),
          //   from: 0,
          //   to: 0,
          //   location_id: "",
          // },
        ],
    },
    validationSchema: Yup.object({
      time_available: Yup.array().of(
        Yup.object().shape({
          weekday: Yup.number().required(i18n.t("field_required")),
          location_id: Yup.string().required(i18n.t("location_required")),
          from: Yup.number().required(i18n.t("field_required")),
          // .min(1, "Start time must be greater than 0"),
          to: Yup.number()
            .required(i18n.t("field_required"))
            .min(1, i18n.t("end_time_greater_0"))
            .test(
              "is-greater",
              i18n.t("end_time_greater_start"),
              function (value) {
                const { from } = this.parent;
                return value > from;
              }
            ),
        })
      ),
      specific_time_available: Yup.array().of(
        Yup.object().shape({
          date: Yup.string().required(i18n.t("field_required")),
          location_id: Yup.string().required(i18n.t("location_required")),
          from: Yup.number()
            .required(i18n.t("field_required"))
            .min(1, i18n.t("start_time_greater_0")),
          to: Yup.number()
            .required(i18n.t("field_required"))
            .min(1, i18n.t("end_time_greater_0"))
            .test(
              "is-greater",
              i18n.t("end_time_greater_start"),
              function (value) {
                const { from } = this.parent;
                return value > from;
              }
            ),
        })
      ),
    }),
  });
  const handleGetListLocation = async () => {
    try {
      const response = await operatorService.getListLocationForOperator();
      if (response.success) {
        setListLocation(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
  const addTimeAvailable = () => {
    validation.setFieldValue("time_available", [
      ...validation.values.time_available,
      validation.values.time_available.length !== 0 ?
        validation.values.time_available[validation.values.time_available.length - 1] : {
          weekday: 0,
          from: 0,
          to: 0,
          location_id: "",
        },
    ]);
  };
  const addTimeSpecialAvailable = () => {
    validation.setFieldValue("specific_time_available", [
      ...validation.values.specific_time_available,

      validation.values.specific_time_available.length !== 0 ? validation.values.specific_time_available[validation.values.specific_time_available.length - 1] :
        {
          date: "",
          from: 0,
          to: 0,
          location_id: "",
        },
    ]);
  };
  const deleteTimeAvailable = (index, key) => {
    validation.setFieldValue(
      key,
      validation.values[key].filter((item, i) => i !== index)
    );
  };

  const handleSubmitForm = async () => {
    try {
      if (!props.id) {
        return;
      }
      const res = await staffService.updateStaffAvailability(
        validation.values,
        props.id
      );
      if (res.success) {
        toast.success(i18n.t("update_staff_availability_successfully"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      } else {
        console.log("Update fail");
      }
    } catch (error) {
      console.log(error);
      validation.setErrors(error.errors);
    } finally {
      validation.setSubmitting(false);
    }
  };
  const handleBack = () => {
    navigate("/staff");
  };

  const convertMinutesToTimeString = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };
  const getDetailProfile = async () => {
    const res = await staffService.getDetailStaffProfile(props.id);
    setIsMultiLocation(
      res.data.is_multi_location === 0 ? res.data.location_id : ""
    );
  };

  // useEffect(() => {
  //   if (validation.values.time_available.length === 0) {
  //     addTimeAvailable();
  //   }
  //   if (validation.values.specific_time_available.length === 0) {
  //     addTimeSpecialAvailable();
  //   }
  // }, [validation.values]);
  useEffect(() => {
    if (!!isMultiLocation) {
      validation.setFieldValue(
        "time_available",
        validation.values.time_available.map((item) => {
          return {
            ...item,
            location_id: isMultiLocation,
          };
        })
      );
      validation.setFieldValue(
        "specific_time_available",
        validation.values.specific_time_available.map((item) => {
          return {
            ...item,
            location_id: isMultiLocation,
          };
        })
      );
    }
  }, [
    isMultiLocation,
    validation.values.time_available.length,
    validation.values.specific_time_available.length,
  ]);

  const canAddStaff = useMemo(() => {
    return permissionUser.includes("staff:create_schedule");
  }, [permissionUser]);

  useEffect(() => {
    getDetailProfile();
  }, [props.id, props.activeTab]);
  useEffect(() => {
    handleGetListLocation();
  }, []);

  return (
    <div className="bg-white">
      <div className="action-buttons">
        <h5>{i18n.t("staff_availability")}</h5>
        <div className="action-buttons">
          <div className="action-buttons mb-0">
            <Button
              color="success"
              className="btn-back"
              outline
              type="button"
              onClick={handleBack}
            >
              {i18n.t("back")}
            </Button>
            <button
              className="btn btn-primary btn-block"
              disabled={!props.id}
              style={{
                display: canAddStaff ? "block" : "none",
              }}
              onClick={() => {
                validation.setTouched({
                  time_available: validation.values.time_available.map(() => ({
                    from: true,
                    to: true,
                  })),
                  specific_time_available:
                    validation.values.specific_time_available.map(() => ({
                      from: true,
                      to: true,
                      date: true,
                    })),
                });
                if (validation.isValid) {
                  handleSubmitForm();
                }
              }}
            >
              {i18n.t("save")}
            </button>
          </div>
        </div>
      </div>
      <Row className="mt-4">
        <Label tag="h5" id="week">
          {i18n.t("recurring_weekly_availability")}
        </Label>
        <div>
          {validation.values.time_available.length === 0 && (
            <div
              onClick={addTimeAvailable}
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <IcPlusCircle />
            </div>
          )}
          {validation.values.time_available.map((time, index) => (
            <div className="d-flex flex-column" key={index}>
              <Row className="mt-3">
                <Col md={2}>
                  <MyDropdown
                    id={`time_available[${index}].location_id`}
                    name="location_id"
                    placeholder={i18n.t("location")}
                    displayEmpty
                    options={listLocation}
                    selected={isMultiLocation || time.location_id}
                    disabled={!!isMultiLocation}
                    invalid={
                      validation.errors.time_available &&
                      validation.errors.time_available[index] &&
                      validation.errors.time_available[index]?.location_id
                    }
                    setSelected={(e) => {
                      const newWifiSettings = JSON.parse(
                        JSON.stringify(validation.values.time_available)
                      );
                      newWifiSettings[index].location_id = e;
                      validation.setFieldValue(
                        "time_available",
                        newWifiSettings
                      );
                    }}
                    onBlur={validation.handleBlur}
                    isForm={true}
                  />
                  {validation.errors.time_available &&
                    validation.errors.time_available[index] &&
                    validation.errors.time_available[index]?.location_id && (
                      <InvalidFeedback>
                        {validation.errors.time_available[index]?.location_id}
                      </InvalidFeedback>
                    )}
                </Col>
                <Col md={3}>
                  <MyDropdown
                    id={`time_available[${index}].weekday`}
                    name="weekday"
                    placeholder={i18n.t("days")}
                    displayEmpty
                    options={listDayOfWeek}
                    selected={time.weekday}
                    invalid={
                      validation.errors.time_available &&
                      validation.errors.time_available[index] &&
                      validation.errors.time_available[index]?.weekday
                    }
                    setSelected={(e) => {
                      const newWifiSettings = JSON.parse(
                        JSON.stringify(validation.values.time_available)
                      );
                      newWifiSettings[index].weekday = e;
                      validation.setFieldValue(
                        "time_available",
                        newWifiSettings
                      );
                    }}
                    onBlur={validation.handleBlur}
                    isForm={true}
                  />
                  {validation.errors.time_available &&
                    validation.errors.time_available[index] &&
                    validation.errors.time_available[index]?.weekday && (
                      <InvalidFeedback>
                        {validation.errors.time_available[index]?.weekday}
                      </InvalidFeedback>
                    )}
                </Col>
                <Col md={5}>
                  <Row>
                    <Col md={2} className="d-flex justify-content-center">
                      {i18n.t("from")}
                    </Col>
                    <Col md={4}>
                      <Input
                        className="form-control"
                        type="time"
                        placeholder={i18n.t("from")}
                        value={convertMinutesToTimeString(time.from)}
                        id={`time_available[${index}].from`}
                        onChange={(e) => {
                          console.log(e.target.value);
                          const [hours, minutes] = e.target.value
                            .split(":")
                            .map(Number);
                          const totalMinutes = hours * 60 + minutes;
                          const newWifiSettings = JSON.parse(
                            JSON.stringify(validation.values.time_available)
                          );
                          newWifiSettings[index].from = totalMinutes;
                          validation.setFieldValue(
                            "time_available",
                            newWifiSettings
                          );
                        }}
                        onBlur={validation.handleBlur}
                        invalid={
                          validation.errors.time_available &&
                          validation.touched.time_available &&
                          validation.touched.time_available[index] &&
                          validation.touched.time_available[index].from &&
                          validation.errors.time_available[index] &&
                          validation.errors.time_available[index]?.from
                        }
                      />
                      {validation.errors.time_available &&
                        validation.touched.time_available &&
                        validation.touched.time_available[index] &&
                        validation.touched.time_available[index].from &&
                        validation.errors.time_available[index] &&
                        validation.errors.time_available[index]?.from && (
                          <FormFeedback>
                            {validation.errors.time_available[index]?.from}
                          </FormFeedback>
                        )}
                    </Col>
                    <Col md={2} className="d-flex justify-content-center">
                      {i18n.t("to")}
                    </Col>
                    <Col md={4}>
                      <Input
                        className="form-control"
                        type="time"
                        placeholder={i18n.t("to")}
                        value={convertMinutesToTimeString(time.to)}
                        id={`time_available[${index}].to`}
                        onChange={(e) => {
                          console.log(e.target.value);
                          const [hours, minutes] = e.target.value
                            .split(":")
                            .map(Number);
                          const totalMinutes = hours * 60 + minutes;
                          const newWifiSettings = JSON.parse(
                            JSON.stringify(validation.values.time_available)
                          );
                          newWifiSettings[index].to = totalMinutes;
                          validation.setFieldValue(
                            "time_available",
                            newWifiSettings
                          );
                        }}
                        onBlur={validation.handleBlur}
                        invalid={
                          validation.errors.time_available &&
                          validation.touched.time_available &&
                          validation.touched.time_available[index] &&
                          validation.touched.time_available[index].to &&
                          validation.errors.time_available[index] &&
                          validation.errors.time_available[index]?.to
                        }
                      />
                      {validation.errors.time_available &&
                        validation.touched.time_available &&
                        validation.touched.time_available[index] &&
                        validation.touched.time_available[index].to &&
                        validation.errors.time_available[index] &&
                        validation.errors.time_available[index]?.to && (
                          <FormFeedback>
                            {validation.errors.time_available[index]?.to}
                          </FormFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
                <Col md={2}>
                  <div className="d-flex justify-content-end align-items-center gap-3">
                    {index === validation.values.time_available.length - 1 && (
                      <div onClick={addTimeAvailable}>
                        <IcPlusCircle />
                      </div>
                    )}
                    {/* {validation.values.time_available.length !== 1 && ( */}
                    <div
                      onClick={() =>
                        deleteTimeAvailable(index, "time_available")
                      }
                    >
                      <IcTrash />
                    </div>
                    {/* )} */}
                  </div>
                </Col>
              </Row>
            </div>
          ))}
        </div>
        <Row>
          <div
            // className="w-100"
            style={{
              borderTop: "1px solid #D9D9D9",
              margin: "20px 8px 20px 8px",
            }}
          ></div>
        </Row>
        <Label tag="h5" id="week">
          {i18n.t("date_specific_availability")}
        </Label>
        <div style={{ fontWeight: "400", fontSize: 14 }} color="">
          {i18n.t(
            "days_added_here_will_overide_any_set_in_the_recurring_schedule_above"
          )}
        </div>
        <div>
          {validation.values.specific_time_available.length === 0 && (
            <div
              onClick={addTimeSpecialAvailable}
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <IcPlusCircle />
            </div>
          )}
          {validation.values.specific_time_available.map((time, index) => (
            <div className="d-flex flex-column" key={index}>
              <Row className="mt-3">
                <Col md={2}>
                  <MyDropdown
                    id={`specific_time_available[${index}].location_id`}
                    name="location"
                    placeholder={i18n.t("location")}
                    displayEmpty
                    options={listLocation}
                    selected={time.location_id}
                    invalid={
                      validation.errors.specific_time_available &&
                      validation.errors.specific_time_available[index] &&
                      validation.errors.specific_time_available[index]
                        ?.location_id
                    }
                    setSelected={(e) => {
                      const newWifiSettings = JSON.parse(
                        JSON.stringify(
                          validation.values.specific_time_available
                        )
                      );
                      newWifiSettings[index].location_id = e;
                      validation.setFieldValue(
                        "specific_time_available",
                        newWifiSettings
                      );
                    }}
                    onBlur={validation.handleBlur}
                    isForm={true}
                  />
                  {validation.errors.specific_time_available &&
                    validation.errors.specific_time_available[index] &&
                    validation.errors.specific_time_available[index]
                      ?.location_id && (
                      <InvalidFeedback>
                        {
                          validation.errors.specific_time_available[index]
                            ?.location_id
                        }
                      </InvalidFeedback>
                    )}
                </Col>
                <Col md={3}>
                  <Input
                    className="form-control"
                    type="date"
                    value={time.date || ""}
                    id={`specific_time_available[${index}].date`}
                    onChange={(e) => {
                      console.log(e.target.value);
                      const newWifiSettings = JSON.parse(
                        JSON.stringify(
                          validation.values.specific_time_available
                        )
                      );
                      newWifiSettings[index].date = e.target.value;
                      validation.setFieldValue(
                        "specific_time_available",
                        newWifiSettings
                      );
                    }}
                    onBlur={validation.handleBlur}
                    invalid={
                      validation.errors.specific_time_available &&
                      validation.touched.specific_time_available &&
                      validation.touched.specific_time_available[index] &&
                      validation.touched.specific_time_available[index].date &&
                      validation.errors.specific_time_available[index] &&
                      validation.errors.specific_time_available[index]?.date
                    }
                  />
                  {validation.errors.specific_time_available &&
                    validation.touched.specific_time_available &&
                    validation.touched.specific_time_available[index] &&
                    validation.touched.specific_time_available[index].date &&
                    validation.errors.specific_time_available[index] &&
                    validation.errors.specific_time_available[index]?.date && (
                      <InvalidFeedback>
                        {validation.errors.specific_time_available[index]?.date}
                      </InvalidFeedback>
                    )}
                </Col>
                <Col md={5}>
                  <Row>
                    <Col md={2} className="d-flex justify-content-center">
                      {i18n.t("from")}
                    </Col>
                    <Col md={4}>
                      <Input
                        className="form-control"
                        type="time"
                        placeholder={i18n.t("from")}
                        value={convertMinutesToTimeString(time.from)}
                        id={`specific_time_available[${index}].from`}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value
                            .split(":")
                            .map(Number);
                          const totalMinutes = hours * 60 + minutes;
                          const newWifiSettings = JSON.parse(
                            JSON.stringify(
                              validation.values.specific_time_available
                            )
                          );
                          newWifiSettings[index].from = totalMinutes;
                          validation.setFieldValue(
                            "specific_time_available",
                            newWifiSettings
                          );
                        }}
                        onBlur={validation.handleBlur}
                        invalid={
                          validation.errors.specific_time_available &&
                          validation.touched.specific_time_available &&
                          validation.touched.specific_time_available[index] &&
                          validation.touched.specific_time_available[index]
                            .from &&
                          validation.errors.specific_time_available[index] &&
                          validation.errors.specific_time_available[index]?.from
                        }
                      />
                      {validation.errors.specific_time_available &&
                        validation.touched.specific_time_available &&
                        validation.touched.specific_time_available[index] &&
                        validation.touched.specific_time_available[index]
                          .from &&
                        validation.errors.specific_time_available[index] &&
                        validation.errors.specific_time_available[index]
                          ?.from && (
                          <FormFeedback>
                            {
                              validation.errors.specific_time_available[index]
                                ?.from
                            }
                          </FormFeedback>
                        )}
                    </Col>
                    <Col md={2} className="d-flex justify-content-center">
                      {i18n.t("to")}
                    </Col>
                    <Col md={4}>
                      <Input
                        className="form-control"
                        type="time"
                        placeholder={i18n.t("to")}
                        value={convertMinutesToTimeString(time.to)}
                        id={`specific_time_available[${index}].to`}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value
                            .split(":")
                            .map(Number);
                          const totalMinutes = hours * 60 + minutes;
                          const newWifiSettings = JSON.parse(
                            JSON.stringify(
                              validation.values.specific_time_available
                            )
                          );
                          newWifiSettings[index].to = totalMinutes;
                          validation.setFieldValue(
                            "specific_time_available",
                            newWifiSettings
                          );
                        }}
                        onBlur={validation.handleBlur}
                        invalid={
                          validation.errors.specific_time_available &&
                          validation.touched.specific_time_available &&
                          validation.touched.specific_time_available[index] &&
                          validation.touched.specific_time_available[index]
                            .to &&
                          validation.errors.specific_time_available[index] &&
                          validation.errors.specific_time_available[index]?.to
                        }
                      />
                      {validation.errors.specific_time_available &&
                        validation.touched.specific_time_available &&
                        validation.touched.specific_time_available[index] &&
                        validation.touched.specific_time_available[index].to &&
                        validation.errors.specific_time_available[index] &&
                        validation.errors.specific_time_available[index]
                          ?.to && (
                          <FormFeedback>
                            {
                              validation.errors.specific_time_available[index]
                                ?.to
                            }
                          </FormFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
                <Col md={2}>
                  <div className="d-flex justify-content-end align-items-center gap-3">
                    {index ===
                      validation.values.specific_time_available.length - 1 && (
                        <div onClick={addTimeSpecialAvailable}>
                          <IcPlusCircle />
                        </div>
                      )}
                    {/* {validation.values.specific_time_available.length !== 1 && ( */}
                    <div
                      onClick={() =>
                        deleteTimeAvailable(index, "specific_time_available")
                      }
                    >
                      <IcTrash />
                    </div>
                    {/* )} */}
                  </div>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
};

StaffAvailability.propTypes = {
  id: PropTypes.number,
  activeTab: PropTypes.string,
  profile: PropTypes.object,
};
export default StaffAvailability;
