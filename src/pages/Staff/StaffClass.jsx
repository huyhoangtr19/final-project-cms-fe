import { useEffect, useRef, useState } from "react";
import { Table } from "reactstrap";
import { debounce } from "lodash";
import { formatNumberAsCurrency } from "../../utils/app";
import classService from "../../services/class.service";
import i18n from "../../i18n";
import MyPagination from "../../components/Common/Mypagination";

const StaffClass = (props) => {
  const [data, setData] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    if (!props.staffId) return;
    try {
      const payload = {
        staff: props.staffId,
        limit: 10,
        page: page,
      }
      const response = await classService.getListClassScheduleTime(payload);
      if (response.success) {
        setData(response.data);
        setTotalRecord(response.meta.total);
        setTotalPage(response.meta.last_page);

        // Forward data to the parent component
        props.onDataLoaded?.(response.data);
      }
    } catch (e) {
      console.error("Error", e);
    }
  };

  function formatScheduleDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  };

  function formatScheduleDateTime(dateStr, startMinutes, endMinutes) {
    const baseDate = new Date(dateStr);
    const start = new Date(baseDate.getTime() + startMinutes * 60000);
    const end = new Date(baseDate.getTime() + endMinutes * 60000);
    const startTime = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const endTime = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    return `${startTime} - ${endTime}`;
  };

  useEffect(() => {
    fetchData();
  }, [props.staffId, page, props.onDataLoaded]);

  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {
    if (!props.isActive || data.length === 0) return;

    const scrollContainer = tableContainerRef.current;
    const table = scrollContainer.querySelector('table');
    const theads = table.querySelectorAll('thead');
    const beforeTable = beforeTableRef.current;

    if (!scrollContainer || !table) return;

    const updateOverflow = () => {
      const isOverflowing = table.scrollWidth > scrollContainer.clientWidth;
      scrollContainer.style.overflowX = isOverflowing ? 'auto' : 'unset';
      if (beforeTable) {
        beforeTable.style.position = isOverflowing ? 'relative' : 'sticky';
      }
      if (isOverflowing) {
        theads.forEach(el => {
          el.style.top = 0;
        });
      } else {
        theads.forEach(el => {
          el.style.top = '0.9375rem';
        });
      }
    };

    const debouncedUpdate = debounce(updateOverflow, 100); // 100ms debounce
    window.addEventListener('resize', updateOverflow);
    window.addEventListener("sidebar-toggled", debouncedUpdate);
    debouncedUpdate();

    return () => {
      window.removeEventListener('resize', updateOverflow);
      window.removeEventListener("sidebar-toggled", debouncedUpdate);
      debouncedUpdate.cancel();
    };
  }, [props.isActive, data]);

  return (
    <div>
      <h5 className="staff-name">{i18n.t("staff_class")}</h5>
      {data.length > 0 ? (
        <>
          <div className="before-table" ref={beforeTableRef}></div>
          <div className="table-container" ref={tableContainerRef}>
            <Table className="mb-0">
              <thead style={{ top: 0 }}>
                <tr>
                  <th>{i18n.t("class_name")}</th>
                  <th>{i18n.t("schedule_date")}</th>
                  <th>{i18n.t("schedule_time")}</th>
                  <th style={{ textAlign: 'right' }}>{i18n.t("teaching_commission")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((group) => {
                  return group.map((schedule, index) => (
                    <tr key={index}>
                      <td>{schedule.class.name}</td>
                      <td>{formatScheduleDate(schedule.date)}</td>
                      <td>
                        {formatScheduleDateTime(schedule.date, schedule.start_time, schedule.end_time)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {formatNumberAsCurrency(schedule.trainer_session_gains)}
                      </td>
                    </tr>
                  ))
                })}
              </tbody>
            </Table>
          </div>
          <MyPagination
            page={page}
            totalRecord={totalRecord}
            rowPerPage={10}
            totalPage={totalPage}
            onPrevious={() => {
              if (page > 1) {
                setPage(page - 1);
              }
            }}
            onNext={() => {
              if (page < totalPage) {
                setPage(page + 1);
              }
            }}
            onClick={(page) => {
              setPage(page);
            }}
          />
        </>
      ) : (
        <div className="d-flex justify-content-center d-flex align-items-center h-100">
          <div>{i18n.t('there_are_no_data_exist')}</div>
        </div>
      )}
    </div>
  )
}

export default StaffClass;