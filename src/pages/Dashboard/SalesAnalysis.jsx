import { useEffect, useMemo, useState } from "react";
import dashboardService from "../../services/dashboard.service";
import { isEmpty } from "lodash";
import i18n from "../../i18n";
import DashboardCard from "./dashboardCard";
import ChartHoverLabel from "./chartHoverLabel";
import { ResponsivePie } from "@nivo/pie";
import { listKindPackage, KIND_PACKAGE, CHART_THEME } from "../../constants/app.const";

const SalesAnalysis = (props) => {
  const [data, setData] = useState([]);

  const colorMap = {
    [KIND_PACKAGE.MEMBERSHIP]: "#4A4B6C",
    [KIND_PACKAGE.GROUP]: "#c62f2a",
    [KIND_PACKAGE.PRIVATE]: "#f37b75",
    [KIND_PACKAGE.FIT]: "#595dd3",
  };

  const kindMap = listKindPackage.map(({ value, label }) => ({
    id: label,
    label,
    kind: value,
    color: colorMap[value] || "#ccc"
  }));


  const pieChartData = useMemo(() => {
    return kindMap.map(kindItem => {
      const entry = data.find(d => d.kind === kindItem.kind);
      return {
        ...kindItem,
        value: entry ? entry.count : 0
      };
    });
  }, [data]);

  const fetchData = async () => {
    const payload = {
      year: props.year,
      month: props.month || (new Date().getMonth() + 1)
    }
    if (props.location) {
      payload.location_ids = [props.location];
    }

    const response = await dashboardService.getListSalesPackagesKind(payload);
    if (response.success) {
      setData(response.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.location, props.month, props.year]);

  return (
    <DashboardCard
      title={i18n.t("sales_type_analysis")}
    >
      {!isEmpty(data) ? (
        <>
          <div className="sales-analysis-pie-container">
            <ResponsivePie
              data={pieChartData}
              margin={{ top: 20, right: 10, bottom: 20, left: 10 }}
              innerRadius={0.4}
              padAngle={0.6}
              cornerRadius={3}
              colors={{ datum: 'data.color' }}
              enableArcLinkLabels={false}
              activeOuterRadiusOffset={8}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#F4F1ED"
              arcLabel={d => {
                const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
                return `${((d.value / total) * 100).toFixed(1)}% (${d.value})`;
              }}

              tooltip={({ datum }) => (
                <ChartHoverLabel
                  label={datum.label}
                  value={datum.value}
                />
              )}
              theme={CHART_THEME}
            />
          </div>
          <div className="custom-chart-legend">
            {pieChartData.map(item => {
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
        </>
      ) : (
        <p style={{ margin: 'auto' }}>{i18n.t("there_are_no_data_exist")}</p>
      )}
    </DashboardCard>
  )
}

export default SalesAnalysis;