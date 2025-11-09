import { useEffect, useMemo, useState } from "react";
import { ResponsiveFunnel } from "@nivo/funnel";
import ChartHoverLabel from "./chartHoverLabel";
import i18n from "../../i18n";
import DashboardCard from "./dashboardCard";
import dashboardService from "../../services/dashboard.service";
import { CHART_THEME, listStatus } from "../../constants/app.const";

const SalePipeline = (props) => {
  const [data, setData] = useState([]);

  const COLORS = [
    "#3A3B5C", "#2563EB", "#EA580C", "#16A34A", "#DC2626"
  ];

  const fetchData = async () => {
    const payload = {
      year: props.year,
    };
    payload.month = props.month || (new Date().getMonth() + 1);

    const response = await dashboardService.getListCustomerStages(payload);
    if (response.success) {
      setData(response.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.year, props.month]);

  const chartData = useMemo(() => {
    return data
      .map((item) => ({
        id: item.id,
        label: listStatus[item.id].label,
        value: item.count,
        color: COLORS[item.id]
      }))
  }, [data]);

  return (
    <DashboardCard title={i18n.t("sales_pipeline")}>
      {chartData.length ? (
        <div className="customer-pipeline-container">
          <div className="funnel-container">
            <ResponsiveFunnel
              data={chartData}
              margin={{ top: 20, right: 5, bottom: 20, left: 5 }}
              colors={(d) => d.color}
              borderWidth={0}
              labelColor="#F4F1ED"
              interpolation="smooth"
              shapeBlending={0}
              spacing={8}
              beforeSeparatorLength={5}
              beforeSeparatorOffset={5}
              afterSeparatorLength={5}
              afterSeparatorOffset={5}
              currentPartSizeExtension={10}
              currentBorderWidth={0}
              tooltip={({ part }) => (
                <ChartHoverLabel
                  value={part.data.value}
                  label={listStatus[part.data.id].label}
                />
              )}
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

export default SalePipeline;
