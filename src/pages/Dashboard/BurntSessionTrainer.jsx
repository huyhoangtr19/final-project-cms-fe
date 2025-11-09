import { useEffect, useMemo, useState } from "react";
import i18n from "../../i18n";
import dashboardService from "../../services/dashboard.service";
import MyDropdown from "../../components/Common/MyDropdown";
import DashboardCard from "./dashboardCard";
import { ResponsiveBar } from "@nivo/bar";
import ChartHoverLabel from "./chartHoverLabel";
import { CHART_THEME } from "../../constants/app.const";

const QUOTA_GROUP = 1;
const QUOTA_PRIVATE = 1;
const QUOTA_COMBINED = 2;

const BurntSessionTrainer = (props) => {
  const [data, setData] = useState([]);
  const viewModes = [
    { label: i18n.t("combined"), value: "combined" },
    { label: i18n.t("group"), value: "group" },
    { label: i18n.t("private"), value: "private" }
  ]
  const [viewModeTrainer, setViewModeTrainer] = useState("combined");
  const [viewModePackage, setViewModePackage] = useState("combined");
  const [sortModeTrainer, setSortModeTrainer] = useState("desc") // "asc" | "desc"
  const [sortModePackage, setSortModePackage] = useState("desc") // "asc" | "desc"
  const labelAboveQuota = i18n.t("above_quota");
  const labelUnderQuota = i18n.t("under_quota");
  const quotaLegend = [
    { label: labelAboveQuota, color: "#3A3B5C" },
    { label: labelUnderQuota, color: "#C42E2A" }
  ];

  const quotaColorMap = Object.fromEntries(
    quotaLegend.map(({ label, color }) => [label, color])
  );

  const fetchData = async () => {
    const payload = {
      year: props.year,
      staff_ids: []
    };
    payload.month = props.month || (new Date().getMonth() + 1);
    if (props.location) {
      payload.location_ids = [props.location];
    }

    const response = await dashboardService.getListStaffBurntSessions(payload);
    if (response.success) {
      setData(response.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.year, props.month, props.location]);

  const quotaChartData = useMemo(() => {
    return data.map((staff) => {
      const fullName = `${staff.last_name} ${staff.first_name}`;
      let privateCount = 0;
      let groupCount = 0;

      staff.packages.forEach((pkg) => {
        privateCount += pkg.pt_session_count;
        groupCount += pkg.public_session_count;
      });

      let total = 0;
      let quota = 0;

      if (viewModeTrainer === "combined") {
        total = privateCount + groupCount;
        quota = QUOTA_COMBINED;
      } else if (viewModeTrainer === "private") {
        total = privateCount;
        quota = QUOTA_PRIVATE;
      } else if (viewModeTrainer === "group") {
        total = groupCount;
        quota = QUOTA_GROUP;
      }

      return {
        name: fullName,
        [total >= quota ? labelAboveQuota : labelUnderQuota]: total
      };
    }).sort((a, b) => {
      const aVal = Object.values(a).find((v) => typeof v === "number") || 0;
      const bVal = Object.values(b).find((v) => typeof v === "number") || 0;
      return sortModeTrainer === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [data, viewModeTrainer, sortModeTrainer]);

  const packageChartData = useMemo(() => {
    const chartData = [];

    data.forEach((staff) => {
      const fullName = `${staff.last_name} ${staff.first_name}`;
      const baseData = {
        name: fullName,
      };
      let totalSessions = 0;

      staff.packages.forEach((pkg) => {
        const key = pkg.name;

        let sessionCount = 0;

        if (viewModePackage === "combined") {
          sessionCount = pkg.pt_session_count + pkg.public_session_count;
        } else if (viewModePackage === "private") {
          sessionCount = pkg.pt_session_count;
        } else if (viewModePackage === "group") {
          sessionCount = pkg.public_session_count;
        }

        baseData[key] = (baseData[key] || 0) + sessionCount;
        totalSessions += sessionCount;
      });

      baseData.total = totalSessions;
      chartData.push(baseData);
    });

    chartData.sort((a, b) =>
      sortModePackage === "asc" ? a.total - b.total : b.total - a.total
    );

    return chartData;
  }, [data, viewModePackage, sortModePackage]);

  const packageChartKeys = useMemo(() => {
    const keysSet = new Set();

    data.forEach((staff) => {
      staff.packages.forEach((pkg) => {
        keysSet.add(pkg.name);
      });
    });

    return Array.from(keysSet);
  }, [data]);

  const packageColorMap = useMemo(() => {
    const colors = [
      "#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F",
      "#EDC948", "#B07AA1", "#FF9DA7", "#9C755F", "#9c9795"
    ];
    const map = {};
    let i = 0;

    packageChartKeys.forEach(key => {
      map[key] = colors[i % colors.length];
      i++;
    });

    return map;
  }, [packageChartKeys]);

  return (
    <>
      <DashboardCard
        title={i18n.t("burnt_session_by_trainer")}
        additionalElement={
          <i
            className="fa fa-sort"
            style={{ cursor: 'pointer' }}
            onClick={() => setSortModeTrainer(sortModeTrainer === "asc" ? "desc" : "asc")}
          />
        }
      >
        {quotaChartData.length ? (
          <>
            <MyDropdown
              id="revenue_type_quota"
              name="revenue_type_quota"
              placeholder={i18n.t("revenue_type")}
              options={viewModes}
              selected={viewModeTrainer}
              setSelected={(e) => setViewModeTrainer(e)}
            />
            <div style={{ overflowX: "auto" }}>
              <div
                style={{
                  height: 300,
                  minWidth: '100%',
                  width: `${Math.max(quotaChartData.length * 120, 100)}px`,
                }}
              >
                <ResponsiveBar
                  data={quotaChartData}
                  keys={[labelUnderQuota, labelAboveQuota]}
                  indexBy="name"
                  layout="vertical"
                  margin={{ top: 20, right: 0, bottom: 40, left: 45 }}
                  padding={0.1}
                  groupMode="stacked"
                  colors={(bar) => quotaColorMap[bar.id]}
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
                    tickRotation: 0
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor="#fff"
                  tooltip={({ value, indexValue }) => (
                    <ChartHoverLabel
                      value={value}
                      label={`${indexValue}`}
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
                  theme={CHART_THEME}
                />
              </div>
            </div>
          </>
        ) : (
          <p style={{ width: "max-content", margin: "auto" }}>{i18n.t("there_are_no_data_exist")}</p>
        )}
      </DashboardCard>
      <DashboardCard
        title={i18n.t("trainer_burnt_session_by_package")}
        additionalElement={
          <i
            className="fa fa-sort"
            style={{ cursor: 'pointer' }}
            onClick={() => setSortModePackage(sortModePackage === "asc" ? "desc" : "asc")}
          />
        }
        style={{ height: 400 }}
      >
        {packageChartData.length ? (
          <div className="dashboard-burnt-session-container">
            <div className="dashboard-burnt-session-trainer-up">
              <MyDropdown
                id="session_mode"
                name="session_mode"
                placeholder={i18n.t("session_mode")}
                options={viewModes}
                selected={viewModePackage}
                setSelected={(e) => setViewModePackage(e)}
              />
              <div style={{ overflowX: "auto", height: '100%' }}>
                <div
                  style={{
                    height: '100%',
                    minWidth: '100%',
                    width: `${Math.max(packageChartData.length * 120, 100)}px`,
                  }}
                >
                  <ResponsiveBar
                    data={packageChartData}
                    keys={packageChartKeys}
                    indexBy="name"
                    layout="vertical"
                    margin={{ top: 20, right: 0, bottom: 30, left: 45 }}
                    padding={0.1}
                    groupMode="stacked"
                    colors={(bar) => packageColorMap[bar.id]}
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
                    tooltip={({ value, id }) => (
                      <ChartHoverLabel
                        value={value}
                        label={id}
                      />
                    )}
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    theme={CHART_THEME}
                  />
                </div>
              </div>
            </div>
            <div className="custom-chart-legend">
              {packageChartKeys.map(item => (
                <div
                  key={item}
                  className="legend-container"
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: packageColorMap[item],
                      borderRadius: "50%",
                    }}
                  />
                  <div>
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ width: "max-content", margin: "auto" }}>{i18n.t("there_are_no_data_exist")}</p>
        )}
      </DashboardCard>
    </>
  );
};

export default BurntSessionTrainer;
