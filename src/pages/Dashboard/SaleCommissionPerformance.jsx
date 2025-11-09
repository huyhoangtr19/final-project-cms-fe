import { useEffect, useMemo, useState } from "react";
import i18n from "../../i18n";
import dashboardService from "../../services/dashboard.service";
import MyDropdown from "../../components/Common/MyDropdown";
import DashboardCard from "./dashboardCard";
import { ResponsiveBar } from "@nivo/bar";
import ChartHoverLabel from "./chartHoverLabel";
import { CHART_THEME } from "../../constants/app.const";

const QUOTA_PACKAGES = 1000000;
const QUOTA_PRODUCTS = 80000;
const QUOTA_COMBINED = 5000000;

const CommissionPerformance = (props) => {
  const [data, setData] = useState([]);
  const viewModes = [
    { label: i18n.t("combined"), value: "combined" },
    { label: i18n.t("package"), value: "packages" },
    { label: i18n.t("product"), value: "products" }
  ]
  const [viewMode, setViewMode] = useState("combined");
  const [sortMode, setSortMode] = useState("desc") // "asc" | "desc"
  const quotaLegend = [
    { label: i18n.t("above_quota"), color: "#3A3B5C" },
    { label: i18n.t("under_quota"), color: "#C42E2A" }
  ]

  const fetchData = async () => {
    const payload = {
      year: props.year,
      staff_ids: []
    };
    payload.month = props.month || (new Date().getMonth() + 1);
    if (props.location) {
      payload.location_ids = [props.location];
    }

    const response = await dashboardService.getListStaffSalesRevenues(payload);
    if (response.success) {
      setData(response.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.year, props.month, props.location]);

  const barChartData = useMemo(() => {
    const trainerMap = {};

    data.forEach((item) => {
      item.staffs.forEach((staff) => {
        const key = staff.id;
        const fullName = `${staff.last_name} ${staff.first_name}`;
        const commissionPercent = parseFloat(staff.commission_percent) || 0;

        const revenuePackages = (item.packages ?? []).reduce((sum, p) => sum + p.amount, 0);
        const revenueProducts = (item.products ?? []).reduce((sum, p) => sum + p.amount, 0);

        if (!trainerMap[key]) {
          trainerMap[key] = {
            name: fullName,
            revenue_packages: 0,
            revenue_products: 0
          };
        }

        trainerMap[key].revenue_packages += (revenuePackages * commissionPercent) / 100;
        trainerMap[key].revenue_products += (revenueProducts * commissionPercent) / 100;
      });
    });

    return Object.values(trainerMap)
      .map(t => {
        const total = t.revenue_packages + t.revenue_products;
        let revenue = 0;
        let quota = 0;

        if (viewMode === "packages") {
          revenue = t.revenue_packages;
          quota = QUOTA_PACKAGES;
        } else if (viewMode === "products") {
          revenue = t.revenue_products;
          quota = QUOTA_PRODUCTS;
        } else {
          revenue = total;
          quota = QUOTA_COMBINED;
        }

        return {
          name: t.name,
          revenue: Math.round(revenue),
          color: revenue >= quota ? quotaLegend[0].color : quotaLegend[1].color
        };
      })
      .sort(
        (a, b) => sortMode === "asc"
          ? (a.revenue - b.revenue)
          : (b.revenue - a.revenue)
      );
  }, [data, viewMode, sortMode]);

  return (
    <DashboardCard
      title={i18n.t("sale_commission_performance")}
      additionalElement={
        <i
          className="fa fa-sort"
          style={{ cursor: 'pointer' }}
          onClick={() => setSortMode(sortMode === "asc" ? "desc" : "asc")}
        />
      }
    >
      {barChartData.length ? (
        <>
          <MyDropdown
            id="revenue_type"
            name="revenue_type"
            placeholder={i18n.t("revenue_type")}
            options={viewModes}
            selected={viewMode}
            setSelected={(e) => setViewMode(e)}
          />
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                height: 300,
                minWidth: '100%',
                width: `${Math.max(barChartData.length * 120, 100)}px`,
              }}
            >
              <ResponsiveBar
                data={barChartData}
                keys={["revenue"]}
                indexBy="name"
                layout="vertical"
                margin={{ top: 20, right: 0, bottom: 40, left: 50 }}
                padding={0.1}
                groupMode="grouped"
                colors={(bar) => bar.data.color}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legendPosition: "middle",
                  legendOffset: 32
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  format: (value) => {
                    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
                    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
                    return value.toString();
                  }
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="#fff"
                tooltip={({ value, indexValue }) => (
                  <ChartHoverLabel
                    value={`${value.toLocaleString("vi-VN", {
                      maximumFractionDigits: 2,
                    })} VND`}
                    label={indexValue}
                  />
                )}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                legends={[
                  {
                    dataFrom: "keys",
                    anchor: "bottom-left",
                    direction: "row",
                    justify: false,
                    translateX: -40,
                    translateY: 40,
                    itemsSpacing: 4,
                    itemWidth: 100,
                    itemHeight: 15,
                    itemDirection: "left-to-right",
                    symbolSize: 15,
                    symbolShape: "square",
                    data: quotaLegend,
                  }
                ]}
                valueFormat={(value) =>
                  value.toLocaleString("vi-VN", { maximumFractionDigits: 2 })
                }
                theme={CHART_THEME}
              />
            </div>
          </div>
        </>
      ) : (
        <p style={{ width: "max-content", margin: "auto" }}>{i18n.t("there_are_no_data_exist")}</p>
      )}
    </DashboardCard>
  );
};

export default CommissionPerformance;
