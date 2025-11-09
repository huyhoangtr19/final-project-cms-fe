import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { withTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import {
  listStatusSaleOrder,
  MONTH_CHART,
} from "../../constants/app.const";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ExcelJS from "exceljs";


import MyDropdown from "../../components/Common/MyDropdown";
import CardSummarySection from "./CardSummarySection";
import CustomerPredictionSection from "./CustomerPredictionSection";
import StaffSection from "./StaffSection";
import SalesSection from "./SalesSection";
import { Button } from "reactstrap";
import dashboardService from "../../services/dashboard.service";
import staffService from "../../services/staff.service";
import FileSaver from "file-saver";
import BlackBookSection from "./BlackBookSection";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const months = [
  i18n.t("jan"),
  i18n.t("feb"),
  i18n.t("mar"),
  i18n.t("apr"),
  i18n.t("may"),
  i18n.t("jun"),
  i18n.t("jul"),
  i18n.t("aug"),
  i18n.t("sep"),
  i18n.t("oct"),
  i18n.t("nov"),
  i18n.t("dec"),
];

const Dashboard = () => {
  document.title = "Dashboard | Actiwell System";

  const { operator, locationOperator } = useAppSelector(
    (state) => state.operator
  );
  const [location, setLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentTabActive, setCurrentTabActive] = useState("ai_customer_prediction");
  const [locationSel, setLocationSel] = useState([]);
  const [staffIds, setStaffIds] = useState([]);

  const getMonthsToCurrent = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear(); // local
    const currentMonth = now.getMonth(); // local, 0-indexed

    if (parseInt(selectedYear) === currentYear) {
      return MONTH_CHART.slice(0, currentMonth + 1);
    } else {
      return MONTH_CHART;
    }
  }, [selectedYear]);
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthsToCurrent.length);

  const staffSel = useMemo(() => {
    return staffIds.map((it) => it.value);
  }, [staffIds]);

  function formatDate(dateTimeString) {
    if (!dateTimeString) return "";
    return dateTimeString.slice(0, 10); // Assuming dateTimeString is in ISO format (YYYY-MM-DDTHH:mm:ss)
  }
  function formatTime(dateTimeString) {
    if (!dateTimeString) return "Không xác định";
    const date = new Date(dateTimeString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  //excel
  const getDataExcel = async () => {
    const workbook = new ExcelJS.Workbook();

    // Image URL (replace with your actual image URL)
    // console.log(operator.logo_path);
    // const imageUrl = operator?.logo_path || ""; // Example placeholder image

    try {
      const res = await dashboardService.getListStaffGrowthChartExcel({
        year: selectedYear,
        month: selectedMonth === 0 ? "" : selectedMonth,
        location_ids: selectedLocation === 0 ? locationSel : [selectedLocation],
        staff_ids: staffSel,
      });
      const responseData = res?.data || [];
      if (responseData.length === 0) {
        alert("No data available for the selected filters.");
        return;
      } else if (responseData.length > 0) {
        responseData.forEach((data) => {
          //
          //  const data = responseData[0];
          const worksheet = workbook.addWorksheet(
            data.staff?.last_name + " " + data.staff?.first_name || "Report"
          );

          const now = new Date();

          const hours = String(now.getHours()).padStart(2, "0");
          const minutes = String(now.getMinutes()).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
          const year = now.getFullYear();

          // Report Name and Time
          worksheet.mergeCells("A2:B2");
          worksheet.mergeCells("A3:B3");
          worksheet.mergeCells("A4:B4");
          worksheet.getCell("A2").value = "Report name";
          worksheet.getCell("A2").style.font = { bold: true, size: 16 };
          worksheet.getCell("A3").value = `Operator: ${operator.name} `;
          worksheet.getCell(
            "A4"
          ).value = `Time: ${hours}:${minutes} ${day}/${month}/${year}`;
          worksheet.columns = [
            { header: "", key: "stt", width: 5 },
            { header: "", key: "date", width: 20 },
            { header: "", key: "staffName", width: 20 },
            { header: "", key: "customerName", width: 20 },
            { header: "", key: "phone", width: 20 },
            { header: "", key: "packageName", width: 40 },
            { header: "", key: "saleOrder", width: 20 },
            { header: "", key: "status", width: 20 },
            { header: "", key: "typeConfirm", width: 20 },
            { header: "", key: "timeConfirm", width: 20 },
            { header: "", key: "unitPrice", width: 30 },
            { header: "", key: "session", width: 20 },
            { header: "", key: "sessionBonus", width: 20 },
            { header: "", key: "remainSession", width: 20 },
            { header: "", key: "amount", width: 20 },
            { header: "", key: "total", width: 15 },
            { header: "", key: "note", width: 20 }, // Assuming a "note" field might exist
          ];

          // let totalAmount = 0;
          // Add header row based on column keys
          worksheet.addRow({
            stt: "STT",
            date: "Ngày",
            staffName: "HLV",
            customerName: "Khách hàng",
            phone: "Số điện thoại",
            packageName: "Gói dịch vụ PT",
            saleOrder: "Mã đơn hàng",
            status: "Trạng thái",
            typeConfirm: "Kiểu xác nhận",
            timeConfirm: "Thời gian xác nhận",
            unitPrice: "Giá gói",
            session: "Số buổi chính",
            sessionBonus: "Số buổi tặng",
            remainSession: "Số buổi còn lại",
            amount: "Doanh số",
            total: "Tổng show",
            note: "Ghi chú",
          });
          worksheet.addRow({
            stt: "",
            date: "",
            staffName: "",
            customerName: "",
            phone: "",
            packageName: "",
            saleOrder: "",
            status: "",
            typeConfirm: "",
            timeConfirm: "",
            unitPrice: "",
            session: "",
            sessionBonus: "",
            remainSession: "",
            amount: data?.sessions_amount,
            total: data?.total_bookings,
            note: "",
          });
          data.bookings.forEach((item, index) => {
            worksheet.addRow({
              stt: index + 1,
              date: formatDate(item?.date),
              staffName: item?.staff?.last_name + " " + item?.staff?.first_name,
              customerName:
                item?.customer?.last_name + " " + item?.customer?.first_name,
              phone: item?.customer?.phone || "",
              packageName: item?.package?.name,
              saleOrder: item?.sale_order?.sale_order_number,
              status:
                listStatusSaleOrder.find(
                  (items) => items.value === item?.sale_order?.status
                )?.label || "",
              typeConfirm: "Khách hàng xác nhận",
              timeConfirm: formatTime(item.checked_in_at),
              unitPrice: item.package_price,
              session: item?.sessions
                ? item?.sessions || "0"
                : "Membership",
              sessionBonus: item?.sessions
                ? item?.bonus_sessions || 0
                : "Membership",
              remainSession: item?.sessions
                ? item?.booking_count < 0 ? 0 : item?.booking_count || 0
                : "Membership",
              amount: item.session_price,
              total: "",
              note: "",
            });
          });
          const currencyFormat = "#,##0\\ ₫";
          worksheet.getColumn("unitPrice").numFmt = currencyFormat;
          worksheet.getColumn("amount").numFmt = currencyFormat;
          worksheet.getRow(5).eachCell((cell) => {
            cell.style = {
              font: { bold: true, color: { argb: "FFFFFFFF" } }, // White text
              // backgroundColor: { argb: "008000" },
              alignment: { horizontal: "center" },
              fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF008000" }, // Green, with FF for full opacity
              },
            };
          });
          worksheet.getRow(6).eachCell((cell) => {
            cell.style = {
              font: { bold: true, color: { argb: "FFFF0000" } },
              alignment: { horizontal: "center" },
            };
          });
          worksheet.eachRow((row) => {
            row.eachCell((cell) => {
              cell.alignment = { horizontal: "center" };
            });
          });
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = "report.xlsx";
      FileSaver.saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        fileName
      );
      // };
    } catch (error) {
      console.error("Error adding image:", error);
    }
  };

  const getStaffForAll = async () => {
    try {
      const response = await staffService.getListTrainerForOperator({
        trainer: 1,
      });
      if (response.success) {
        const data = response.data.map((item) => {
          return {
            value: item.id,
            label: `${item.last_name} ${item.first_name}`,
          };
        });
        setStaffIds(data);
      }
    } catch (e) { }
  };

  useEffect(() => {
    getStaffForAll();
  }, []);
  useEffect(() => {
    setLocation(locationOperator);
    setLocationSel(locationOperator.map((item) => item.value));
  }, [locationOperator]);

  const listSection = [
    { name: i18n.t("ai_customer_prediction"), id: "ai_customer_prediction" },
    { name: i18n.t("trainer_kpi"), id: "trainer_kpi" },
    { name: i18n.t("sales_kpi"), id: "sales_kpi" },
    // { name: i18n.t("location_overview"), id: "location_overview" },
    { name: i18n.t("black_book"), id: "black_book" }
  ];

  const handleChangeSection = (section) => {
    setCurrentTabActive(section.id);
    const element = document.getElementById(section.id);
    if (!element) {
      return;
    }
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const listYear = () => {
    return Array.from(
      { length: 6 },
      (_, index) => new Date().getUTCFullYear() - 5 + index
    ).map((item) => {
      return { value: item, label: item };
    });
  };

  return (
    <React.Fragment>
      <div className="page-content tabs-container">
        <div className="dashboard-title">
          {i18n.t("welcome_back")} {operator?.name}
        </div>
        <div className="dashboard-tabs-header tabs-header-sticky">
          <div className="tabs-header flex-fill">
            <div className="d-flex">
              {listSection.map((section) => (
                <div
                  className={"tab-item " + (currentTabActive === section.id ? "active" : "")}
                  onClick={() => handleChangeSection(section)}
                >
                  {section.name}
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-tabs-selects">
            <Button
              className="secondary"
              outline
              onClick={getDataExcel}
              style={{ width: 'fit-content' }}
            >
              {/* <CSVLink
                        data={dataExport}
                        headers={headers}
                        filename={"my-ai-prediction.csv"}
                      >
                        Export CSV
                      </CSVLink> */}
              {i18n.t("export_excel")}
            </Button>
            <MyDropdown
              options={location}
              selected={selectedLocation}
              displayEmpty={true}
              setSelected={(e) => setSelectedLocation(e)}
              placeholder={i18n.t("all")}
            />
            <MyDropdown
              options={listYear()}
              selected={selectedYear}
              displayEmpty={false}
              setSelected={(e) => setSelectedYear(e)}
              placeholder={i18n.t("location")}
              disabled={!selectedYear}
            />
            <MyDropdown
              options={getMonthsToCurrent}
              selected={selectedMonth}
              displayEmpty={true}
              setSelected={(e) => setSelectedMonth(e)}
              placeholder={i18n.t("months")}
            />
          </div>
        </div>
        <div className="page-container tab-content dashboard-sections">
          <CardSummarySection
            id="ai_customer_prediction"
            location={selectedLocation}
            year={selectedYear}
            month={selectedMonth}
          />
          <CustomerPredictionSection
            location={selectedLocation}
            year={selectedYear}
            month={selectedMonth}
          />
          <StaffSection
            id="trainer_kpi"
            location={selectedLocation}
            year={selectedYear}
            month={selectedMonth}
          />
          <SalesSection
            id="sales_kpi"
            location={selectedLocation}
            year={selectedYear}
            month={selectedMonth}
          />
          <BlackBookSection 
            id="black_book"
            location={selectedLocation}
            year={selectedYear}
            month={selectedMonth}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  t: PropTypes.any,
  chartsData: PropTypes.any,
  onGetChartsData: PropTypes.func,
};

export default withTranslation()(Dashboard);
