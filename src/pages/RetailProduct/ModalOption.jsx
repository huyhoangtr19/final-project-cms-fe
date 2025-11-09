// Function Name : Modal Option
// Created date :  6/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh
import { useFormik } from "formik";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Yup from "yup";
import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import styled from "styled-components";
import { toast } from "react-toastify";
import optionService from "../../services/option.service";
import IcPlusCircle from "../../assets/icon/IcPlusCircle";
import IcTrash from "../../assets/icon/IcTrash";
import IcDrag from "../../assets/icon/IcDrag";
import i18n from "../../i18n";
const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const DragHandle = styled.div`
  cursor: move;
  margin-right: 10px;
  user-select: none;
`;
const ModalOption = ({ isOpen, onClose, onAdd, serviceInfo = null }) => {
  const title = useMemo(() => {
    return !serviceInfo ? i18n.t("add_new_option") : i18n.t("option_detail");
  }, [serviceInfo]);

  const [dragging, setDragging] = useState(false);
  const dragItem = useRef();
  const dragNode = useRef();
  const [valueDefault, setValueDefault] = useState(null);

  const validation = useFormik({
    initialValues: {
      name: "",
      variants: [
        {
          id: "1",
          name: "",
        },
      ],
    },
    validationSchema: Yup.object({
      name: Yup.string().required(i18n.t("option_name_required")),
      variants: Yup.array().of(
        Yup.object().shape({
          name: Yup.string().required(i18n.t("option_value_required")),
        })
      ),
    }),
    onSubmit: (values) => {
      handleSubmitForm();
      console.log("values", values);
    },
  });

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    dragNode.current = e.target;
    dragNode.current.addEventListener("dragend", handleDragEnd);
    setTimeout(() => {
      setDragging(true);
    }, 0);
  };

  const handleDragEnter = (e, targetIndex) => {
    if (dragNode.current !== e.target) {
      let newItems = JSON.parse(JSON.stringify(validation.values.variants));
      newItems.splice(targetIndex, 0, newItems.splice(dragItem.current, 1)[0]);
      dragItem.current = targetIndex;
      console.log("newItems", newItems);
      validation.setFieldValue("variants", newItems);
    }
  };

  const handleDragEnd = () => {
    setDragging(false);
    dragNode.current.removeEventListener("dragend", handleDragEnd);
    dragItem.current = null;
    dragNode.current = null;
  };

  const addSetting = () => {
    validation.setFieldValue("variants", [
      ...validation.values.variants,
      { id: (validation.values.variants.length + 1).toString(), name: "" },
    ]);
  };

  const deleteSetting = (index) => {
    validation.setFieldValue(
      "variants",
      validation.values.variants.filter((item, i) => i !== index)
    );
  };
  const handleSubmitForm = async () => {
    console.log("Form submitted with values:", validation.values);
    try {
      const payload = {
        name: validation.values.name,
        variants: validation.values.variants.map((item, idx) => ({
          name: item.name,
          order: idx + 1,
        })),
      };
      console.log("serviceInfo", !!serviceInfo);
      const response = !serviceInfo
        ? await optionService.createOption(payload)
        : await optionService.updateOption(payload, serviceInfo);
       
      if (response.success) {
        onClose();
        onAdd();
        toast.success(
          serviceInfo
            ? i18n.t("create_option_success")
            : i18n.t("update_option_success"),
          {
            position: "top-right",
            autoClose: 2000,
            theme: "light",
            hideProgressBar: true,
          }
        );
      }
    } catch (e) {
      console.log("Error", e);
      if (e.errors) {
        validation.setErrors(e.errors);
      }
    }
  };

  const getDetailOption = async (id) => {
    try {
      const response = await optionService.getOptionDetail(id);
      if (response.success) {
        console.log("res", response.data);

        validation.setValues({
          ...response.data,
        });
        setValueDefault({
          ...response.data,
        });
      }
    } catch (e) {
      console.log("Error", e);
    }
  };

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !== JSON.stringify(valueDefault) &&
      valueDefault !== null
    );
  }, [validation.values, valueDefault]);

  useEffect(() => {
    const init = async () => {
      if (isOpen && serviceInfo) {
        console.log("serviceInfo", serviceInfo);
        await getDetailOption(serviceInfo);
      }
      if (!isOpen) {
        validation.resetForm();
      }
    };
    init();
  }, [isOpen, serviceInfo]);

  return (
    <Modal
      isOpen={isOpen}
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
              name: true,

              variants: validation.values.variants.map(() => ({
                name: true,
              })),
            });
            if (validation.isValid) {
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
            <div className="d-flex flex-column gap-3 p-3">
              <h5 className="text-start">{i18n.t("option_information")}</h5>

              <Row className="mt-2">
                <Col md={3}>
                  <Label for="name">
                    <div className="d-flex flex-row">
                      {i18n.t("option_name")}
                      <p style={{ color: "red" }}>*</p>
                    </div>
                  </Label>
                </Col>
                <Col md={1}></Col>
                <Col md={7}>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    invalid={validation.errors.name && validation.touched.name}
                    value={validation.values.name}
                    placeholder={i18n.t("option_name")}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                  />
                  {validation.touched.name && validation.errors.name && (
                    <InvalidFeedback>{validation.errors.name}</InvalidFeedback>
                  )}
                </Col>
                <Col md={1}></Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Label for="variants">
                    <div className="d-flex flex-row">
                      {i18n.t("option_value")}
                      <p style={{ color: "red" }}>*</p>
                    </div>
                  </Label>
                </Col>
                <Col md={1}></Col>
                <Col md={6}></Col>
                <Col md={1}>
                  <div
                    className="d-flex justify-content-end"
                    onClick={addSetting}
                  >
                    <IcPlusCircle />
                  </div>
                </Col>
                <Col md={1}></Col>
              </Row>
              <div>
                {validation.values.variants.map((item, index) => (
                  <Row
                    className="mb-2"
                    key={item.id}
                    onDragEnter={
                      dragging ? (e) => handleDragEnter(e, index) : null
                    }
                    isDragging={dragging && dragItem?.current === index}
                  >
                    <Col md={3} xs={3}></Col>
                    <Col
                      md={1} xs={1}
                      className="d-flex justify-content-center align-items-center"
                    >
                      <DragHandle
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        className="d-flex justify-content-center align-items-center"
                      >
                        <IcDrag />
                      </DragHandle>
                    </Col>
                    <Col md={7} xs={7}>
                      <Input
                        id={`variants[${index}].name`}
                        name={`variants[${index}].name`}
                        type="text"
                        invalid={
                          validation.errors.variants &&
                          validation.touched.variants &&
                          validation.touched.variants[index] &&
                          validation.touched.variants[index]?.name &&
                          validation.errors.variants[index] &&
                          validation.errors.variants[index]?.name
                        }
                        value={item.name}
                        placeholder={i18n.t("option_value")}
                        onBlur={validation.handleBlur}
                        onChange={(e) => {
                          const newWifiSettings = JSON.parse(
                            JSON.stringify(validation.values.variants)
                          );
                          newWifiSettings[index].name = e.target.value;
                          validation.setFieldValue("variants", newWifiSettings);
                        }}
                      />
                      {validation.errors.variants &&
                        validation.touched.variants &&
                        validation.touched.variants[index] &&
                        validation.touched.variants[index].name &&
                        validation.errors.variants[index] &&
                        validation.errors.variants[index]?.name && (
                          <InvalidFeedback>
                            {validation.errors.variants[index]?.name}
                          </InvalidFeedback>
                        )}
                    </Col>
                    <Col md={1} xs={1}>
                      {index > 0 && validation.values.variants.length !== 1 && (
                        <div onClick={() => deleteSetting(index)}>
                          <IcTrash />
                        </div>
                      )}
                    </Col>
                  </Row>
                ))}
              </div>
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
                disabled={!isChanged && serviceInfo}
                // onClick={handleSubmitForm}
              >
                <div className="">
                  {serviceInfo ? i18n.t("update") : i18n.t("save")}
                </div>
              </button>
            </div>
          </ModalFooter>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalOption;
