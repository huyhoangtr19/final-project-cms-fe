import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Modal,
  ModalHeader,
  ModalFooter,
  Form,
  Label,
  Input,
  Button,
  FormFeedback,
} from "reactstrap";
import styled from "styled-components";
import { toast } from "react-toastify";
import customerGroupGroupService from "../../services/customer.group.service";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";

const InvalidFeedback = styled.div`
  display: block;
  divor: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const ModalCustomerGroup = ({ type, isOpen, onClose, customerGroupInfo, onRefresh, listLocations }) => {
  const [initialValues, setInitialValues] = useState(null);
  const [readonlyInput, setReadOnlyInput] = useState(false);
  const [localCustomer, setLocalCustomer] = useState([]);

  const { permissionUser } = useAppSelector((state) => state.auth);

  const isMobile = window.innerWidth < 576;

  const canUpdate = useMemo(() => {
    return permissionUser.includes("department:update_info");
  }, [permissionUser]);

  const title = useMemo(() => {
    return customerGroupInfo ? i18n.t("customer_group_detail") : i18n.t("add_new_customer_group");
  }, [customerGroupInfo]);

  const validation = useFormik({
    initialValues: {
      name: customerGroupInfo?.name ?? "",
      location_id: customerGroupInfo?.location_id ?? null,
      upper_id: customerGroupInfo?.upper_id ?? null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required(i18n.t("field_required")).max(80),
    }),
    onSubmit: async () => {
      try {
        const payload = {
          name: validation.values.name,
        };
        const response = type === 'update'
          ? await customerGroupGroupService.updateCustomerGroup(customerGroupInfo.id, payload)
          : await customerGroupGroupService.createCustomerGroup(payload);

        if (response.success) {
          toast.success(type === 'update' ? i18n.t("update_success") : i18n.t("create_success"), {
            position: "top-right",
            autoClose: 200,
            theme: "light",
            hideProgressBar: true,
          });
          onClose();
          onRefresh?.();
        } else {
          console.log("fail:", response)
        }
      } catch (error) {
        console.error(error);
        if (error?.errors) {
          validation.setErrors(error.errors);
        }
      }
    },
  });

  const fetchDetail = async (id) => {
    try {
      const response = await customerGroupGroupService.getDetailCustomerGroup(id);
      if (response.success) {
        const data = response.data;
        validation.setValues({
          name: data.name || "",
        });
        setInitialValues({
          name: data.name || "",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && customerGroupInfo) {
      fetchDetail(customerGroupInfo.id);
    }

    if (!isOpen) {
      validation.resetForm();
      setInitialValues(null);
    }
  }, [isOpen, customerGroupInfo]);

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !== JSON.stringify(initialValues) &&
      initialValues !== null
    );
  }, [validation.values, initialValues]);

  useEffect(() => { setReadOnlyInput(!canUpdate) }, [canUpdate]);

  return (
    <Modal isOpen={isOpen} centered size="lg" toggle={onClose}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validation.setTouched({ name: true });
          if (validation.isValid) {
            validation.handleSubmit();
          }
        }}
      >
        <ModalHeader toggle={onClose} className="bg-light border-bottom-0">
          {title}
        </ModalHeader>
        <div className="p-3">
          <div className="mb-2">
            <div>
              <Label for="name">
                {i18n.t("name")} <span className="text-danger">*</span>
              </Label>
            </div>
            <div>
              <Input
                id="name"
                name="name"
                value={validation.values.name}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                disabled={readonlyInput}
                invalid={!!(validation.touched.name && validation.errors.name)}
              />
              {validation.touched.name && validation.errors.name && (
                <FormFeedback>{validation.errors.name}</FormFeedback>
              )}
            </div>
          </div>
        </div>
        <ModalFooter className="bg-light">
          <Button color="secondary" onClick={onClose}>
            {i18n.t("cancel")}
          </Button>
          {(!customerGroupInfo || canUpdate) && (
            <Button
              color="primary"
              type="submit"
              disabled={type === 'update' ? !isChanged : false}
              style={isMobile ? { width: "100%" } : undefined}
            >
              {type === 'update' ? i18n.t("update") : i18n.t("save")}
            </Button>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ModalCustomerGroup;
