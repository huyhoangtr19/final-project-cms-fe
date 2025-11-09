import { useEffect, useMemo, useState } from "react";
import i18n from "../../i18n";
import classService from "../../services/class.service";
import DashboardCard from "./dashboardCard";
import { ResponsiveBar } from "@nivo/bar";
import ChartHoverLabel from "./chartHoverLabel";
import { CHART_THEME } from "../../constants/app.const";
import { Input } from "reactstrap";

const ClassOccupancy = (props) => {
  const [data, setData] = useState([]);
  const [sortMode, setSortMode] = useState("desc") // "asc" | "desc"
  const [startDate, setStartDate] = useState((new Date(Date.UTC(props.year, 0, 1))).toISOString())
  const [endDate, setEndDate] = useState((new Date(Date.UTC(props.year + 1, 0, 0))).toISOString())

  const fetchData = async () => {
    const payload = {
      start_date: startDate,
      end_date: endDate,
    };
    const response = await classService.getClassOccupancyRate(payload);
    if (response.success) {
      setData(response.data);
    }
  };

  const chartData = useMemo(() => {
    return data.map((item) => {
      return {
        name: item.name,
        rate: item.avg_occupancy_rate,
      }
    }).sort((a, b) =>
      sortMode === "asc" ? a.rate - b.rate : b.rate - a.rate
    );;
  }, [data, sortMode]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    if (props.month) {
      setStartDate((new Date(Date.UTC(props.year, props.month - 1, 1))).toISOString());
      setEndDate((new Date(Date.UTC(props.year, props.month, 0))).toISOString());
    } else {
      setStartDate((new Date(Date.UTC(props.year, 0, 1))).toISOString());
      setEndDate((new Date(Date.UTC(props.year + 1, 0, 0))).toISOString());
    }
  }, [props.year, props.month]);

  return (
    <DashboardCard
      title={i18n.t("class_occupancy")}
      additionalElement={
        <i
          className="fa fa-sort"
          style={{ cursor: 'pointer' }}
          onClick={() => setSortMode(sortMode === "asc" ? "desc" : "asc")}
        />
      }
    >
      <div className="d-flex gap-3">
        <div className="filter-group">
          <label className="filter-label">{i18n.t("start_date")}</label>
          <Input
            className="filter-select"
            type="date"
            placeholder={i18n.t("start_date")}
            value={startDate.split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">{i18n.t("end_date")}</label>
          <Input
            className="filter-select"
            type="date"
            placeholder={i18n.t("end_date")}
            value={endDate.split("T")[0]}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      {chartData.length > 0 ? (
        <>
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                height: 300,
                minWidth: '100%',
                width: `${Math.max(chartData.length * 120, 100)}px`,
              }}
            >
              <ResponsiveBar
                data={chartData}
                keys={['rate']}
                indexBy="name"
                layout="vertical"
                margin={{ top: 20, right: 0, bottom: 20, left: 45 }}
                padding={0.1}
                groupMode="stacked"
                colors="#3A3B5C"
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
                    value={`${value} %`}
                    label={`${indexValue}`}
                  />
                )}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
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

export default ClassOccupancy;
