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
import departmentGroupService from "../../../services/department.group.service";
import departmentService from "../../../services/department.service";
import i18n from "../../../i18n";
import { useAppSelector } from "../../../hook/store.hook";
import MyDropdownMultiple from "../../../components/Common/MyDropdownMultiple";

const ModalDepartment = ({
  type,
  isOpen,
  onClose,
  departmentGroupInfo,
  listSelectedDepartment,
  setListSelectedDepartment
}) => {
  const [initialValues, setInitialValues] = useState(null);
  const [readonlyInput, setReadOnlyInput] = useState(false);
  const [departments, setDepartments] = useState([]);

  const { permissionUser } = useAppSelector((state) => state.auth);

  const isMobile = window.innerWidth < 576;

  const canUpdate = useMemo(() => {
    return permissionUser.includes("department:update_info");
  }, [permissionUser]);

  const title = useMemo(() => {
    return departmentGroupInfo ? i18n.t("department_group_detail") : i18n.t("add_new_department_group");
  }, [departmentGroupInfo]);

  const validation = useFormik({
    initialValues: {
      name: departmentGroupInfo?.name ?? "",
      department_ids: type === "create" ? listSelectedDepartment : departmentGroupInfo?.department_ids ?? [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required(i18n.t("field_required")).max(80),
      department_ids: Yup.array().nullable()
    }),
    onSubmit: async () => {
      try {
        const payload = {
          name: validation.values.name,
          department_ids: validation.values.department_ids,
        };
        const response = type === 'update'
          ? await departmentGroupService.updateDepartmentGroup(departmentGroupInfo.id, payload)
          : await departmentGroupService.createDepartmentGroup(payload);

        if (response.success) {
          toast.success(type === 'update' ? i18n.t("update_success") : i18n.t("create_success"), {
            position: "top-right",
            autoClose: 200,
            theme: "light",
            hideProgressBar: true,
          });
          if (type === "create")
            setListSelectedDepartment([]);
          onClose();
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

  const handleGetDepartments = async () => {
    try {
      const res = await departmentService.getListDepartments({});
      if (res.success) {
        setDepartments(res.data.map((el) => { return { value: el.id, label: el.id + " - " + el.name } }));
      } else {
        console.log("fail: ", res);
        toast.error("Error fetching data", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        })
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const response = await departmentGroupService.getDetailDepartmentGroup(id);
      if (response.success) {
        const data = response.data;
        validation.setValues({
          name: data.name || "",
          department_ids: (data.departments || []).map((el) => el.id)
        });
        setInitialValues({
          name: data.name || "",
          department_ids: (data.departments || []).map((el) => el.id)
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && departmentGroupInfo) {
      fetchDetail(departmentGroupInfo.id);
    }

    if (!isOpen) {
      validation.resetForm();
      setInitialValues(null);
    }
  }, [isOpen, departmentGroupInfo]);

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !== JSON.stringify(initialValues) &&
      initialValues !== null
    );
  }, [validation.values, initialValues]);

  useEffect(() => {
    if (isOpen) {
      handleGetDepartments();
    }
  }, [isOpen, validation.values.location_id]);

  useEffect(() => { setReadOnlyInput(!canUpdate) }, [canUpdate]);

  useEffect(() => {
    if (isOpen && type === 'create') {
      validation.setFieldValue("department_ids", listSelectedDepartment);
    }
  }, [isOpen])

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
          </div>

          <div>
            <div className="mb-2">
              <Label for="dep">
                {i18n.t("departments")}
              </Label>
              <MyDropdownMultiple
                id="dep"
                name="dep"
                placeholder={i18n.t("departments")}
                selected={validation.values.department_ids}
                options={departments}
                setSelected={(selected) =>
                  validation.setFieldValue("department_ids", selected)
                }
                disabled={readonlyInput}
                onBlur={validation.handleBlur}
                invalid={!!(validation.touched.department_ids && validation.errors.department_ids)}
                isForm={true}
              />
              {validation.touched.department_ids && validation.errors.department_ids && (
                <FormFeedback>{validation.errors.department_ids}</FormFeedback>
              )}
            </div>
          </div>
        </div>

        <ModalFooter className="bg-light">
          <Button color="secondary" onClick={onClose}>
            {i18n.t("cancel")}
          </Button>
          {(!departmentGroupInfo || canUpdate) && (
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

export default ModalDepartment;
