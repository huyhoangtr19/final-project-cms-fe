// Function Name : Modal Schedule Detail
// Created date :  3/8/24             by :  NgVinh
// Updated date :  4/8/24             by :  NgVinh
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import operatorService from "../../../services/operator.service";
import styled from "styled-components";
import { toast } from "react-toastify";
import MyDropdown from "../../../components/Common/MyDropdown";
import { listDayOfWeek, listFrequency } from "../../../constants/app.const";
import moment from "moment/moment";
import IcPlusCircle from "../../../assets/icon/IcPlusCircle";
import IcTrash from "../../../assets/icon/IcTrash";
import staffService from "../../../services/staff.service";
import classService from "../../../services/class.service";
import {
  convertMinutesToTimeString,
  getDayOfWeekFromDate,
} from "../../../utils/app";
import i18n from "../../../i18n";
import InputCurrency from "../../../components/Common/InputCurrency";
import { min } from "lodash";
const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;
const ModalScheduleDetail = ({
  id,
  isOpen,
  onClose,
  onAdd,
  isAdd,
  serviceId = null,
  name = "",
  scheduleInfo = null,
  date = null,
}) => {
  const [listLocation, setListLocation] = useState([]);
  const [trainers, setTrainers] = useState([[]]);
  const [listClass, setListClass] = useState([]);
  const [valueDefault, setValueDefault] = useState(null);
  const [staffDefault, setStaffDefault] = useState([]);
  const [canUpdate, setCanUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = useMemo(() => {
    return isAdd ? i18n.t("add_new_schedule") : i18n.t("schedule_detail");
  }, [isAdd]);

  const validation = useFormik({
    initialValues: {
      class: "",
      frequency: "",
      capacity: "",
      start_date: moment().format("yyyy-MM-DD"),
      end_date: moment().format("yyyy-MM-DD"),
      location_id: "",
      pre_booking_hours: "",
      cancellation_period_hours: "",
      min_bookings: "",
      cancel_before_minutes: "",
      class_times: [
        {
          day: 1,
          date: moment().format("yyyy-MM-DD"),
          staff_id: "",
          start_time: 0,
          end_time: 0,
          trainer_session_gains: null,
        },
      ],
    },
    validationSchema: (values) => validationSchema(values),
    context: { isAdd },
    validateOnChange: true,
    onSubmit: (values) => {
      handleSubmitForm();
    },
  });

  const validationSchema = (values) =>
    Yup.object({
      frequency: Yup.string().required(i18n.t("field_required")),
      capacity: Yup.string().required(i18n.t("field_required")),
      start_date: Yup.string().required(i18n.t("field_required")),
      end_date: Yup.string().required(i18n.t("field_required")),
      pre_booking_hours: Yup.number().required(i18n.t("field_required")),
      location_id: Yup.string().required(i18n.t("location_required")),
      cancellation_period_hours: Yup.number().nullable(),
      min_bookings: Yup.number().nullable(),
      cancel_before_minutes: Yup.number().nullable(),
      class: serviceId
        ? Yup.string().nullable()
        : Yup.string().required(i18n.t("field_required")),
      class_times: Yup.array().of(
        Yup.object().shape({
          date: Yup.string().when("$isAdd", {
            is: true,
            then: (schema) => schema, // Không validate gì khi isAdd = true
            otherwise: (schema) =>
              schema
                .required(i18n.t("field_required"))
                .test(
                  "is-greater-than-start-date",
                  i18n.t("date_must_be_greater_than_now_and_before_end_date"),
                  function (value) {
                    const { start_date, end_date } = this.options.context;
                    return (
                      moment(value).isSameOrAfter(start_date) &&
                      moment(value).isSameOrBefore(end_date)
                    );
                  }
                ),
          }),
          staff_id: Yup.string().required(i18n.t("field_required")),
          start_time: Yup.number().required(i18n.t("field_required")),
          end_time: Yup.number()
            .required(i18n.t("field_required"))
            .test(
              "is-greater",
              i18n.t("end_time_greater_start"),
              function (value) {
                const { start_time } = this.parent;
                return value > start_time;
              }
            ),
          trainer_session_gains: Yup.number()
            .required(i18n.t("field_required"))
            .min(0),
        })
      ),
    });

  const addTimeAvailable = () => {
    validation.setFieldValue("class_times", [
      ...validation.values.class_times,
      {
        day: 1,
        staff_id: "",
        start_time: 0,
        end_time: 0,
        list_Staff: [],
        trainer_session_gains: null,
      },
    ]);
  };
  const deleteTimeAvailable = (index) => {
    validation.setFieldValue(
      "class_times",
      validation.values.class_times.filter((item, i) => i !== index)
    );
  };
  const handleSubmitForm = async () => {
    try {
      if (loading) {
        return;
      }

      setLoading(true);
      const payload = {
        ...validation.values,
      };
      const payloadUpdate = {
        capacity: validation.values.capacity,
        pre_booking_hours: validation.values.pre_booking_hours,
        cancellation_period_hours: validation.values.cancellation_period_hours,
        min_bookings: validation.values.min_bookings,
        cancel_before_minutes: validation.values.cancel_before_minutes,
        staff_id: validation.values.class_times[0].staff_id,
        trainer_session_gains:
          validation.values.class_times[0].trainer_session_gains,
        date: validation.values.class_times[0].date,
        start_time: validation.values.class_times[0].start_time,
        end_time: validation.values.class_times[0].end_time,
      };
      // if(!serviceId){

      // }
      const response = !serviceId
        ? await classService.createScheduleForClass(
            payload,
            validation.values.class
          )
        : isAdd
        ? await classService.createScheduleForClass(payload, id)
        : await classService.updateScheduleForClass(
            payloadUpdate,
            scheduleInfo
          );
      if (response.success) {
        onClose();
        onAdd();
        toast.success(`${isAdd ? "Create" : "Update"} Schedule successfully`, {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("Error", e);
      if (e.message && e.message === "staff_not_available") {
        toast.error(i18n.t("create_schedule_fail"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
      if (e.message && e.message === "cannot_update_past_class_timeline") {
        toast.error(i18n.t("cannot_update_past_class_timeline"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
      if (e.errors) {
        validation.setErrors(e.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetListLocation = async () => {
    try {
      const serviceIdTemp = serviceId
        ? serviceId
        : listClass.find(
            (item) =>
              item.value.toString() === validation.values.class.toString()
          )?.service_id;
      const response = await operatorService.getListLocationForService(
        serviceIdTemp
      );
      if (response.success) {
        setListLocation(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          })
        );
      }
    } catch (e) {
      console.log("error:", e);
    }
  };

  const getListClass = async () => {
    const payload = {
      limit: -1,
    };
    const res = await classService.getListClass(payload);
    const temp = res.data.map((item) => {
      return {
        ...item,
        value: item.id,
        label: item.name,
      };
    });
    setListClass(temp);
  };

  const getListTrainer = async (
    weekDay,
    start_time,
    end_time,
    index,
    start_date,
    end_date,
    frequency
  ) => {
    try {
      let payload = null;
      if (isAdd) {
        payload = {
          location_id: validation.values.location_id,
          start_time: start_time,
          end_time: end_time,
          weekday: weekDay,
          start_date: start_date,
          end_date: end_date,
          frequency: frequency,
        };
      } else {
        payload = {
          location_id: validation.values.location_id,
          start_time: start_time,
          end_time: end_time,
          weekday: weekDay,
          start_date: start_date,
          end_date: end_date,
          frequency: frequency,
        };
      }
      const response = await staffService.getListTrainerAvaiableForLocation(
        payload
      );
      if (response.success) {
        setTrainers((prevState) => {
          const newTrainers = [...prevState];
          if (response.data.length === 0) {
            if (!isAdd && staffDefault.length > 0) {
            } else {
              validation.setFieldValue(`class_times[${index}].staff_id`, "");
            }
          }

          if (!isAdd && staffDefault.length > 0) {
            newTrainers[index] = staffDefault.concat(
              response.data.map((item) => {
                return {
                  value: item.id,
                  label: item.last_name + " " + item.first_name,
                };
              })
            );
            return newTrainers;
          }

          newTrainers[index] = response.data.map((item) => {
            return {
              value: item.id,
              label: item.last_name + " " + item.first_name,
            };
          });
          return newTrainers;
        });
      }
    } catch (e) {
      console.log("error:", e);
    }
  };

  const getDetailPackage = async (id) => {
    try {
      const response = await classService.getDetailScheduleForClass(id);
      if (response.success) {
        setStaffDefault([
          {
            value: response.data.staff_id,
            label:
              response?.data?.staff?.last_name +
              " " +
              response?.data?.staff?.first_name,
          },
        ]);
        validation.setValues({
          frequency: response.data.class_schedule.frequency,
          capacity: response.data.class_schedule.capacity,
          start_date: moment(response.data.class_schedule.start_date).format(
            "yyyy-MM-DD"
          ),
          end_date: moment(response.data.class_schedule.end_date).format(
            "yyyy-MM-DD"
          ),
          location_id: response.data.location.id,
          pre_booking_hours: response.data.class_schedule.pre_booking_hours,
          cancellation_period_hours:
            response.data.class_schedule.cancellation_period_hours,
          min_bookings: response.data?.class_schedule?.min_bookings || 0,
          cancel_before_minutes: response.data?.class_schedule?.cancel_before_minutes || 0,
          class_times: [
            {
              day: response.data.day,
              date: moment(response.data.date).format("yyyy-MM-DD"),
              staff_id: response.data.staff_id,
              start_time: response.data.start_time,
              end_time: response.data.end_time,
              trainer_session_gains: response.data.trainer_session_gains,
            },
          ],
        });

        setValueDefault({
          frequency: response.data.class_schedule.frequency,
          capacity: response.data.class_schedule.capacity,
          start_date: moment(response.data.class_schedule.start_date).format(
            "yyyy-MM-DD"
          ),
          end_date: moment(response.data.class_schedule.end_date).format(
            "yyyy-MM-DD"
          ),
          location_id: response.data.location.id,
          pre_booking_hours: response.data.class_schedule.pre_booking_hours,
          cancellation_period_hours:
            response.data.class_schedule.cancellation_period_hours,
          min_bookings: response.data?.class_schedule?.min_bookings || 0,  
          cancel_before_minutes: response.data?.class_schedule?.cancel_before_minutes || 0,
          class_times: [
            {
              day: response.data.day,
              staff_id: response.data.staff_id,
              start_time: response.data.start_time,
              end_time: response.data.end_time,
            },
          ],
        });
        setCanUpdate(response.data.status === 0 || response.data.status === 3);
        //moment(item.date).format("yyyy-MM-DD"),
      }
    } catch (e) {
      console.log("Error", e);
    }
  };

  const isChanged = useMemo(() => {
    return JSON.stringify(validation.values) !== JSON.stringify(valueDefault);
  }, [validation.values, valueDefault]);

  useEffect(() => {
    if (validation.values.frequency === "1" && validation.values.start_date) {
      validation.setFieldValue("end_date", validation.values.start_date);
      validation.setFieldValue(
        "class_times",
        validation.values.class_times.map((item) => ({
          ...item,
          day: getDayOfWeekFromDate(validation.values.start_date),
        }))
      );
    }
  }, [
    validation.values.frequency,
    validation.values.start_date,
    validation.values.class_times.length,
  ]);

  useEffect(() => {
    const init = async () => {
      if (isOpen && scheduleInfo && listLocation.length) {
        await getDetailPackage(scheduleInfo);
      }
    };
    init();
  }, [isOpen, scheduleInfo, listLocation]);
  useEffect(() => {
    if (!serviceId) {
      getListClass();
    } else {
      handleGetListLocation();
    }
    // getListTrainerAll();
  }, []);
  useEffect(() => {
    if (validation.values.class) {
      handleGetListLocation();
    }
  }, [validation.values.class]);

  useEffect(() => {
    if (!validation.values.class_times) {
      return;
    } else {
      validation.values.class_times.forEach((item, index) => {
        validation.values.location_id &&
          getListTrainer(
            item.day,
            item.start_time,
            item.end_time,
            index,
            validation.values.start_date,
            validation.values.end_date,
            validation.values.frequency
          );
      });
    }
  }, [
    validation.values.class_times,
    validation.values.location_id,
    validation.values.start_date,
    validation.values.end_date,
    validation.values.frequency,
    valueDefault,
  ]);

  useEffect(() => {
    if (validation.values.class_times.length === 0) {
      addTimeAvailable();
    }
  }, [validation.values]);

  return (
    <Modal
      isOpen={isOpen}
      size="xl"
      autoFocus={true}
      centered
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
    >
      <div className="modal-content border-0">
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.setTouched({
              frequency: true,
              capacity: true,
              start_date: true,
              end_date: true,
              location_id: true,
              pre_booking_hours: true,
              cancellation_period_hours: true,
              min_bookings: true,
              cancel_before_minutes: true,
              class_times: validation.values.class_times.map(() => ({
                day: true,
                staff_id: true,
                start_time: true,
                end_time: true,
                trainer_session_gains: true,
              })),
            });
            console.log({ isAdd });
            console.log("validation errors", validation.errors);
            // Only submit if there are no errors except possibly in class_times
            const { class_times, ...otherErrors } = validation.errors || {};
            const hasOtherErrors = Object.keys(otherErrors).length > 0;
            if (!hasOtherErrors) {
              handleSubmitForm();
            }
            return false;
          }}
        >
          <ModalHeader
            className="border-bottom-0 py-2 bg-light"
            toggle={() => {
              onClose();
            }}
          >
            {title}
          </ModalHeader>
          <div className="py-2">
            <div className="d-flex flex-column gap-1 p-3">
              <h5 className="text-start">{name}</h5>
              {!serviceId && (
                <Row className="mt-3">
                  <Col md={6}>
                    <Row>
                      <Col md={4} className="float-start">
                        <Label for="class">
                          <div className="d-flex flex-row">
                            {i18n.t("class")} <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <MyDropdown
                          id="class"
                          name="class"
                          placeholder={i18n.t("class")}
                          options={listClass}
                          displayEmpty
                          disabled={!isAdd}
                          selected={validation.values.class}
                          setSelected={(e) => {
                            validation.setFieldValue("class", e);
                          }}
                          invalid={
                            validation.errors.class && validation.touched.class
                          }
                          onBlur={validation.handleBlur}
                          isForm={true}
                        />
                        {validation.errors.class &&
                          validation.touched.class && (
                            <InvalidFeedback>
                              {validation.errors.class}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )}
              <Row className="mt-3">
                <Col md={6}>
                  <Row>
                    <Col md={4} className="float-start">
                      <Label for="frequency">
                        <div className="d-flex flex-row">
                          {i18n.t("frequency")}{" "}
                          <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <MyDropdown
                        id="frequency"
                        name="frequency"
                        placeholder={i18n.t("frequency")}
                        options={listFrequency}
                        displayEmpty
                        disabled={!isAdd}
                        selected={validation.values.frequency}
                        setSelected={(e) => {
                          validation.setFieldValue("frequency", e);
                        }}
                        invalid={
                          validation.errors.frequency &&
                          validation.touched.frequency
                        }
                        onBlur={validation.handleBlur}
                        isForm={true}
                      />
                      {validation.errors.frequency &&
                        validation.touched.frequency && (
                          <InvalidFeedback>
                            {validation.errors.frequency}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
                <Col md={6}>
                  <Row>
                    <Col md={4}>
                      <Label for="capacity">
                        <div className="d-flex flex-row">
                          {i18n.t("capacity")} <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        className="form-input"
                        id="capacity"
                        name="capacity"
                        type="number"
                        invalid={
                          validation.errors.capacity &&
                          validation.touched.capacity
                        }
                        required
                        value={validation.values.capacity}
                        placeholder="Capacity"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                      />
                      {validation.touched.capacity &&
                        validation.errors.capacity && (
                          <InvalidFeedback>
                            {validation.errors.capacity}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="">
                <Col md={6}>
                  <Row>
                    <Col md={4} className="float-start">
                      <Label for="start_date">
                        <div className="d-flex flex-row">
                          {i18n.t("start_date")}{" "}
                          <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        className="form-input"
                        id="start_date"
                        name="start_date"
                        type="date"
                        disabled={!isAdd}
                        invalid={
                          validation.errors.start_date &&
                          validation.touched.start_date
                        }
                        value={validation.values.start_date}
                        placeholder={i18n.t("start_date")}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                      />
                      {validation.touched.start_date &&
                        validation.errors.start_date && (
                          <InvalidFeedback>
                            {validation.errors.start_date}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label for="pre_booking_hours">
                          <div className="d-flex flex-row">
                            {i18n.t("latest_pre_booking_hours")}{" "}
                            <p style={{ color: "red" }}>*</p>
                          </div>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <InputGroup>
                          <Input
                            className="form-input"
                            id="pre_booking_hours"
                            name="pre_booking_hours"
                            type="number"
                            invalid={
                              validation.errors.pre_booking_hours &&
                              validation.touched.pre_booking_hours
                            }
                            required
                            value={validation.values.pre_booking_hours}
                            placeholder=""
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                          />
                          <InputGroupText>{i18n.t("hours")}</InputGroupText>
                        </InputGroup>
                        {validation.touched.pre_booking_hours &&
                          validation.errors.pre_booking_hours && (
                            <InvalidFeedback>
                              {validation.errors.pre_booking_hours}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
              </Row>
              <Row className="">
                <Col md={6}>
                  <Row>
                    <Col md={4} className="float-start">
                      <Label for="end_date">
                        <div className="d-flex flex-row">
                          {i18n.t("end_date")} <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <Input
                        className="form-input"
                        id="end_date"
                        name="end_date"
                        type="date"
                        disabled={!isAdd || validation.values.frequency === "1"}
                        invalid={
                          validation.errors.end_date &&
                          validation.touched.end_date
                        }
                        value={validation.values.end_date}
                        placeholder={i18n.t("end_date")}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                      />
                      {validation.touched.end_date &&
                        validation.errors.end_date && (
                          <InvalidFeedback>
                            {validation.errors.end_date}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label for="cancellation_period_hours">
                          {i18n.t("min_cancellation_period")}
                        </Label>
                      </Col>
                      <Col md={8}>
                        <InputGroup>
                          <Input
                            className="form-input"
                            id="cancellation_period_hours"
                            name="cancellation_period_hours"
                            type="number"
                            invalid={
                              validation.errors.cancellation_period_hours &&
                              validation.touched.cancellation_period_hours
                            }
                            value={validation.values.cancellation_period_hours}
                            placeholder=""
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                          />
                          <InputGroupText>{i18n.t("hours")}</InputGroupText>
                        </InputGroup>
                        {validation.touched.cancellation_period_hours &&
                          validation.errors.cancellation_period_hours && (
                            <InvalidFeedback>
                              {validation.errors.cancellation_period_hours}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
              </Row>
              <Row className="">
                <Col md={6}>
                  <Row>
                    <Col md={4} className="float-start">
                      <Label for="location_id">
                        <div className="d-flex flex-row">
                          {i18n.t("location")} <p style={{ color: "red" }}>*</p>
                        </div>
                      </Label>
                    </Col>
                    <Col md={8}>
                      <MyDropdown
                        id="location_id"
                        name="location_id"
                        placeholder={i18n.t("location")}
                        disabled={!isAdd}
                        options={listLocation}
                        displayEmpty
                        selected={validation.values.location_id}
                        setSelected={(e) => {
                          validation.setFieldValue("location_id", e);
                        }}
                        invalid={
                          validation.errors.location_id &&
                          validation.touched.location_id
                        }
                        onBlur={validation.handleBlur}
                        isForm={true}
                      />
                      {validation.errors.location_id &&
                        validation.touched.location_id && (
                          <InvalidFeedback>
                            {validation.errors.location_id}
                          </InvalidFeedback>
                        )}
                    </Col>
                  </Row>
                </Col>
                {/* min_bookings */}
                {/* cancel_before_minutes */}
                <Col md={6}>
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label for="min_bookings">
                          {i18n.t("min_bookings")}
                        </Label>
                      </Col>
                      <Col md={8}>
                        <InputGroup>
                          <Input
                            className="form-input"
                            id="min_bookings"
                            name="min_bookings"
                            type="number"
                            invalid={
                              validation.errors.min_bookings &&
                              validation.touched.min_bookings
                            }
                            value={validation.values.min_bookings}
                            placeholder=""
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                          />
                          <InputGroupText>{i18n.t("minutes")}</InputGroupText>
                        </InputGroup>
                        {validation.touched.min_bookings &&
                          validation.errors.min_bookings && (
                            <InvalidFeedback>
                              {validation.errors.min_bookings}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
              </Row>
              <Row className="">
                <Col md={6}></Col>
                <Col md={6}>
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label for="cancel_before_minutes">
                          {i18n.t("cancel_before_minutes")}
                        </Label>
                      </Col>
                      <Col md={8}>
                        <InputGroup>
                          <Input
                            className="form-input"
                            id="cancel_before_minutes"
                            name="cancel_before_minutes"
                            type="number"
                            invalid={
                              validation.errors.cancel_before_minutes &&
                              validation.touched.cancel_before_minutes
                            }
                            value={validation.values.cancel_before_minutes}
                            placeholder=""
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                          />
                          <InputGroupText>{i18n.t("minutes")}</InputGroupText>
                        </InputGroup>
                        {validation.touched.cancel_before_minutes &&
                          validation.errors.cancel_before_minutes && (
                            <InvalidFeedback>
                              {validation.errors.cancel_before_minutes}
                            </InvalidFeedback>
                          )}
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
              </Row>
              <h5>{i18n.t("schedule_information")}</h5>
              {validation.values.class_times.map((time, index) => (
                <div className="d-flex flex-column" key={index}>
                  <Row className="mt-3">
                    <Col md={6}>
                      <Row>
                        <Col md={4} className="float-start">
                          <Label for="day">
                            <div className="d-flex flex-row">
                              {i18n.t("date")} <p style={{ color: "red" }}>*</p>
                            </div>
                          </Label>
                        </Col>
                        <Col md={8}>
                          {!isAdd ? (
                            <>
                              <Input
                                className="form-input"
                                type="date"
                                name="date"
                                id="date"
                                disabled={moment(time.date).isSameOrBefore(
                                  moment.now()
                                )}
                                placeholder={i18n.t("date")}
                                onChange={(e) => {
                                  const newWifiSettings = JSON.parse(
                                    JSON.stringify(
                                      validation.values.class_times
                                    )
                                  );
                                  newWifiSettings[index].date = e.target.value;
                                  validation.setFieldValue(
                                    "class_times",
                                    newWifiSettings
                                  );
                                }}
                                onBlur={validation.handleBlur}
                                value={time.date}
                                invalid={
                                  validation.errors.date &&
                                  validation.touched.date
                                }
                              />
                              {!moment(time.date).isSameOrBefore(
                                moment.now()
                              ) &&
                                validation.errors.class_times &&
                                validation.errors.class_times[index] &&
                                validation.errors.class_times[index]?.date && (
                                  <InvalidFeedback>
                                    {validation.errors.class_times[index]?.date}
                                  </InvalidFeedback>
                                )}
                            </>
                          ) : (
                            <>
                              <MyDropdown
                                id={`class_times[${index}].day`}
                                name="day"
                                placeholder={i18n.t("date")}
                                displayEmpty
                                options={listDayOfWeek}
                                selected={time.day}
                                disabled={
                                  !isAdd || validation.values.frequency === "1"
                                }
                                invalid={
                                  validation.errors.class_times &&
                                  validation.errors.class_times[index] &&
                                  validation.errors.class_times[index]?.day
                                }
                                setSelected={(e) => {
                                  const newWifiSettings = JSON.parse(
                                    JSON.stringify(
                                      validation.values.class_times
                                    )
                                  );
                                  newWifiSettings[index].day = e;
                                  validation.setFieldValue(
                                    "class_times",
                                    newWifiSettings
                                  );
                                }}
                                onBlur={validation.handleBlur}
                                isForm={true}
                              />
                              {validation.errors.class_times &&
                                validation.errors.class_times[index] &&
                                validation.errors.class_times[index]?.day && (
                                  <InvalidFeedback>
                                    {validation.errors.class_times[index]?.day}
                                  </InvalidFeedback>
                                )}
                            </>
                          )}
                        </Col>
                      </Row>
                    </Col>
                    <Col md={6}>
                      <Row>
                        <Col md={4} className="float-start">
                          <Label for="staff_id">
                            <div className="d-flex flex-row">
                              {i18n.t("trainer")}{" "}
                              <p style={{ color: "red" }}>*</p>
                            </div>
                          </Label>
                        </Col>
                        <Col md={8}>
                          <MyDropdown
                            id={`class_times[${index}].staff_id`}
                            name={`class_times[${index}].staff_id`}
                            placeholder={i18n.t("trainer")}
                            options={
                              trainers[index]?.length > 0
                                ? trainers[index]
                                : staffDefault || []
                            }
                            displayEmpty
                            disabled={!canUpdate && !isAdd}
                            // disabled={
                            //   trainers[index]?.length > 0
                            //     ? false
                            //     : staffDefault.length > 0
                            // }
                            selected={time.staff_id}
                            invalid={
                              validation.errors.class_times &&
                              validation.errors.class_times[index] &&
                              validation.errors.class_times[index]?.staff_id
                            }
                            setSelected={(e) => {
                              const newWifiSettings = JSON.parse(
                                JSON.stringify(validation.values.class_times)
                              );
                              newWifiSettings[index].staff_id = e;
                              validation.setFieldValue(
                                "class_times",
                                newWifiSettings
                              );
                            }}
                            onBlur={validation.handleBlur}
                            isForm={true}
                          />
                          {validation.errors.class_times &&
                            validation.errors.class_times[index] &&
                            validation.errors.class_times[index]?.staff_id && (
                              <InvalidFeedback>
                                {validation.errors.class_times[index]?.staff_id}
                              </InvalidFeedback>
                            )}
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <Row className="mt-2">
                    <Col md={6}>
                      <Row>
                        <Col md={4}>
                          <Label for="time">
                            <div className="d-flex flex-row">
                              {i18n.t("time")} <p style={{ color: "red" }}>*</p>
                            </div>
                          </Label>
                        </Col>
                        <Col md={4}>
                          <Input
                            className=" mb-1 input-form"
                            type={"time"}
                            placeholder={i18n.t("from")}
                            value={convertMinutesToTimeString(time.start_time)}
                            disabled={
                              !isAdd &&
                              moment(time.date).isSameOrBefore(moment.now())
                            }
                            id={`class_times[${index}].start_time`}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value
                                .split(":")
                                .map(Number);
                              const totalMinutes = hours * 60 + minutes;
                              const newWifiSettings = JSON.parse(
                                JSON.stringify(validation.values.class_times)
                              );
                              newWifiSettings[index].start_time = totalMinutes;
                              validation.setFieldValue(
                                "class_times",
                                newWifiSettings
                              );
                            }}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.errors.class_times &&
                              validation.touched.class_times &&
                              validation.touched.class_times[index] &&
                              validation.touched.class_times[index]
                                .start_time &&
                              validation.errors.class_times[index] &&
                              validation.errors.class_times[index]?.start_time
                            }
                          />
                          {validation.errors.class_times &&
                            validation.touched.class_times &&
                            validation.touched.class_times[index] &&
                            validation.touched.class_times[index].start_time &&
                            validation.errors.class_times[index] &&
                            validation.errors.class_times[index]
                              ?.start_time && (
                              <FormFeedback>
                                {
                                  validation.errors.class_times[index]
                                    ?.start_time
                                }
                              </FormFeedback>
                            )}
                        </Col>
                        <Col md={4}>
                          <Input
                            className="form-control mb-1 input-form"
                            type="time"
                            placeholder={i18n.t("to")}
                            value={convertMinutesToTimeString(time.end_time)}
                            id={`class_times[${index}].end_time`}
                            disabled={
                              !isAdd &&
                              moment(time.date).isSameOrBefore(moment.now())
                            }
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value
                                .split(":")
                                .map(Number);
                              const totalMinutes = hours * 60 + minutes;
                              const newWifiSettings = JSON.parse(
                                JSON.stringify(validation.values.class_times)
                              );
                              newWifiSettings[index].end_time = totalMinutes;
                              validation.setFieldValue(
                                "class_times",
                                newWifiSettings
                              );
                            }}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.errors.class_times &&
                              validation.touched.class_times &&
                              validation.touched.class_times[index] &&
                              validation.touched.class_times[index].end_time &&
                              validation.errors.class_times[index] &&
                              validation.errors.class_times[index]?.end_time
                            }
                          />
                          {validation.errors.class_times &&
                            validation.touched.class_times &&
                            validation.touched.class_times[index] &&
                            validation.touched.class_times[index].end_time &&
                            validation.errors.class_times[index] &&
                            validation.errors.class_times[index]?.end_time && (
                              <FormFeedback>
                                {validation.errors.class_times[index]?.end_time}
                              </FormFeedback>
                            )}
                        </Col>
                      </Row>
                    </Col>
                    <Col md={6}>
                      <Row>
                        <Col md={4}>
                          <Label for="trainer-revenue">
                            <div className="d-flex flex-row">
                              {i18n.t("per_session_revenue")}{" "}
                              <p style={{ color: "red" }}>*</p>
                            </div>
                          </Label>
                        </Col>
                        <Col md={8}>
                          <InputCurrency
                            name="tainer-revenue"
                            value={
                              validation.values.class_times[index]
                                .trainer_session_gains
                            }
                            onChange={(newValue) => {
                              validation.setFieldValue(
                                `class_times[${index}].trainer_session_gains`,
                                newValue
                              );
                            }}
                            onBlur={validation.handleBlur}
                          />
                          {validation.errors.class_times &&
                            validation.touched.class_times &&
                            validation.errors.class_times[index] &&
                            validation.errors.class_times[index]
                              ?.trainer_session_gains && (
                              <InvalidFeedback>
                                {
                                  validation.errors.class_times[index]
                                    ?.trainer_session_gains
                                }
                              </InvalidFeedback>
                            )}
                        </Col>
                      </Row>
                    </Col>

                    {isAdd && (
                      <Col md={12}>
                        <div className="d-flex justify-content-end align-items-center gap-3">
                          {index === validation.values.class_times.length - 1 &&
                            validation.values.frequency !== "1" && (
                              <div onClick={addTimeAvailable}>
                                <IcPlusCircle />
                              </div>
                            )}
                          {validation.values.class_times.length !== 1 && (
                            <div onClick={() => deleteTimeAvailable(index)}>
                              <IcTrash />
                            </div>
                          )}
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              ))}
            </div>
          </div>
          <ModalFooter className="bg-light py-2">
            <div className="d-flex flex-row justify-content-end gap-3">
              <Button
                color="success"
                outline
                className="px-3 btn-back"
                onClick={onClose}
              >
                {i18n.t("back")}
              </Button>

              <button
                className="btn btn-primary btn-block px-3 d-flex gap-1"
                type="submit"
                disabled={!isChanged && !isAdd && loading}
                // onClick={handleSubmitForm}
              >
                <div className="">
                  {isAdd ? i18n.t("save") : i18n.t("update")}
                </div>
              </button>
            </div>
          </ModalFooter>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalScheduleDetail;
