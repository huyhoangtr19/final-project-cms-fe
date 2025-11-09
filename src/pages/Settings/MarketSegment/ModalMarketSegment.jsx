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
import { debounce, update } from "lodash";
import marketSegmentService from "../../../services/market.segment.service";
import i18n from "../../../i18n";
import { useAppSelector } from "../../../hook/store.hook";
import MyDropdownSearch from "../../../components/Common/MyDropdownSearch";

const InvalidFeedback = styled.div`
  display: block;
  divor: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const ModalMarketSegment = ({ type, isOpen, onClose, segmentInfo, onRefresh }) => {
  const [initialValues, setInitialValues] = useState(null);
  const [readonlyInput, setReadOnlyInput] = useState(false);
  const [localSegments, setLocalSegments] = useState([]);

  const { permissionUser } = useAppSelector((state) => state.auth);

  const isMobile = window.innerWidth < 576;

  const canUpdate = useMemo(() => {
    return permissionUser.includes("market_segment:update_info");
  }, [permissionUser]);

  const title = useMemo(() => {
    return segmentInfo ? i18n.t("market_segment_detail") : i18n.t("add_new_segment");
  }, [segmentInfo]);

  const validation = useFormik({
    initialValues: {
      name: segmentInfo?.name ?? "",
      upper_id: segmentInfo?.upper_id ?? null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required(i18n.t("field_required")),
      upper_id: Yup.number().nullable().test(
        'not-self-reference',
        'A market segment cannot reference itself',
        function (value) {
          if (!segmentInfo) return true;
          const currentId = segmentInfo.id;
          return value === null || value !== currentId;
        }
      ),
    }),
    onSubmit: async () => {
      try {
        const payload = { name: validation.values.name, upper_id: validation.values.upper_id === -1 ? null : validation.values.upper_id };
        const response = type === 'update'
          ? await marketSegmentService.updateMarketSegment(segmentInfo.id, payload)
          : await marketSegmentService.createMarketSegment(payload);

        if (response.success) {
          toast.success(type === 'update' ? i18n.t("update_success") : i18n.t("create_success"), {
            position: "top-right",
            autoClose: 200,
            theme: "light",
            hideProgressBar: true,
          });
          onClose();
          onRefresh?.();
        }
      } catch (error) {
        console.error(error);
        if (error?.errors) {
          validation.setErrors(error.errors);
        }
      }
    },
  });

  const handleGetPossibleParent = async (keyword) => {
    try {
      let res = null;
      if (type === 'update') {
        res = await marketSegmentService.getValidParent(segmentInfo.id, {
          keyword: keyword ?? null,
        });
      } else {
        res = await marketSegmentService.getListMarketSegments({
          keyword: keyword ?? null,
        });
      }
      const filteredData = res.data.filter(item => item.name !== "Uncategorized");
      return [{ id: -1, name: i18n.t("no_parent") }, ...filteredData];

    } catch (err) {
      console.log(err);
    }
  };

  const fetchPossibleParents = async () => {
    try {
      const data = await handleGetPossibleParent();
      if (data) {
        setLocalSegments(
          data.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );
      }
    } catch (e) {
      console.log("error: ", e);
    }
  }

  const handleSearchSegment = debounce(async (e) => {
    const data = await handleGetPossibleParent(e);
    if (data) {
      setLocalSegments(
        data.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, 300);

  const fetchDetail = async (id) => {
    try {
      const response = await marketSegmentService.getDetailMarketSegment(id);
      if (response.success) {
        const data = response.data;
        validation.setValues({
          name: data.name || "",
          upper_id: data.upper_id || "",
        });
        setInitialValues({
          name: data.name || "",
          upper_id: data.upper_id || "",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && segmentInfo) {
      fetchDetail(segmentInfo.id);
    }

    if (!isOpen) {
      validation.resetForm();
      setInitialValues(null);
    }
  }, [isOpen, segmentInfo]);

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !== JSON.stringify(initialValues) &&
      initialValues !== null
    );
  }, [validation.values, initialValues]);

  useEffect(() => {
    if (isOpen)
      fetchPossibleParents();
  }, [isOpen]);

  useEffect(() => { setReadOnlyInput(!canUpdate) }, [canUpdate]);

  return (
    <Modal isOpen={isOpen} centered size="lg" toggle={onClose}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validation.setTouched({ name: true, upper_id: true });
          if (validation.isValid) {
            validation.handleSubmit();
          }
        }}
      >
        <ModalHeader toggle={onClose} className="bg-light border-bottom-0">
          {title}
        </ModalHeader>
        <div className="p-3">
          <div className="mb-3">
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
                invalid={!!(validation.touched.name && validation.errors.name)}
              />
              {validation.touched.name && validation.errors.name && (
                <FormFeedback>{validation.errors.name}</FormFeedback>
              )}
            </div>
          </div>

          <div>
            <div>
              <Label for="category">
                {i18n.t("category")}
              </Label>
              <MyDropdownSearch
                id="category"
                name="category"
                placeholder={i18n.t("category")}
                options={localSegments}
                selected={validation.values.upper_id}
                setSelected={(e) => {
                  validation.setFieldValue("upper_id", e);
                }}
                disabled={readonlyInput}
                invalid={
                  validation.values.upper_id === segmentInfo?.id
                }
                onSearch={handleSearchSegment}
                onBlur={validation.handleBlur}
              />
              {validation.values.upper_id === segmentInfo?.id && (
                <p
                  style={{ color: "red", margin: 0 }}
                >{validation.errors.upper_id}</p>
              )}
            </div>
          </div>
        </div>

        <ModalFooter className="bg-light">
          <Button color="secondary" onClick={onClose}>
            {i18n.t("cancel")}
          </Button>
          {(!segmentInfo || canUpdate) && (
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

export default ModalMarketSegment;
