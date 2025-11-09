import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { TIER_COMMISSION_KIND, TIER_KIND } from "../../constants/app.const";
import staffService from "../../services/staff.service";
import i18n from "../../i18n";
import { formatNumberAsCurrency } from "../../utils/app";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const StaffPolicies = forwardRef((props, ref) => {
  const [revenues, setRevenues] = useState([]);
  const [policies, setPolicies] = useState([]);

  const handleFetchRevenues = async () => {
    if (!props.staff) return;
    try {
      const payload = {
        start_date: props.startDate ?? "",
        end_date: props.endDate ?? ""
      }
      const response = await staffService.getStaffRevenuesByMarketSegments(props.staff?.id, payload);
      if (response.success) {
        setRevenues(response.data);
      }
    } catch (e) {
      console.error("Error", e);
    }
  };

  const handleFetchPolicies = async () => {
    if (!props.staff) return;
    try {
      const response = await staffService.getStaffPolicies(props.staff?.id);
      if (response.success) {
        setPolicies(response.data);
      }
    } catch (e) {
      console.error("Error", e);
    }
  };

  const appliedPolicies = useMemo(() => {
    return policies.map((policy) => {
      let trr = 0;
      let tc = 0;
      let ts = 0;
      let tsg = 0;
      let addCommission = 0;
      let addSessionsGains = 0;
      let amountTiers = [];
      let amountAppliedTiers = [];
      let sessionsTiers = [];
      let sessionsAppliedTiers = [];

      // Concatenate values
      policy.market_segments.map((ms) => {
        const currentRevenues = revenues.find((el) => el.ms_id === ms.id);
        if (currentRevenues) {
          currentRevenues.packages.map((currentPackage) => {
            if (currentPackage.package_kind === policy.package_kind) {
              trr += Number(currentPackage.total_recognized_revenue ?? 0);
              tc += Number(currentPackage.total_commission ?? 0);
              ts += Number(currentPackage.total_sessions ?? 0);
              tsg += Number(currentPackage.total_sessions_gains ?? 0);
            }
          });
        }
      });

      // Fill relative tiers
      policy.tiers.map((tier) => {
        if (tier.kind === TIER_KIND.AMOUNT) {
          if (tier.min <= trr && tier.max >= trr) {
            amountTiers.push(tier);
          }
        } else {
          if (tier.min <= ts && tier.max >= ts) {
            sessionsTiers.push(tier);
          }
        }
      });

      sessionsTiers.map((tier) => {
        let gains = 0;

        if (tier.commission_kind === TIER_COMMISSION_KIND.AMOUNT) {
          gains = Number(tier.commission_value) * ts;
        } else {
          gains = (Number(tier.commission_value) / 100) * tsg;
        }

        addSessionsGains += gains;
        sessionsAppliedTiers.push({
          ...tier,
          addGains: gains
        });
      });

      amountTiers.map((tier) => {
        let gains = 0;

        if (tier.commission_kind === TIER_COMMISSION_KIND.AMOUNT) {
          gains = Number(tier.commission_value);
        } else {
          gains = (Number(tier.commission_value) / 100) * trr;
        }

        addCommission += gains;
        amountAppliedTiers.push({
          ...tier,
          addGains: gains
        });
      });

      return {
        policy: policy,
        amountTiers: amountAppliedTiers,
        sessionsTiers: sessionsAppliedTiers,
        addCommission: addCommission,
        addSessionsGains: addSessionsGains
      };
    });
  }, [policies, revenues]);

  const finalRevenues = useMemo(() => {
    let finalCommission = 0;
    let finalSesssionsGains = 0;

    revenues.map((currentRevenues) => {
      currentRevenues.packages.map((currentPackage) => {
        finalCommission += Number(currentPackage.total_commission ?? 0);
        finalSesssionsGains += Number(currentPackage.total_sessions_gains ?? 0);
      });

      currentRevenues.products.map((currentProduct) => {
        finalCommission += Number(currentProduct.total_commission ?? 0);
      });
    });

    appliedPolicies.map((policy) => {
      finalCommission += policy.addCommission;
      finalSesssionsGains += policy.addSessionsGains;
    });

    return { finalCommission, finalSesssionsGains };
  }, [appliedPolicies]);

  const beforePoliciesCards = useMemo(() => {
    let trr = 0;
    let tc = 0;
    let ts = 0;
    let tsg = 0;

    revenues.map((currentRevenues) => {
      currentRevenues.packages.map((currentPackage) => {
        trr += Number(currentPackage.total_recognized_revenue ?? 0);
        tc += Number(currentPackage.total_commission ?? 0);
        ts += Number(currentPackage.total_sessions ?? 0);
        tsg += Number(currentPackage.total_sessions_gains ?? 0);
      });

      currentRevenues.products.map((currentProduct) => {
        trr += Number(currentProduct.total_recognized_revenue ?? 0);
        tc += Number(currentProduct.total_commission ?? 0);
      });
    });

    return [
      { title: i18n.t("total_commission"), value: tc, isMoney: true },
      { title: i18n.t("total_recognized_revenue"), value: trr, isMoney: true },
      { title: i18n.t("sessions_burnt"), value: ts, isMoney: false },
      { title: i18n.t("sessions_burnt_gains"), value: tsg, isMoney: true },
    ];
  }, [revenues]);

  const afterPoliciesCards = useMemo(() => {
    return [
      { title: i18n.t("total_commission"), value: finalRevenues.finalCommission, isMoney: true },
      { title: i18n.t("sessions_burnt_gains"), value: finalRevenues.finalSesssionsGains, isMoney: true },
    ];
  }, [finalRevenues]);

  useEffect(() => {
    handleFetchRevenues();
  }, [props.staff, props.startDate, props.endDate]);

  useEffect(() => {
    handleFetchPolicies();
  }, [props.staff]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Staff Policies");

    // =============================
    // 1) Before Policies
    // =============================
    const beforeTitle = worksheet.addRow([i18n.t("before_policies")]);
    beforeTitle.font = { name: "Calibri", bold: true, size: 12, color: { argb: "FFF4F1ED" } }; // noir
    beforeTitle.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3A3B5C" }
    };
    worksheet.mergeCells(`A${beforeTitle.number}:D${beforeTitle.number}`);
    beforePoliciesCards.forEach(card => {
      worksheet.addRow([
        card.title,
        card.isMoney ? `${formatNumberAsCurrency(card.value)} VND` : card.value
      ]);
    });
    worksheet.addRow([]);

    // =============================
    // 2) Applied Policies
    // =============================
    const appliedPoliciesTitle = worksheet.addRow([i18n.t("applied_policies")]);
    appliedPoliciesTitle.font = { name: "Calibri", bold: true, size: 12, color: { argb: "FFF4F1ED" } };
    appliedPoliciesTitle.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3A3B5C" }
    };
    worksheet.mergeCells(`A${appliedPoliciesTitle.number}:D${appliedPoliciesTitle.number}`);
    worksheet.addRow([i18n.t("sessions_tiers")]);
    appliedPolicies.forEach(item => {
      item.sessionsTiers.forEach(tier => {
        const row = worksheet.addRow([
          tier.policyName,
          tier.name,
          tier.commission_kind === TIER_COMMISSION_KIND.AMOUNT
            ? `${formatNumberAsCurrency(tier.commission_value)} VND / ${i18n.t("session")}`
            : `${tier.commission_value}%`,
          `+ ${formatNumberAsCurrency(tier.addGains)} VND`
        ]);
        row.getCell(4).font = { name: "Calibri", color: { argb: "FF16A34A" }, bold: true };
      });
    });

    worksheet.addRow([]);
    worksheet.addRow([i18n.t("amount_tiers")]);
    appliedPolicies.forEach(item => {
      item.amountTiers.forEach(tier => {
        const row = worksheet.addRow([
          tier.policyName,
          tier.name,
          tier.commission_kind === TIER_COMMISSION_KIND.AMOUNT
            ? `${formatNumberAsCurrency(tier.commission_value)} VND`
            : `${tier.commission_value}%`,
          `+ ${formatNumberAsCurrency(tier.addGains)} VND`
        ]);
        row.getCell(4).font = { name: "Calibri", color: { argb: "FF16A34A" }, bold: true };
      });
    });

    worksheet.addRow([]);

    // =============================
    // 3) After Policies
    // =============================
    const afterTitle = worksheet.addRow([i18n.t("after_policies")]);
    afterTitle.font = { name: "Calibri", bold: true, size: 12, color: { argb: "FFF4F1ED" } };
    afterTitle.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3A3B5C" }
    };
    worksheet.mergeCells(`A${afterTitle.number}:D${afterTitle.number}`);

    afterPoliciesCards.forEach(card => {
      worksheet.addRow([
        card.title,
        card.isMoney ? `${formatNumberAsCurrency(card.value)} VND` : card.value
      ]);
    });

    // =============================
    // 4) Formatting
    // =============================
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const len = cell.value ? cell.value.toString().length : 10;
        if (len > maxLength) {
          maxLength = len;
        }
      });
      column.width = maxLength + 2;
    });

    // =============================
    // 5) Generate and Download
    // =============================
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `staff_performance_${props.staff?.last_name}_${props.staff?.first_name}.xlsx`);
  };

  // Forward export excel function to the parent component
  useImperativeHandle(ref, () => ({
    exportToExcel
  }));

  const renderTiers = (appliedPolicies, type) => {
    return appliedPolicies
      .flatMap(item =>
        item[(type === TIER_KIND.AMOUNT ? "amountTiers" : "sessionsTiers")].map(tier => ({
          ...tier,
          policyName: item.policy.name,
        }))
      )
      .map((tier, index, array) => (
        <div key={`${tier.id || tier.name}-${index}`}>
          <div className="staff-policies-tier">
            <div className="staff-policies-tier-names">
              <h5 className="staff-policies-tier-title">{tier.name}</h5>
              <p className="staff-policies-tier-policy">{tier.policyName}</p>
            </div>
            <div className="staff-policies-tier-gains">
              <p className="staff-policies-tier-gain">
                {tier.commission_kind === TIER_COMMISSION_KIND.AMOUNT
                  ? `${formatNumberAsCurrency(tier.commission_value)} VND ${type === TIER_KIND.SESSION ? `/ ${i18n.t("session")}` : ""}`
                  : `${tier.commission_value}%`}
              </p>
              <i className="fa fa-arrow-right" />
              <p className="staff-policies-tier-gain highlight">
                {`+ ${formatNumberAsCurrency(tier.addGains)} VND`}
              </p>
            </div>
          </div>
          {index !== array.length - 1 && <hr className="staff-policies-separator my-2" />}
        </div>
      ));
  };

  return (
    <div className="staff-policies-sections-container mt-4">
      <div className="staff-policies-section">
        <div className="staff-policies-header">
          <h5 className="staff-name">{i18n.t("before_policies")}</h5>
          <hr className="staff-policies-separator" />
        </div>
        <div className="staff-policies-body before">
          {beforePoliciesCards.map((card) => (
            <div className="dashboard-card-summary-container">
              <div className="dashboard-card-summary-header">
                <h5 className="dashboard-card-summary-title">{card.title}</h5>
              </div>
              <div className="dashboard-card-summary-body">
                <p className="dashboard-card-summary-main-figure">
                  {card.isMoney
                    ? `${formatNumberAsCurrency(card.value)} VND`
                    : card.value
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="staff-policies-section">
        <div className="staff-policies-header">
          <h5 className="staff-name">{i18n.t("applied_policies")}</h5>
          <hr className="staff-policies-separator" />
        </div>
        <div className="staff-policies-body tiers">
          <div className="staff-policies-tiers">
            <h5 className="staff-name">{i18n.t("sessions_tiers")}</h5>
            <hr className="staff-policies-separator" />
            {renderTiers(appliedPolicies, TIER_KIND.SESSION)}
          </div>
          <div className="staff-policies-tiers">
            <h5 className="staff-name">{i18n.t("amount_tiers")}</h5>
            <hr className="staff-policies-separator" />
            {renderTiers(appliedPolicies, TIER_KIND.AMOUNT)}
          </div>
        </div>
      </div>

      <div className="staff-policies-section">
        <div className="staff-policies-header">
          <h5 className="staff-name">{i18n.t("after_policies")}</h5>
          <hr className="staff-policies-separator" />
        </div>
        <div className="staff-policies-body after">
          {afterPoliciesCards.map((card) => (
            <div className="dashboard-card-summary-container">
              <div className="dashboard-card-summary-header">
                <h5 className="dashboard-card-summary-title">{card.title}</h5>
              </div>
              <div className="dashboard-card-summary-body">
                <p className="dashboard-card-summary-main-figure">
                  {card.isMoney
                    ? `${formatNumberAsCurrency(card.value)} VND`
                    : card.value
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default StaffPolicies;
