import { useEffect, useMemo, useState } from "react";
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
import { toast } from "react-toastify";
import { debounce } from "lodash";
import departmentService from "../../../services/department.service";
import i18n from "../../../i18n";
import { useAppSelector } from "../../../hook/store.hook";
import MyDropdownSearch from "../../../components/Common/MyDropdownSearch";
import MyDropdown from "../../../components/Common/MyDropdown";
import MyDropdownMultiple from "../../../components/Common/MyDropdownMultiple";
import styled from "styled-components";

const InvalidFeedback = styled.div`
  display: block;
  divor: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
  color: red;
`;

const ModalDepartment = ({
  type,
  isOpen,
  onClose,
  departmentInfo,
  onRefresh,
  listLocations,
  listCustomerGroups = [],
}) => {
  const [initialValues, setInitialValues] = useState(null);
  const [readonlyInput, setReadOnlyInput] = useState(false);
  const [localDepartment, setLocalDepartment] = useState([]);

  const { permissionUser } = useAppSelector((state) => state.auth);

  const isMobile = window.innerWidth < 576;

  const canUpdate = useMemo(() => {
    return permissionUser.includes("department:update_info");
  }, [permissionUser]);

  const title = useMemo(() => {
    return departmentInfo
      ? i18n.t("department_detail")
      : i18n.t("add_new_department");
  }, [departmentInfo]);

  const validation = useFormik({
    initialValues: {
      name: departmentInfo?.name ?? "",
      location_id: departmentInfo?.location_id ?? 0,
      upper_id: departmentInfo?.upper_id ?? null,
      customer_group_ids: (departmentInfo?.customer_groups ?? []).map(
        (el) => el.id
      ),
      customer_group_default_id: (departmentInfo?.customer_groups ?? []).find(
        (el) => {
          if (el.is_default) return el.id;
        }
      ),
    },
    validationSchema: Yup.object({
      name: Yup.string().required(i18n.t("field_required")).max(80),
      location_id: Yup.number().nullable(),
      upper_id: Yup.number()
        .nullable()
        .test("not-self-reference", "Not a correct value", function (value) {
          return (
            value === null ||
            value === -1 ||
            localDepartment.map((el) => el.value).includes(value)
          );
        }),
      customer_group_ids: Yup.array().nullable(),
      customer_group_default_id: Yup.number().nullable(),
    }),
    onSubmit: async () => {
      try {
        const payload = {
          name: validation.values.name,
          location_id:
            validation.values.location_id === ""
              ? null
              : validation.values.location_id,
          upper_id:
            validation.values.upper_id === -1
              ? null
              : validation.values.upper_id,
          customer_group_ids: validation.values.customer_group_ids,
          customer_group_default_id:
            validation.values.customer_group_default_id || 0,
        };
        const response =
          type === "update"
            ? await departmentService.updateDepartment(
                departmentInfo.id,
                payload
              )
            : await departmentService.createDepartment(payload);

        if (response.success) {
          toast.success(
            type === "update"
              ? i18n.t("update_success")
              : i18n.t("create_success"),
            {
              position: "top-right",
              autoClose: 200,
              theme: "light",
              hideProgressBar: true,
            }
          );
          onClose();
          onRefresh?.();
        } else {
          console.log("fail:", response);
        }
      } catch (error) {
        console.error(error);
        if (error?.errors) {
          console.log("validate errors", error.errors);
          validation.setErrors(error.errors);
        }
      }
    },
  });

  useEffect(() => {
    console.log("les erreurs", validation.errors);
  }, [validation.errors]);

  const handleGetPossibleParent = async (keyword) => {
    try {
      if (type === "create") {
        const res = await departmentService.getListDepartments({
          keyword: keyword ?? "",
          location_id:
            validation.values.location_id === null
              ? 0
              : Number(validation.values.location_id),
        });
        return [{ id: -1, name: i18n.t("no_parent") }, ...res.data];
      } else {
        const res = await departmentService.getValidParent(departmentInfo.id, {
          keyword: keyword ?? null,
          location_id:
            validation.values.location_id === null
              ? 0
              : Number(validation.values.location_id),
        });
        return [{ id: -1, name: i18n.t("no_parent") }, ...res.data];
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPossibleParents = async () => {
    try {
      const data = await handleGetPossibleParent();
      if (data) {
        setLocalDepartment(
          data.map((item) => {
            if (item.id !== -1) {
              return {
                value: item.id,
                label: item.id + " - " + item.name,
              };
            }
            return {
              value: item.id,
              label: item.name,
            };
          })
        );
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const handleSearchSegment = debounce(async (e) => {
    const data = await handleGetPossibleParent(e);
    if (data) {
      setLocalDepartment(
        data.map((item) => {
          if (item.id !== -1) {
            return {
              value: item.id,
              label: item.id + " - " + item.name,
            };
          }
          return {
            value: item.id,
            label: item.name,
          };
        })
      );
    }
  }, 300);

  const fetchDetail = async (id) => {
    try {
      const response = await departmentService.getDetailDepartment(id);
      if (response.success) {
        const data = response.data;
        validation.setValues({
          name: data.name || "",
          upper_id: data.upper_id || null,
          location_id: data.location_id || null,
          customer_group_ids: (departmentInfo?.customer_groups ?? []).map(
            (el) => el.id
          ),
          customer_group_default_id:
            (departmentInfo?.customer_groups ?? []).find((el) => el.is_default)
              ?.id ?? null,
        });
        setInitialValues({
          name: data.name || "",
          upper_id: data.upper_id || null,
          location_id: data.location_id || null,
          customer_group_ids: (departmentInfo?.customer_groups ?? []).map(
            (el) => el.id
          ),
          customer_group_default_id: (
            departmentInfo?.customer_groups ?? []
          ).find((el) => {
            if (el.is_default) return el.id;
          }),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && departmentInfo) {
      fetchDetail(departmentInfo.id);
    }

    if (!isOpen) {
      validation.resetForm();
      setInitialValues(null);
    }
  }, [isOpen, departmentInfo]);

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !== JSON.stringify(initialValues) &&
      initialValues !== null
    );
  }, [validation.values, initialValues]);

  useEffect(() => {
    if (isOpen) {
      fetchPossibleParents();
    }
  }, [isOpen, validation.values.location_id]);

  useEffect(() => {
    setReadOnlyInput(!canUpdate);
  }, [canUpdate]);

  return (
    <Modal isOpen={isOpen} centered size="lg" toggle={onClose}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validation.setTouched({
            name: true,
            upper_id: true,
            location_id: true,
            customer_group_default_id: true,
            customer_group_ids: true,
          });
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
                invalid={!!(validation.touched.name && validation.errors.name)}
              />
              {validation.touched.name && validation.errors.name && (
                <FormFeedback>{validation.errors.name}</FormFeedback>
              )}
            </div>
            <div className="mb-2">
              <Label for="location">{i18n.t("location")}</Label>
              <MyDropdown
                id="location"
                name="location"
                placeholder={i18n.t("location")}
                selected={validation.values.location_id}
                options={listLocations}
                displayEmpty={true}
                setSelected={(e) => {
                  validation.setFieldValue("location_id", e);
                  validation.setFieldValue("upper_id", null);
                }}
                disabled={readonlyInput}
                onBlur={validation.handleBlur}
                invalid={
                  !!(
                    validation.touched.location_id &&
                    validation.errors.location_id
                  )
                }
                isForm={true}
              />
              {validation.errors.location_id && (
                <InvalidFeedback>
                  {validation.errors.location_id}
                </InvalidFeedback>
              )}
            </div>
            <div className="mb-2">
              <Label for="category">{i18n.t("category")}</Label>
              <MyDropdownSearch
                id="category"
                name="category"
                placeholder={i18n.t("category")}
                options={localDepartment}
                selected={validation.values.upper_id}
                setSelected={(e) => {
                  validation.setFieldValue("upper_id", e);
                }}
                disabled={readonlyInput}
                invalid={validation.values.upper_id === departmentInfo?.id}
                onSearch={handleSearchSegment}
                onBlur={validation.handleBlur}
              />
              {validation.values.upper_id === departmentInfo?.id && (
                <p style={{ color: "red", margin: 0 }}>
                  {validation.errors.upper_id}
                </p>
              )}
            </div>

            <div className="mb-2">
              <Label for="customer_group">{i18n.t("customer_groups")}</Label>
              <MyDropdownMultiple
                id="customer_group"
                name="customer_group"
                placeholder={i18n.t("customer_groups")}
                selected={validation.values.customer_group_ids}
                options={listCustomerGroups}
                setSelected={(selected) => {
                  validation.setFieldValue("customer_group_ids", selected);
                  validation.setFieldValue("customer_group_default_id", null);
                }}
                disabled={readonlyInput}
                onBlur={validation.handleBlur}
                invalid={
                  !!(
                    validation.touched.customer_group_ids &&
                    validation.errors.customer_group_ids
                  )
                }
                isForm={true}
              />
              {validation.touched.customer_group_ids &&
                validation.errors.customer_group_ids && (
                  <FormFeedback>
                    {validation.errors.customer_group_ids}
                  </FormFeedback>
                )}
            </div>

            <div className="">
              <Label for="default_group">
                {i18n.t("default_customer_group")}
              </Label>
              <MyDropdown
                id="default_group"
                name="default_group"
                isForm={true}
                placeholder={i18n.t("default_customer_group")}
                displayEmpty={true}
                selected={validation.values.customer_group_default_id}
                options={validation.values.customer_group_ids
                  .map((el) =>
                    listCustomerGroups.find((el2) => el2.value === el)
                  )
                  .filter(Boolean)}
                setSelected={(e) => {
                  validation.setFieldValue("customer_group_default_id", e);
                }}
              />
              {validation.touched.customer_group_default_id &&
                validation.errors.customer_group_default_id && (
                  <InvalidFeedback>
                    {validation.errors.customer_group_default_id}
                  </InvalidFeedback>
                )}
            </div>
          </div>
        </div>

        <ModalFooter className="bg-light">
          <Button color="secondary" onClick={onClose}>
            {i18n.t("cancel")}
          </Button>
          {(!departmentInfo || canUpdate) && (
            <Button
              color="primary"
              type="submit"
              disabled={type === "update" ? !isChanged : false}
              style={isMobile ? { width: "100%" } : undefined}
            >
              {type === "update" ? i18n.t("update") : i18n.t("save")}
            </Button>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ModalDepartment;
