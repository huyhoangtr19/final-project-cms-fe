import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Form, Input, TabContent, TabPane } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { isEmpty, isString } from "lodash";
import { toast } from "react-toastify";
import withRouter from "../../components/Common/withRouter"
import i18n from "../../i18n";
import policyService from "../../services/policy.service"
import departmentService from "../../services/department.service";
import departmentGroupService from "../../services/department.group.service";
import marketSegmentService from "../../services/market.segment.service";
import MyDropdown from "../../components/Common/MyDropdown";
import { listKindPackage, listStatusPolicy, TIER_COMMISSION_KIND, TIER_KIND } from "../../constants/app.const";
import RadioSelector from "../../components/Common/RadioSelector";
import PolicyTierCard from "./PolicyTierCard";
import styled from "styled-components";
import moment from "moment/moment";

const InvalidFeedback = styled.div`
  display: block;
  color: #f46a6a;
  font-size: 10px;
  margin-top: 4px;
`;

const PolicyDetail = (props) => {
  document.title = "Policy | Fitness CMS";

  const { id } = useParams();
  const [currentTabActive, setCurrentTabActive] = useState(0);
  const [policyDetail, setPolicyDetail] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentGroups, setDepartmentGroups] = useState([]);
  const [marketSegments, setMarketSegments] = useState([]);
  const listTiersTypes = [
    { id: 0, label: i18n.t("amount_based_tiers") },
    { id: 1, label: i18n.t("session_based_tiers") },
  ];
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: policyDetail?.name ?? "",
      effective_date: policyDetail?.effective_date ?? "",
      status: policyDetail?.status ?? 0,
      package_kind: policyDetail?.package_kind ?? 0,
      departments: policyDetail?.departments?.map(item => item.id) ?? [],
      market_segments: policyDetail?.market_segments?.map(item => item.id) ?? [],
      tiers: policyDetail?.tiers?.map((item) => ({
        id: item.id,
        kind: item.kind,
        min: item.min,
        max: item.max,
        name: item.name,
        commission_kind: item.commission_kind,
        commission_percent: item.commission_kind === TIER_COMMISSION_KIND.RATE
          ? item.commission_value
          : 0,
        commission_amount: item.commission_kind === TIER_COMMISSION_KIND.AMOUNT
          ? item.commission_value
          : 0,
        commission_value: item.commission_value,
      })) ?? []
    },
    validationSchema: Yup.object({
      name: Yup.string().required(i18n.t("field_required")),
      effective_date: Yup.string().required(i18n.t("field_required")),
      status: Yup.number()
        .min(0, "Invalid policy status")
        .max(2, "Invalid policy status")
        .required(i18n.t("field_required")),
      package_kind: Yup.number()
        .min(0, "Invalid package kind")
        .required(i18n.t("field_required")),
      departments: Yup.array().of(
        Yup.number().min(1, "Invalid department id")
      )
        .min(1, i18n.t("select_at_least_one_element_error_message"))
        .required(i18n.t("select_at_least_one_element_error_message")),
      market_segments: Yup.array().of(
        Yup.number().min(1, "Invalid market segment id")
      )
        .min(1, i18n.t("select_at_least_one_element_error_message"))
        .required(i18n.t("select_at_least_one_element_error_message")),
      tiers: Yup.array().of(
        Yup.object().shape({
          kind: Yup.number().min(0, "Invalid"),
          min: Yup.number()
            .min(0, "Invalid minimum")
            .required(i18n.t("field_required")),
          max: Yup.number()
            .min(0, "Invalid maximum")
            .test(
              "is-greater",
              i18n.t("max_greater_than_min_error_message"),
              function (value) {
                const { min } = this.parent;
                return value > min;
              }
            )
            .required(i18n.t("field_required")),
          name: Yup.string().required(i18n.t("field_required")),
          commission_kind: Yup.number()
            .min(0, "Invalid commission_kind")
            .required(i18n.t("field_required")),
          commission_percent: Yup.number()
            .nullable()
            .when("commission_kind", {
              is: TIER_COMMISSION_KIND.RATE, // 1
              then: (schema) =>
                schema
                  .required(i18n.t("field_required"))
                  .min(0, "Invalid commission_percent"),
              otherwise: (schema) => schema.nullable(),
            }),
          commission_amount: Yup.number()
            .nullable()
            .when("commission_kind", {
              is: TIER_COMMISSION_KIND.AMOUNT, // 0
              then: (schema) =>
                schema
                  .required(i18n.t("field_required"))
                  .min(0, "Invalid commission_amount"),
              otherwise: (schema) => schema.nullable(),
            }),
          commission_value: Yup.number()
            .when("commission_kind", {
              is: TIER_COMMISSION_KIND.RATE,
              then: () =>
                Yup.number()
                  .min(0, "Commission value must be between 0 and 100")
                  .max(100, "Commission value must be between 0 and 100"),
              otherwise: () =>
                Yup.number()
                  .min(0, "Commission value must be greater than 0"),
            })
            .required(i18n.t("field_required")),
        })
      )
        .min(1, i18n.t("select_at_least_one_element_error_message"))
        .required(i18n.t("select_at_least_one_element_error_message")),
    }),
    onSubmit: (values) => {
      handleSubmitForm(values);
    }
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

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(validation.values) !==
      JSON.stringify(validation.initialValues)
    );
  }, [validation.values, validation.initialValues]);

  const {
    amount: amountBasedTiers,
    sessions: sessionsBasedTiers
  } = useMemo(() => {
    return validation.values.tiers.reduce(
      (acc, tier, index) => {
        const itemWithIndex = { ...tier, originalIndex: index };
        if (tier.kind === TIER_KIND.AMOUNT) acc.amount.push(itemWithIndex);
        else if (tier.kind === TIER_KIND.SESSION) acc.sessions.push(itemWithIndex);
        return acc;
      },
      { amount: [], sessions: [] }
    );
  }, [validation.values.tiers]);

  const listPackages = useMemo(() => {
    return listKindPackage.map((pkg) => ({
      ...pkg,
      active: pkg.value === validation.values.package_kind
    }))
  }, [validation.values.package_kind]);

  const listDepartments = useMemo(() => {
    return departments.map((dep) => ({
      ...dep,
      active: validation.values.departments.includes(dep.id)
    }))
  }, [departments, validation.values.departments]);

  const listDepartmentGroups = useMemo(() => {
    return departmentGroups.map((depG) => {
      const allDepartmentIds = depG.departments.map((d) => d.id);
      const isActive = allDepartmentIds.every((id) =>
        validation.values.departments.includes(id)
      );
      return {
        ...depG,
        active: isActive
      }
    })
  }, [departmentGroups, validation.values.departments]);

  const listMarketSegments = useMemo(() => {
    return marketSegments.map((dep) => ({
      ...dep,
      active: validation.values.market_segments.includes(dep.id)
    }))
  }, [marketSegments, validation.values.market_segments]);

  const handleSubmitForm = async (values) => {
    try {
      const dataObject = {
        name: values.name,
        effective_date: values.effective_date,
        status: values.status,
        package_kind: values.package_kind,
        market_segment_ids: values.market_segments,
        department_ids: values.departments,
        tiers: values.tiers,
      }

      const response = props.type === "create"
        ? await policyService.createPolicy(dataObject)
        : await policyService.updatePolicy(id, dataObject);

      if (response.success) {
        if (props.type === "create") {
          toast.success(i18n.t("policy_created_message"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
          props.router.navigate(`/policy/detail/${response.data.id}`);
        }
        if (props.type === "detail") {
          toast.success(i18n.t("policy_updated_message"), {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
          props.router.navigate(`/settings?tab=5`);
        }
      }
    } catch (e) {
      if (e?.errors) {
        validation.setErrors(e.errors);
      }
    }
  };

  const handleGetDetailPolicy = async (policyId) => {
    try {
      const response = await policyService.getDetailPolicy(policyId);
      if (response.success) {
        response.data.effective_date = response.data.effective_date
          ? moment(response.data.effective_date).format("yyyy-MM-DD")
          : "";
        setPolicyDetail(response.data);
      } else {
        toast.error(i18n.t("fetch_policy_error_message"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("Failed to fetch policy", e);
    }
  };

  const handleGetDepartmentGroups = async () => {
    try {
      const response = await departmentGroupService.getListDepartmentGroups();
      if (response.success) {
        setDepartmentGroups(response.data);
      } else {
        toast.error(i18n.t("fetch_department_groups_error_message"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("Failed to fetch department groups", e)
    }
  }

  const handleGetDepartments = async () => {
    try {
      const response = await departmentService.getListDepartments();
      if (response.success) {
        setDepartments(response.data);
      } else {
        toast.error(i18n.t("fetch_departments_error_message"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("Failed to fetch departments", e);
    }
  };

  const handleGetMarketSegments = async () => {
    try {
      const response = await marketSegmentService.getListMarketSegments();
      if (response.success) {
        setMarketSegments(response.data);
      } else {
        toast.error(i18n.t("fetch_market_segments_error_message"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("Failed to fetch market segments", e);
    }
  }

  const fetchData = () => {
    if (id) {
      handleGetDetailPolicy(id);
    }
    handleGetDepartments();
    handleGetDepartmentGroups();
    handleGetMarketSegments();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDepartmentGroupClick = (depG) => {
    const allDepartmentIds = depG.departments.map((d) => d.id);
    const isActive = allDepartmentIds.every((id) =>
      validation.values.departments.includes(id)
    );

    if (isActive) {
      validation.setFieldValue(
        "departments",
        validation.values.departments.filter((id) => !allDepartmentIds.includes(id))
      );
    } else {
      validation.setFieldValue(
        "departments",
        Array.from(new Set([...validation.values.departments, ...allDepartmentIds]))
      );
    }
  };

  const handleDepartmentClick = (dep) => {
    validation.setFieldValue("departments",
      validation.values.departments.includes(dep.id)
        ? validation.values.departments.filter((id) => id != dep.id)
        : [...validation.values.departments, dep.id]
    );
  }

  const handleMarketSegmentClick = (ms) => {
    validation.setFieldValue("market_segments",
      validation.values.market_segments.includes(ms.id)
        ? validation.values.market_segments.filter((id) => id != ms.id)
        : [...validation.values.market_segments, ms.id]
    );
  }

  const handleNewTierClick = (kind) => {
    const newTier = {
      kind: kind,
      min: undefined,
      max: undefined,
      name: undefined,
      commission_kind: TIER_COMMISSION_KIND.RATE,
      commission_amount: undefined,
      commission_percent: undefined,
      commission_value: undefined,
    }
    validation.setFieldValue("tiers", [...(validation.values.tiers || []), newTier]);
  }

  const getStatus = () => {
    return listStatusPolicy.find(
      (item) => item.value === Number(validation.values.status)
    );
  };

  const getPackage = () => {
    return listPackages.find(
      (item) => item.value === Number(validation.values.package_kind)
    );
  };

  const handleBack = () => {
    props.router.navigate("/settings?tab=5")
  };

  return (
    <React.Fragment>
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
        <div className="page-content content-container">
          <div className="policy-grid">
            <div className="policy-config">
              <div className="policy-card">
                <div className="policy-card-header">
                  <h5 className="policy-card-title">{i18n.t("policy_setup")}</h5>
                  <hr className="separator" />
                  <p className="info">{i18n.t("policy_setup_message")}</p>
                </div>
                <div className="policy-card-body">
                  <div className="setup-section">
                    <h5 className="section-title">{i18n.t("basic_information")}</h5>
                    <hr className="separator" />
                    <div className="inputs">
                      <div>
                        <label
                          htmlFor="policy_name"
                          className="form-label"
                        >
                          {i18n.t("policy_name")}
                        </label>
                        <Input
                          id="policy_name"
                          name="policy_name"
                          type="text"
                          value={validation.values.name}
                          placeholder={i18n.t("policy_name")}
                          onChange={(e) => validation.setFieldValue("name", e.target.value)}
                          onBlur={validation.handleBlur}
                          invalid={
                            validation.errors.name
                            && validation.touched.name
                          }
                        />
                        {validation.errors.name &&
                          validation.touched.name && (
                            <InvalidFeedback>
                              {validation.errors.name}
                            </InvalidFeedback>
                          )}
                      </div>
                      <div>
                        <label
                          htmlFor="effective_date"
                          className="form-label"
                        >
                          {i18n.t("effective_date")}
                        </label>
                        <Input
                          id="effective_date"
                          name="effective_date"
                          type="date"
                          value={validation.values.effective_date}
                          placeholder={i18n.t("effective_date")}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          invalid={
                            validation.errors.effective_date
                            && validation.touched.effective_date
                          }
                        />
                        {validation.errors.effective_date &&
                          validation.touched.effective_date && (
                            <InvalidFeedback>
                              {validation.errors.effective_date}
                            </InvalidFeedback>
                          )}
                      </div>
                      <div>
                        <label
                          htmlFor="policy_status"
                          className="form-label"
                        >
                          {i18n.t("policy_status")}
                        </label>
                        <MyDropdown
                          id="policy_status"
                          name="policy_status"
                          placeholder={i18n.t("policy_status")}
                          options={listStatusPolicy}
                          selected={
                            validation.values.status
                          }
                          setSelected={(e) => {
                            validation.setFieldValue("status", e);
                          }}
                          isForm={true}
                          invalid={
                            validation.errors.status
                            && validation.touched.status
                          }
                        />
                        {validation.errors.status &&
                          validation.touched.status && (
                            <InvalidFeedback>
                              {validation.errors.status}
                            </InvalidFeedback>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="setup-section">
                    <h5 className="section-title">{i18n.t("select_package_types")}</h5>
                    <hr className="separator" />
                    <div className="inputs">
                      {listPackages.map((item, index) => (
                        <RadioSelector
                          key={index}
                          title={item.title}
                          subtitle={item.description}
                          active={item.active}
                          onClick={() => {
                            validation.setFieldValue("package_kind", item.value);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="policy-card">
                <div className="policy-card-header">
                  <h5 className="policy-card-title">{i18n.t("departments")}</h5>
                  <hr className="separator" />
                  <p className="info">{i18n.t("policy_departments_message")}</p>
                </div>
                <div className="policy-card-body">
                  <div className="setup-section">
                    <h5 className="section-title">{i18n.t("department_groups")}</h5>
                    <hr className="separator" />
                    <div className="inputs">
                      {listDepartmentGroups.map((item, index) => (
                        <RadioSelector
                          key={index}
                          title={item.name}
                          active={item.active}
                          onClick={() => handleDepartmentGroupClick(item)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="setup-section">
                    <h5 className="section-title">{i18n.t("departments")}</h5>
                    <hr className="separator" />
                    <div className="inputs">
                      {listDepartments.map((item, index) => (
                        <RadioSelector
                          key={index}
                          title={item.name}
                          active={item.active}
                          onClick={() => handleDepartmentClick(item)}
                        />
                      ))}
                    </div>
                  </div>
                  {validation.errors.departments &&
                    validation.touched.departments && (
                      <InvalidFeedback>
                        {validation.errors.departments}
                      </InvalidFeedback>
                    )}
                </div>
              </div>
              <div className="policy-card">
                <div className="policy-card-header">
                  <h5 className="policy-card-title">{i18n.t("market_segmentation")}</h5>
                  <hr className="separator" />
                  <p className="info">{i18n.t("policy_market_segmentation_message")}</p>
                </div>
                <div className="policy-card-body">
                  <div className="setup-section">
                    <div className="inputs">
                      {listMarketSegments.map((item, index) => (
                        <RadioSelector
                          key={index}
                          title={item.name}
                          active={item.active}
                          onClick={() => handleMarketSegmentClick(item)}
                        />
                      ))}
                    </div>
                  </div>
                  {validation.errors.market_segments &&
                    validation.touched.market_segments && (
                      <InvalidFeedback>
                        {validation.errors.market_segments}
                      </InvalidFeedback>
                    )}
                </div>
              </div>
              <div className="policy-card">
                <div className="policy-card-header">
                  <h5 className="policy-card-title">{i18n.t("commission_tiers")}</h5>
                  <hr className="separator" />
                  <p className="info">{i18n.t("policy_commission_tiers_message")}</p>
                </div>
                <div className="policy-card-body">
                  <div className="setup-section">
                    <div className="tabs-header">
                      {listTiersTypes.map((section) => (
                        <div
                          key={section.id}
                          onClick={() => setCurrentTabActive(section.id)}
                          className={"text-center tab-item " + (currentTabActive === section.id ? "active" : "")}
                        >
                          {section.label}
                        </div>
                      ))}
                    </div>
                    <TabContent activeTab={currentTabActive} className="p-0 mt-3">
                      <TabPane tabId={0}>
                        <div className="policy-tab-pane">
                          {!isEmpty(amountBasedTiers) &&
                            amountBasedTiers.map((tier, index) => (
                              <PolicyTierCard
                                key={index}
                                type={TIER_KIND.AMOUNT}
                                validation={validation}
                                index={tier.originalIndex}
                              />
                            ))}
                          <div
                            className="policy-new-tier-container"
                            onClick={() => handleNewTierClick(TIER_KIND.AMOUNT)}
                          >
                            <i className="fa fa-plus" />
                            <p>{i18n.t("add_new_tier")}</p>
                          </div>
                        </div>
                      </TabPane>
                      <TabPane tabId={1}>
                        <div className="policy-tab-pane">
                          {!isEmpty(sessionsBasedTiers) &&
                            sessionsBasedTiers.map((tier, index) => (
                              <PolicyTierCard
                                key={index}
                                type={TIER_KIND.SESSION}
                                validation={validation}
                                index={tier.originalIndex}
                              />
                            ))}
                          <div
                            className="policy-new-tier-container"
                            onClick={() => handleNewTierClick(TIER_KIND.SESSION)}
                          >
                            <i className="fa fa-plus" />
                            <p>{i18n.t("add_new_tier")}</p>
                          </div>
                        </div>
                      </TabPane>
                      {validation.errors.tiers &&
                        validation.touched.tiers &&
                        isString(validation.errors.tiers) && (
                          <InvalidFeedback>{validation.errors.tiers}</InvalidFeedback>
                        )}
                    </TabContent>
                  </div>
                </div>
              </div>
            </div>
            <div className="policy-card policy-summary">
              <div className="policy-card-header">
                <h5 className="policy-card-title">{i18n.t("preview_and_finalize")}</h5>
                <hr className="separator" />
                <p className="info">{i18n.t("policy_preview_message")}</p>
              </div>
              <div className="policy-card-body">
                <div className="policy-summary-infos">
                  <div className="policy-summary-info">
                    <label className="policy-summary-label">
                      {i18n.t("name")}
                    </label>
                    <p>{validation.values.name}</p>
                  </div>
                  <div className="policy-summary-info">
                    <label className="policy-summary-label">
                      {i18n.t("effective_date")}
                    </label>
                    <p>
                      {validation.values.effective_date !== "" &&
                        (new Date(validation.values.effective_date).toLocaleDateString("vi-VN", {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric'
                        }))
                      }
                    </p>
                  </div>
                  <div className="policy-summary-info">
                    <label className="policy-summary-label">
                      {i18n.t("policy_status")}
                    </label>
                    <p>{getStatus()?.label}</p>
                  </div>
                  <div className="policy-summary-info">
                    <label className="policy-summary-label">
                      {i18n.t("package_kind")}
                    </label>
                    <p>{getPackage()?.title}</p>
                  </div>
                </div>
                {!isEmpty(validation.values.tiers) && (
                  <div className="policy-summary-infos">
                    <div className="policy-summary-info">
                      <label className="policy-summary-label">
                        {i18n.t("commission_tiers")}
                      </label>
                    </div>
                    <ul className="policy-tiers-list">
                      {validation.values.tiers.map((tier, index) => (
                        <li
                          key={index}
                          className=""
                        >
                          <i className="fa fa-arrow-right" />
                          <span className="bold">{tier.name}</span>
                          {tier.min && tier.max && `(${tier.min} - ${tier.max}) `
                            + (tier.kind === TIER_KIND.AMOUNT ? "VND" : i18n.t("sessions"))
                          }
                          {tier.commission_kind !== (null || undefined)
                            && validation.values.tiers[index]?.commission_value !== (null || undefined) &&
                            ` | ${tier.commission_value} ${(tier.commission_kind === TIER_COMMISSION_KIND.AMOUNT
                              ? "VND" : "%")
                            }`
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="action-buttons mt-4">
                  <Button
                    color="success"
                    className="btn-back"
                    type="button"
                    onClick={handleBack}
                    outline
                  >
                    {i18n.t("back")}
                  </Button>
                  {props.type === "create" ? (
                    <Button
                      color="primary"
                      type="submit"
                    >
                      {i18n.t("save")}
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      type="submit"
                      disabled={!isChanged}
                    >
                      {i18n.t("update")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </React.Fragment>
  )
}

export default withRouter(PolicyDetail);