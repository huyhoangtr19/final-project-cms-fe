import { useEffect, useMemo, useState } from "react";
import i18n from "../../i18n";
import dashboardService from "../../services/dashboard.service";
import InlineSelector from "../../components/Common/InlineSelector";
import ModalMetrics from "./ModalMetrics";
import DashboardCard from "./dashboardCard";
import ModalCustomerPrediction from "./ModalCustomerPrediction";
import ChartHoverLabel from "./chartHoverLabel";
import "flatpickr/dist/themes/material_blue.css";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import MyPagination from "../../components/Common/Mypagination";
import { isEmpty } from "lodash";
import { CHART_THEME } from "../../constants/app.const";
import ClassOccupancy from "./ClassOccupancy";

const CustomerPredictionSection = (props) => {
  const [typeAI, setTypeAI] = useState("risk");
  const [isMetric, setIsMetric] = useState(false);
  const [isDetail, setIsDetail] = useState(false);
  const [startDate, setStartDate] = useState(convertToYYYYMMDD(new Date()));
  const [endDate, setEndDate] = useState(convertToYYYYMMDD(new Date()));
  const [data, setData] = useState({
    risk: [],
    riskCount: 0,
    riskRate: null,
    potential: [],
    potentialCount: 0,
    potentialRate: null,
  });
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const rowPerPage = 8;

  const pieChartData = useMemo(() => [
    {
      id: "potential",
      label: i18n.t("potential_customers"),
      value: data.potentialCount,
      color: "hsl(238, 23%, 29%)"
    },
    {
      id: "risk",
      label: i18n.t("risk_customers"),
      value: data.riskCount,
      color: "hsl(2, 65%, 47%)"
    }
  ], [data]);

  const barChartData = useMemo(() => {
    let barData = [];

    const sourceData = typeAI === "risk" ? data.risk : data.potential;

    barData = sourceData.map((item) => ({
      customerName: `${item.first_name} ${item.last_name}`,
      completionRate: item.completion_rate,
      cancelRate: item.cancel_rate,
      absenceRate: item.absence_rate
    }));

    return barData;
  }, [data, typeAI]);

  const barChartMetricConfig = {
    completionRate: {
      color: "#3A3B5C",
      label: i18n.t("completion"),
    },
    cancelRate: {
      color: "#C42E2A",
      label: i18n.t("cancellation"),
    },
    absenceRate: {
      color: "#f37b75ff",
      label: i18n.t("absence"),
    },
  };

  const predictionType = [
    {
      id: "risk",
      label: i18n.t("risk_customers"),
      onClick: () => { setTypeAI("risk") }
    },
    {
      id: "potential",
      label: i18n.t("potential_customers"),
      onClick: () => { setTypeAI("potential") }
    }
  ];

  function convertToYYYYMMDD(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const getListRisk = async () => {
    const payload = {
      type: "risk",
      keyword: "",
      start_date: startDate,
      end_date: endDate,
      limit: rowPerPage,
      page: page,
    };
    const res = await dashboardService.getListPrediction(payload);
    if (res.success) {
      return { risk: res.data, riskCount: res.meta.total };
    }
  };

  const getListPotential = async () => {
    const payload = {
      type: "potential",
      keyword: "",
      start_date: startDate,
      end_date: endDate,
      limit: rowPerPage,
      page: page,
    };
    const res = await dashboardService.getListPrediction(payload);
    if (res.success) {
      return { potential: res.data, potentialCount: res.meta.total };
    }
  };

  const fetchData = async () => {
    const [{ risk, riskCount }, { potential, potentialCount }] =
      await Promise.all([getListRisk(), getListPotential()]);
    setData((prev) => ({
      ...prev,
      risk: risk,
      riskCount: riskCount,
      potential: potential,
      potentialCount: potentialCount,
    }));

    setTotalRecord(typeAI === "risk" ? riskCount : potentialCount);
  };

  const getMetricPotential = async () => {
    const response = await dashboardService.getMetricPotential();
    if (response.success) {
      setData((prev) => ({
        ...prev,
        potentialRate: response.data,
      }));
    }
  };

  const getMetricRisk = async () => {
    const response = await dashboardService.getMetricRisk();
    if (response.success) {
      setData((prev) => ({
        ...prev,
        riskRate: response.data,
      }));
    }
  };

  function getFirstAndLastDate(month, year) {
    let firstDate, lastDate = new Date();
    if (!month) {
      firstDate = new Date(year, 0, 1);
      lastDate = new Date(year, lastDate.getMonth(), 31); // because lastDate.getMonth() is equal to the current month
    } else {
      firstDate = new Date(year, month - 1, 1);
      lastDate = new Date(year, month, 0); // day 0 of next month
    }

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    return {
      firstDate: formatDate(firstDate),
      lastDate: formatDate(lastDate)
    };
  }

  useEffect(() => {
    // Update time interval
    let { firstDate, lastDate } = getFirstAndLastDate(props.month, props.year);
    setStartDate(firstDate);
    setEndDate(lastDate);
  }, [props.location, props.month, props.year])


  useEffect(() => {
    if (startDate && endDate) {
      // Update data according to the new time interval
      fetchData();
      getMetricPotential();
      getMetricRisk();
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchData();
  }, [page, typeAI]);

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
    <div id={props.id ?? ""}>
      <div className="customer-prediction-header dashboard-scroll">
        <InlineSelector
          itemList={predictionType}
          active={typeAI}
        />
        <button
          className="d-flex gap-2 btn btn-primary"
          onClick={() => setIsMetric(true)}
        >
          <div>{i18n.t("configure_metrics")}</div>
          <i className="bx bx-cog"></i>
        </button>
      </div>

      <div className="customer-prediction-all">
        <div className="customer-prediction-cards">
          <DashboardCard
            title={i18n.t("risk_and_potential_customers")}
            onDetailsClick={() => setIsDetail(true)}
          >
            {(data.potentialCount || data.riskCount) ? (
              <>
                <div className="customer-prediction-pie-container">
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
                    onClick={(datum) => setTypeAI(datum.id)}
                    theme={CHART_THEME}
                  />
                </div>
                <div className="customer-prediction-pie-legend">
                  {pieChartData.map(item => {
                    return (
                      <div
                        key={item.id}
                        className="legend-container"
                        onClick={() => setTypeAI(item.id)}
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
          <DashboardCard
            title={typeAI === "risk"
              ? i18n.t("risk_customers")
              : i18n.t("potential_customers")
            }
            onDetailsClick={() => setIsDetail(true)}
          >
            {(!isEmpty(data.risk) || !isEmpty(data.potential)) ? (
              <>
                <div className="customer-prediction-bar-container">
                  <ResponsiveBar
                    data={barChartData}
                    keys={["completionRate", "cancelRate", "absenceRate"]}
                    indexBy="customerName"
                    layout="horizontal"
                    margin={{ top: 20, right: isMobile ? 10 : 150, bottom: 50, left: 120 }}
                    padding={0.3}
                    groupMode="stacked"
                    valueScale={{ type: "linear" }}
                    indexScale={{ type: "band", round: true }}
                    colors={({ id }) => barChartMetricConfig[id]?.color || "#999"}
                    borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: isMobile ? "" : i18n.t("percentage"),
                      legendPosition: "middle",
                      legendOffset: 32
                    }}
                    axisLeft={{
                      truncateTickAt: 19
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#F4F1ED"
                    legends={[
                      {
                        dataFrom: "keys",
                        data: Object.entries(barChartMetricConfig).map(([id, cfg]) => ({
                          id,
                          label: cfg.label,
                          color: cfg.color
                        })),
                        anchor: isMobile ? "bottom-left" : "bottom-right",
                        direction: isMobile ? "row" : "column",
                        translateY: isMobile ? 55 : 0,
                        translateX: isMobile ? -90 : 120,
                        itemsSpacing: 5,
                        itemWidth: isMobile ? 90 : 100,
                        itemHeight: 20,
                        itemDirection: "left-to-right",
                        symbolSize: isMobile ? 10 : 20,
                        justify: false
                      }
                    ]}
                    tooltip={({ id, value, indexValue }) => (
                      <ChartHoverLabel
                        label={`${barChartMetricConfig[id]?.label || id} (${indexValue})`}
                        value={`${value}%`}
                      />
                    )}
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    theme={CHART_THEME}
                  />
                </div>
                <MyPagination
                  page={page}
                  rowPerPage={rowPerPage}
                  totalRecord={totalRecord}
                  onClick={(p) => setPage(p)}
                  onPrevious={() => setPage((prev) => Math.max(prev - 1, 1))}
                  onNext={() =>
                    setPage((prev) =>
                      prev < Math.ceil(totalRecord / rowPerPage) ? prev + 1 : prev
                    )
                  }
                />
              </>
            ) : (
              <p style={{ margin: 'auto' }}>{i18n.t("there_are_no_data_exist")}</p>
            )}
          </DashboardCard>
        </div>
        <ClassOccupancy 
          year={props.year}
          month={props.month}
        />

        <ModalMetrics
          isOpen={isMetric}
          onClose={() => setIsMetric(false)}
          onSave={() => {
            if (typeAI === "risk") {
              getMetricRisk();
            } else {
              getMetricPotential();
            }
          }}
          isRisk={typeAI === "risk"}
          data={typeAI === "risk" ? data.riskRate : data.potentialRate}
        />
        <ModalCustomerPrediction
          isOpen={isDetail}
          onClose={() => setIsDetail(false)}
          isRisk={typeAI === "risk"}
          data={data}
          date={{ startDate: startDate, endDate: endDate }}
        />
      </div>
    </div>
  )
}

export default CustomerPredictionSection;