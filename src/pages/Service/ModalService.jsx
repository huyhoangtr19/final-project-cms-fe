// Function Name : Modal Service
// Created date :  25/7/24             by :  NgVinh
// Updated date :  29/7/24             by :  NgVinh
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import Select from "react-select";
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
import serviceService from "../../services/service.service";
import operatorService from "../../services/operator.service";
import styled from "styled-components";
import { toast } from "react-toastify";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;
const ModalService = ({
  isOpen,
  onClose,
  onAdd,
  isAdd,
  serviceInfo = null,
}) => {
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [listLocation, setListLocation] = useState([]);
  const [valueDefault, setValueDefault] = useState(null);
  const handleChangeLocation = (selectedOptions, { action }) => {
    const newArray = selectedOptions.map((item) => item.value);
    if (
      action === "remove-value" &&
      purchased &&
      !valueDefault.service_location.every((item) => newArray.includes(item))
    ) {
      return null;
    }
    validation.setFieldValue(
      "service_location",
      selectedOptions.map((item) => item.value)
    );
    setSelectedLocations(selectedOptions);
  };

  const title = useMemo(() => {
    return isAdd ? i18n.t("add_new_service") : i18n.t("service_detail");
  }, [isAdd]);

  const validation = useFormik({
    initialValues: {
      id_service: "",
      service_name: "",
      service_location: [],
    },
    validationSchema: Yup.object({
      service_name: Yup.string().required(i18n.t("field_required")),
      service_location: Yup.array().min(1, i18n.t("location_required")),
    }),
    onSubmit: (values) => {
      handleSubmitForm();
      console.log("values", values);
    },
  });

  const handleSubmitForm = async () => {
    console.log("Form submitted with values:", validation.values);
    try {
      const payload = {
        name: validation.values.service_name,
        location_ids: validation.values.service_location,
      };
      const response = isAdd
        ? await serviceService.createService(payload)
        : await serviceService.updateService(payload, serviceInfo.id);

      if (response.success) {
        onClose();
        onAdd();
        toast.success(`${isAdd ? "Create" : "Update"} service successfully`, {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("Error", e);
      if (e.errors) {
        validation.setErrors(e.errors);
      }
    }
  };

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

  const getDetailService = async (id) => {
    try {
      const response = await serviceService.getDetailService(id);
      if (response.success) {
        validation.setValues({
          id_service: response.data.id,
          service_name: response.data.name,
          service_location: response.data.locations.map((item) => item.id),
        });
        setValueDefault({
          id_service: response.data.id,
          service_name: response.data.name,
          service_location: response.data.locations.map((item) => item.id),
        });
        const listSelect = [];
        response.data.locations.forEach((item) => {
          if (listIdLocation.includes(item.id)) {
            listSelect.push(
              listLocation.find((location) => location.value === item.id)
            );
          }
        });
        setSelectedLocations(listSelect);
      }
    } catch (e) {
      console.log("Error", e);
    }
  };

  const purchased = useMemo(() => {
    if (!serviceInfo) {
      return false;
    }
    return serviceInfo?.purchased;
  }, [serviceInfo]);

  const listIdLocation = useMemo(() => {
    return listLocation.map((item) => item.value);
  }, [listLocation]);
  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !== JSON.stringify(valueDefault) &&
      valueDefault !== null
    );
  }, [validation.values, valueDefault]);

  const canUpdateLocation = useMemo(() => {
    return permissionUser.includes("service:update_info");
  }, [permissionUser]);
   const isMobile = useMemo(()=>{
  
      return  window.innerWidth < 768
    } , []);
  useEffect(() => {
    const init = async () => {
      if (isOpen && serviceInfo?.id && listLocation.length) {
        await getDetailService(serviceInfo?.id);
      }
    };
    init();
  }, [isOpen, serviceInfo, listLocation]);
  useEffect(() => {
    handleGetListLocation();
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      role="dialog"
      autoFocus={true}
      centered
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
      // style={{ width: isMobile ? 'unset': 600, padding: 10, margin: "auto", border: "none" }}
    >
      <div
        className="modal-content border-0"
        // style={{ width: isMobile ? 'unset': 600, right: 50, border: "none" }}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();

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
              <h5 className="text-start">{i18n.t("service_information")}</h5>

              <Row>
                <Col md={3}>
                  <Label for="service_name">
                    <div className="d-flex flex-row">
                      {i18n.t("service_name")}
                      <p style={{ color: "red" }}>*</p>
                    </div>
                  </Label>
                </Col>
                <Col md={9}>
                  <Input
                    id="service_name"
                    name="service_name"
                    type="text"
                    invalid={
                      validation.errors.service_name &&
                      validation.touched.service_name
                    }
                    value={validation.values.service_name}
                    placeholder={i18n.t("service_name")}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                  />
                  {validation.touched.service_name &&
                    validation.errors.service_name && (
                      <InvalidFeedback>
                        {validation.errors.service_name}
                      </InvalidFeedback>
                    )}
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Label for="service_name">
                    <div className="d-flex flex-row">
                      {i18n.t("applied_location")}
                      <p style={{ color: "red" }}>*</p>
                    </div>
                  </Label>
                </Col>
                <Col md={9}>
                  <Select
                    isMulti
                    name="service_location"
                    options={listLocation}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={selectedLocations}
                    onChange={handleChangeLocation}
                    placeholder={i18n.t("select_location")}
                    noOptionsMessage={()=> i18n.t("no_options")}
                    styles={{
                      container: (provided) => ({
                        border: validation.errors.service_location
                          ? "1px solid #f46a6a"
                          : "",
                        borderRadius: 4,
                      }),
                      indicatorsContainer: (prevStyle, state) =>
                        state.isMulti
                          ? {
                              ...prevStyle,
                              display: "none",
                            }
                          : null,
                    }}
                  />
                  {validation.errors.service_location && (
                    <InvalidFeedback>
                      {validation.errors.service_location}
                    </InvalidFeedback>
                  )}
                </Col>
              </Row>
            </div>
          </div>
          <ModalFooter className="bg-light py-2">
            <div className="d-flex flex-row justify-content-end gap-3">
              <Button
                color="success"
                outline
                className="px-3  btn-back"
                onClick={onClose}
              >
                {i18n.t("back")}
              </Button>

              <button
                className="btn btn-primary btn-block px-3 d-flex gap-1"
                type="submit"
                style={{
                  display: canUpdateLocation ? "block" : "none",
                }}
                disabled={!isChanged && !isAdd}
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

export default ModalService;
