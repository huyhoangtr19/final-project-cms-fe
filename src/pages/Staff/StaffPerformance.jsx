import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "../../hook/store.hook";
import { MONTH_CHART } from "../../constants/app.const";
import { Button, Input } from "reactstrap";
import i18n from "../../i18n";
import MyDropdown from "../../components/Common/MyDropdown";
import StaffPolicies from "./StaffPolicies";
import MyModalTemplate from "../../components/Common/MyModalTemplate";

const StaffPerformance = (props) => {
  const { _, locationOperator } = useAppSelector(
    (state) => state.operator
  );

  const staffPoliciesRef = useRef();

  const [location, setLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [startDateExcel, setStartDateExcel] = useState("");
  const [endDateExcel, setEndDateExcel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const listYear = () => {
    return Array.from(
      { length: 6 },
      (_, index) => new Date().getUTCFullYear() - 5 + index
    ).map((item) => {
      return { value: item, label: item };
    });
  };

  const handleExportExcel = () => {
    if (staffPoliciesRef.current) {
      staffPoliciesRef.current.exportToExcel();
    }
  };

  useEffect(() => {
    setLocation(locationOperator);
  }, [locationOperator]);

  // Helper local YYYY-MM-DD
  const toLocalYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    if (!selectedYear) return;

    const m = selectedMonth;
    let start, end;

    if (m && m >= 1 && m <= 12) {
      // Month set -> start and end of the month
      start = new Date(selectedYear, m - 1, 1);
      end = new Date(selectedYear, m, 0);
    } else {
      // No month set -> start and end of the year
      start = new Date(selectedYear, 0, 1);
      end = new Date(selectedYear, 11, 31);
    }

    const startStr = toLocalYMD(start);
    const endStr = toLocalYMD(end);

    setStartDate(startStr);
    setEndDate(endStr);
    setStartDateExcel(startStr);
    setEndDateExcel(endStr);
  }, [selectedYear, selectedMonth]);

  return (
    <div className="d-flex flex-column gap-3">
      <h5 className="staff-name">{`${props.staff?.last_name} ${props.staff?.first_name}`}</h5>
      <div className="d-flex gap-2 flex-wrap">
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
        <Button
          className="secondary"
          outline
          onClick={() => setIsOpenExport(true)}
          style={{ width: 'fit-content' }}
        >
          {i18n.t("export_excel")}
        </Button>
      </div>
      <StaffPolicies
        ref={staffPoliciesRef}
        staff={props.staff}
        startDate={startDate}
        endDate={endDate}
      />

      <MyModalTemplate
        isOpen={isOpenExport}
        onClose={() => setIsOpenExport(false)}
      >
        <div className="d-flex flex-column gap-3">
          <h3>{i18n.t("export_staff_performance")}</h3>
          <div className="d-flex flex-row gap-2 justify-content-between">
            <div className="d-flex flex-column align-items-start flex-fill">
              <label
                htmlFor="start_date"
                className="form-label"
              >
                {i18n.t("start_date")}
              </label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                placeholder={i18n.t("start_date")}
                required
                value={startDateExcel}
                onChange={(e) => {
                  setStartDateExcel(e.target.value);
                }}
              />
            </div>
            <div className="d-flex flex-column align-items-start flex-fill">
              <label
                htmlFor="end_date"
                className="form-label"
              >
                {i18n.t("end_date")}
              </label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                placeholder={i18n.t("end_date")}
                required
                value={endDateExcel}
                onChange={(e) => {
                  setEndDateExcel(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="d-flex align-items-end">
            <Button
              disabled={
                !startDateExcel ||
                !endDateExcel ||
                new Date(startDateExcel) >= new Date(endDateExcel)
              }
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => handleExportExcel()}
            >
              {i18n.t("export_excel")}
            </Button>
          </div>
        </div>
      </MyModalTemplate>
    </div>
  )
}

export default StaffPerformance;