import { useEffect, useRef, useState } from "react";
import i18n from "../../i18n";
import DashboardCard from "./dashboardCard";
import dashboardService from "../../services/dashboard.service";
import { debounce } from "lodash";

const EndDayReport = (props) => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const payload = {
        year: props.year,
        month: props.month === 0 ? new Date().getMonth() + 1 : props.month
      };
      if (props.location_id) {
        payload.location_id = props.location_id;
      }
      const res = await dashboardService.getStaffOperationReport(payload);
      setData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  function getDayNumbersUntilToday() {
    const today = new Date();
    const dayList = [];
    for (let day = 1; day <= today.getDate(); day++) {
      dayList.push(day);
    }
    return dayList;
  }

  useEffect(() => {
    fetchData();
  }, [])

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (data && data.length === 0) return;

    const scrollContainer = tableContainerRef.current;
    if (!scrollContainer) return;

    const table = scrollContainer.querySelector('table');
    if (!table) return;

    const updateOverflow = () => {
      const isOverflowing = table.scrollWidth > scrollContainer.clientWidth;
      scrollContainer.style.overflowX = isOverflowing ? 'auto' : 'unset';
    };

    const debouncedUpdate = debounce(updateOverflow, 100); // 100ms debounce
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener("sidebar-toggled", debouncedUpdate);
    debouncedUpdate();

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener("sidebar-toggled", debouncedUpdate);
      debouncedUpdate.cancel();
    };
  }, [data]);

  return (
    <DashboardCard
      title={i18n.t("end_of_day_operation_report")}
    >
      {data && data.length > 0 ? (
        <div className="table-container" ref={tableContainerRef}>
          <table className="table table-dashboard mb-0">
            <thead>
              <tr>
                <th>{i18n.t("date")}</th>
                {data.map((staff, index) => (
                  <th key={index}>
                    {staff.last_name} {staff.first_name[0] || ""}{"."}
                  </th>
                ))}
                <th className="daily-total-header">{i18n.t("daily_total")}</th>
              </tr>
            </thead>
            <tbody>
              {getDayNumbersUntilToday().map((day, index) => {
                const dailyTotal = data.reduce((sum, staff) => {
                  return sum + (staff.revenues[day] || 0);
                }, 0);
                if (dailyTotal === 0) return null;

                return (
                  <tr key={index}>
                    <td>{day}</td>
                    {data.map((staff, idx) => (
                      <td key={idx}>
                        {staff.revenues[day]?.toLocaleString("vi-VN", {
                          maximumFractionDigits: 2
                        })}
                      </td>
                    ))}
                    <td className="daily-total">
                      {dailyTotal.toLocaleString("vi-VN", {
                        maximumFractionDigits: 2
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      ) : (
        <p style={{ width: "max-content", margin: "auto" }}>{i18n.t("there_are_no_data_exist")}</p>
      )}
    </DashboardCard>
  )
}

export default EndDayReport;