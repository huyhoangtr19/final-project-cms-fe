import { useEffect, useMemo, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import ChartHoverLabel from "./chartHoverLabel";
import i18n from "../../i18n";
import DashboardCard from "./dashboardCard";
import dashboardService from "../../services/dashboard.service";
import { CHART_THEME } from "../../constants/app.const";

const QUOTA = 50000;

const TrainerCommissionPerformance = (props) => {
  const [data, setData] = useState([]);
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

    const response = await dashboardService.getListStaffTrainerCommission(payload);
    if (response.success) {
      setData(response.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.year, props.month, props.location]);

  const chartData = useMemo(() => {
    return data
      .map(person => {
        const fullName = `${person.last_name} ${person.first_name}`;
        return {
          name: fullName,
          total_gain: person.total_gain
        };
      })
      .sort(
        (a, b) => sortMode === "asc"
          ? (a.total_gain - b.total_gain)
          : (b.total_gain - a.total_gain)
      );
  }, [data, sortMode]);

  return (
    <DashboardCard
      title={i18n.t("teaching_commission_performance")}
      additionalElement={
        <i
          className="fa fa-sort"
          style={{ cursor: 'pointer' }}
          onClick={() => setSortMode(sortMode === "asc" ? "desc" : "asc")}
        />
      }
    >
      {chartData.length ? (
        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              height: 300,
              minWidth: "100%",
              width: `${Math.max(chartData.length * 120, 100)}px`,
            }}
          >
            <ResponsiveBar
              data={chartData}
              keys={["total_gain"]}
              indexBy="name"
              layout="vertical"
              margin={{ top: 20, right: 0, bottom: 40, left: 45 }}
              padding={0.1}
              groupMode="grouped"
              colors={({ data }) =>
                data.total_gain >= QUOTA ? quotaLegend[0].color : quotaLegend[1].color
              }
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
                  translateX: -40,
                  translateY: 40,
                  itemsSpacing: 4,
                  itemWidth: 100,
                  itemHeight: 15,
                  itemDirection: "left-to-right",
                  symbolSize: 15,
                  symbolShape: "square",
                  data: quotaLegend
                }
              ]}
              valueFormat={(value) =>
                value.toLocaleString("vi-VN", { maximumFractionDigits: 2 })
              }
              theme={CHART_THEME}
            />
          </div>
        </div>
      ) : (
        <p style={{ width: "max-content", margin: "auto" }}>{i18n.t("there_are_no_data_exist")}</p>
      )}
    </DashboardCard>
  );
};

export default TrainerCommissionPerformance;
