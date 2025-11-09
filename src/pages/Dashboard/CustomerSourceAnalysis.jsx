import { useEffect, useMemo, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import ChartHoverLabel from "./chartHoverLabel";
import i18n from "../../i18n";
import DashboardCard from "./dashboardCard";
import dashboardService from "../../services/dashboard.service";
import { CHART_THEME } from "../../constants/app.const";

const CustomerSourceAnalysis = (props) => {
  const [data, setData] = useState([]);
  const [sortMode, setSortMode] = useState("desc") // "asc" | "desc"

  const COLORS = [
    "#3A3B5C", "#C42E2A", "#5C9EAD", "#E1BC29", "#4C8C31",
    "#8B5FBF", "#E15554", "#E1BC29", "#3BB273", "#7768AE"
  ];

  const fetchData = async () => {
    const payload = {
      year: props.year,
    };
    payload.month = props.month || (new Date().getMonth() + 1);

    const response = await dashboardService.getListCustomerMarketSegments(payload);
    if (response.success) {
      setData(response.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.year, props.month]);

  const chartData = useMemo(() => {
    return data
      .map((item, index) => ({
        id: item.id,
        label: item.name,
        count: item.count,
        color: COLORS[index % COLORS.length]
      }))
      .sort(
        (a, b) => sortMode === "asc"
          ? (a.count - b.count)
          : (b.count - a.count)
      );
  }, [data, sortMode]);

  return (
    <DashboardCard
      title={i18n.t("guest_source_analysis")}
      additionalElement={
        <i
          className="fa fa-sort"
          style={{ cursor: 'pointer' }}
          onClick={() => setSortMode(sortMode === "asc" ? "desc" : "asc")}
        />
      }
    >
      {chartData.length ? (
        <div className="customer-source-analysis-container">
          <div
            style={{
              minWidth: "100%",
              width: `${Math.max(chartData.length * 120, 100)}px`,
              height: '100%'
            }}
          >
            <ResponsiveBar
              data={chartData}
              keys={["count"]}
              indexBy="label"
              layout="vertical"
              margin={{ top: 20, right: 0, bottom: 10, left: 45 }}
              padding={0.1}
              groupMode="stacked"
              colors={({ data }) => data.color}
              borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legendPosition: "middle",
                legendOffset: 32,
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
                  value={value}
                  label={indexValue}
                />
              )}
              animate={true}
              motionStiffness={90}
              motionDamping={15}
              valueFormat={(value) =>
                value.toLocaleString("vi-VN", { maximumFractionDigits: 2 })
              }
              theme={CHART_THEME}
            />
          </div>
          <div className="custom-chart-legend">
            {chartData.map(item => {
              return (
                <div
                  key={item.id}
                  className="legend-container"
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: item.color,
                      borderRadius: "50%",
                    }}
                  />
                  <div>
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p style={{ width: "max-content", margin: "auto" }}>{i18n.t("there_are_no_data_exist")}</p>
      )}
    </DashboardCard>
  );
};

export default CustomerSourceAnalysis;
