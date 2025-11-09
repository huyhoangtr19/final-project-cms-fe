import { useEffect, useMemo, useState } from "react";
import i18n from "../../i18n"
import dashboardService from "../../services/dashboard.service";
import DashboardCard from "./dashboardCard"
import { ResponsiveLine } from "@nivo/line"
import { CHART_THEME, MONTH_CHART } from "../../constants/app.const";
import { isEmpty } from "lodash";
import ChartHoverLabel from "./chartHoverLabel";

const SalesYearTotalRevenue = (props) => {
  const [data, setData] = useState({});

  const chartData = useMemo(() => {
    return [
      {
        id: i18n.t("total_revenue"),
        data: MONTH_CHART.map(month => ({
          x: month.label,
          y: data[month.value]?.revenue || 0
        })),
        color: "#3A3B5C"
      },
      {
        id: i18n.t("paid_revenue"),
        data: MONTH_CHART.map(month => ({
          x: month.label,
          y: data[month.value]?.paid_revenue || 0
        })),
        color: "#4CAF50"
      }
    ];
  }, [data]);


  const fetchData = async () => {
    const payload = {
      year: props.year,
    }
    if (props.location) {
      payload.location_id = props.location;
    }

    const response = await dashboardService.getYearTotalRevenue(payload);
    if (response.success) {
      setData(response.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.location, props.year]);

  return (
    <DashboardCard title={i18n.t("total_revenue")}>
      {!isEmpty(data) ? (
        <div className="dashboard-total-revenue-container">
          <ResponsiveLine
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 55, left: 50 }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
            colors={({ color }) => color}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'seriesColor' }}
            pointLabelYOffset={-12}
            enableTouchCrosshair={true}
            useMesh={true}
            axisLeft={{
              format: (value) => {
                if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
                if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
                return value.toString();
              }
            }}
            theme={CHART_THEME}
            enableArea={true}
            areaOpacity={0.05}
            lineWidth={2}
            tooltip={(datum) => (
              <ChartHoverLabel
                label={datum.point.data.xFormatted}
                value={`${datum.point.data.y.toLocaleString("vi-VN", {
                  maximumFractionDigits: 2
                })} VND`}
              />
            )}
            legends={[
              {
                anchor: 'bottom-left',
                direction: 'row',
                translateX: -40,
                translateY: 50,
                itemWidth: 100,
                itemHeight: 14,
                symbolShape: 'circle'
              }
            ]}
          />
        </div>
      ) : (
        <p style={{ margin: 'auto' }}>{i18n.t("there_are_no_data_exist")}</p>
      )}
    </DashboardCard>
  )
}

export default SalesYearTotalRevenue;