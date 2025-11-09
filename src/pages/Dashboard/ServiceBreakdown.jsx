import { useEffect, useMemo, useState } from "react";
import i18n from "../../i18n"
import dashboardService from "../../services/dashboard.service";
import DashboardCard from "./dashboardCard"
import { ResponsiveTreeMap } from "@nivo/treemap"
import { CHART_THEME } from "../../constants/app.const";
import { isEmpty } from "lodash";

const ServiceBreakdown = (props) => {
  const [data, setData] = useState([]);

  const chartData = useMemo(() => {
    const children = data.map((item) => {
      return {
        name: item.name,
        revenue: item.revenue,
      }
    })
    return {
      name: i18n.t("service"),
      children: children,
    }
  }, [data])

  const fetchData = async () => {
    const payload = {
      year: props.year,
    }
    if (props.month) {
      payload.month = props.month;
    }
    if (props.location) {
      payload.location_ids = [props.location];
    }

    const response = await dashboardService.getServiceRevenue(payload);
    if (response.success) {
      setData(response.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.location, props.month, props.year]);

  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1125);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 1125);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
  };
  const isMobile = useIsMobile();

  return (
    <DashboardCard title={i18n.t("service_breakdown")}>
      {!isEmpty(data) ? (
        <div className="dashboard-total-revenue-container">
          <ResponsiveTreeMap
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            identity="name"
            value="revenue"
            valueFormat=".02s"
            label={(node) => (
              isMobile ? `${node.formattedValue}` : `${node.id} - ${node.formattedValue}`
            )}
            labelSkipSize={30}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
            parentLabelPosition="left"
            parentLabelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
            theme={CHART_THEME}
          />
        </div>
      ) : (
        <p style={{ margin: 'auto' }}>{i18n.t("there_are_no_data_exist")}</p>
      )}
    </DashboardCard>
  )
}

export default ServiceBreakdown;