// Function Name : List Schedule Class
// Created date :  3/8/24             by :  NgVinh
// Updated date :  6/8/24             by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Col, Collapse, Input, Row, Table } from "reactstrap";

import MyDropdown from "../../../components/Common/MyDropdown";
import {
  listActive,
  listDayOfWeek,
  listFrequency,
} from "../../../constants/app.const";
import classService from "../../../services/class.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import operatorService from "../../../services/operator.service";
import IcPlus from "../../../assets/icon/IcPlus";
import MyPagination from "../../../components/Common/Mypagination";
import ModalScheduleDetail from "./ModalScheduleDetail";
import IcDot from "../../../assets/icon/IcDot";
import IcTrash from "../../../assets/icon/IcTrash";
import moment from "moment/moment";
import { convertMinutesToTimeString } from "../../../utils/app";
import MyModalTemplate from "../../../components/Common/MyModalTemplate";
import i18n from "../../../i18n";
import { debounce } from "lodash";

const ListScheduleClass = (props) => {
  const { id, name = "", serviceId = null } = props;
  const navigate = useNavigate();
  const [locationList, setLocationList] = useState([]);
  const [location, setLocation] = useState("");
  const [days, setDays] = useState("");
  const [start_time, setStart_time] = useState("");
  const [end_time, setEnd_time] = useState("");
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [active, setActive] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedProduct(schedule.map((item) => item.id));
    } else {
      setSelectedProduct([]);
    }
  };
  const handleCheckboxChange = (choose) => {
    setSelectedProduct((prevSelected) => {
      if (prevSelected.includes(choose)) {
        return prevSelected.filter((no) => no !== choose);
      } else {
        return [...prevSelected, choose];
      }
    });
  };
  const handleBack = () => {
    navigate("/class-info", { state: "class" });
  };
  const handleDeleteALocation = async (idActive) => {
    try {
      const res = await classService.deleteAScheduleForClass(idActive);
      if (res.success) {
        setDeleteId("");
        toast.success("Delete schedule success");
        handleGetListSchedule(id);
      }
    } catch (e) { }
  };
  const handleDeleteMulti = async () => {
    try {
      const res = await await classService.deleteScheduleForClassMulti(
        selectedProduct
      );
      if (res.success) {
        toast.success("Delete Multiple schedule successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListSchedule(id);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleUpdateStatus = async (idActive, active) => {
    try {
      const res = await classService.updateStatusClassSchedule(
        idActive,
        active === 1 ? 0 : 1
      );
      if (res.success) {
        toast.success(i18n.t("update_status_success"));
        handleGetListSchedule(id);
      }
    } catch (e) {
      console.log("e", e);
    }
  };
  const getListLocation = async () => {
    try {
      const res = await operatorService.getListLocationForOperator();
      if (res.success) {
        const resData = res.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setLocationList(resData);
      }
    } catch (e) { }
  };
  const handleGetListSchedule = async (id) => {
    try {
      const payload = {
        start_date: start_time,
        end_date: end_time,
        active: active,
        day: days,
        location: location,
        limit: 20,
        page: page,
      };
      const res = await classService.getListScheduleForClass(id, payload);
      setSchedule(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };
  const handleAddSchedule = () => {
    if (id) {
      setOpenModal(true);
      setSelectedScheduleDetail(null);
      setIsAdd(true);
    }
  };
  const handleRedirect = (choose, date) => {
    setIsAdd(false);
    setSelectedScheduleDetail(choose);
    setOpenModal(true);
    setSelectedDate(moment(date).format("yyyy-MM-DD"));
  };
  const timeConvert = (start, end) => {
    return `${convertMinutesToTimeString(start)} - ${convertMinutesToTimeString(
      end
    )}`;
  };
  const handleDeleteModal = () => {
    if (deleteId) {
      handleDeleteALocation(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };
  const handleResetFilter = () => {
    setActive("");
    setDays("");
    setLocation("");
    setStart_time("");
    setEnd_time("");
  };
  const titleModal = useMemo(() => {
    return deleteId
      ? "Are you sure you want to delete this schedule?"
      : "Are you sure you want to delete selected schedule?";
  }, [deleteId]);

  const isAllChecked = useMemo(() => {
    return schedule.length === selectedProduct.length;
  }, [selectedProduct, schedule]);
  useEffect(() => {
    getListLocation();
  }, []);
  useEffect(() => {
    if (id && locationList.length) {
      handleGetListSchedule(id);
    }
  }, [id, locationList, page, active, days, location, start_time, end_time]);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {
    if (!props.isActive || schedule.length === 0) return;

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
  }, [props.isActive, schedule]);

  return (
    <div>
      <div className="bg-white page-container">
        <div>
          <div className="filter-container">
            <div className="filter-header">
              <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
                <button
                  className="filter-clear"
                >
                  {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
                </button>
                <h5 className="filter-title">{i18n.t("schedule_list")}</h5>
              </div>
              <button
                className="filter-reset"
                onClick={handleResetFilter}
              >
                {i18n.t("reset")}
              </button>
            </div>
            <Collapse isOpen={filterOpen} className="filter-grid">
              <div className="filter-group">
                <label className="filter-label">{i18n.t("start_date")}</label>
                <Input
                  className="filter-select"
                  type="date"
                  placeholder={i18n.t("start_date")}
                  value={start_time}
                  onChange={(e) => {
                    setStart_time(e.target.value);
                  }}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("end_date")}</label>
                <Input
                  className="filter-select"
                  type="date"
                  placeholder={i18n.t("end_date")}
                  value={end_time}
                  onChange={(e) => {
                    setEnd_time(e.target.value);
                  }}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("status")}</label>
                <MyDropdown
                  options={listActive}
                  selected={active}
                  displayEmpty={true}
                  setSelected={(e) => setActive(e)}
                  placeholder={i18n.t("status")}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("location")}</label>
                <MyDropdown
                  options={locationList}
                  selected={location}
                  displayEmpty={true}
                  setSelected={(e) => setLocation(e)}
                  placeholder={i18n.t("location")}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("days")}</label>
                <MyDropdown
                  options={listDayOfWeek}
                  selected={days}
                  displayEmpty={true}
                  setSelected={(e) => setDays(e)}
                  placeholder={i18n.t("days")}
                />
              </div>
            </Collapse>
          </div>
          <div>
            <div className="action-buttons">
              <button
                className="btn btn-primary btn-block d-flex gap-1"
                disabled={!id}
                onClick={handleAddSchedule}
              >
                <IcPlus />
                <div className="" style={{ lineHeight: "17px" }}>
                  {i18n.t("add_new_schedule")}
                </div>
              </button>
              <Button
                color="danger"
                outline
                disabled={selectedProduct.length === 0}
                onClick={() => {
                  if (selectedProduct.length > 0) {
                    setIsOpen(true);
                  }
                }}
              >
                {i18n.t("delete_selected")}
              </Button>
              <Button
                color="success"
                className="btn-back"
                outline
                type="button"
                onClick={handleBack}
              >
                {i18n.t("back")}
              </Button>
            </div>
          </div>
          {schedule.length > 0 ? (
            <>
              <div className="before-table" ref={beforeTableRef}></div>
              <div className="table-container" ref={tableContainerRef}>
                <Table className="table mb-0">
                  <thead>
                    <tr>
                      <th>
                        <div onClick={handleCheckAll}>
                          <Input
                            type="checkbox"
                            checked={isAllChecked}
                            onChange={() => { }}
                          />
                        </div>
                      </th>
                      <th>{i18n.t('period')}</th>
                      <th>{i18n.t("frequency")}</th>
                      <th>{i18n.t("day_of_week")}</th>
                      <th>{i18n.t("date")}</th>
                      <th>{i18n.t("time")}</th>
                      <th>{i18n.t("trainer")}</th>
                      <th>{i18n.t("location")}</th>
                      <th style={{ width: i18n.language === "en" ? 130 : 195 }}>
                        {i18n.t("action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item, index) => (
                      <tr key={index} onClick={() => handleRedirect(item.id, item.date)}>
                        <td>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(item.id);
                            }}
                          >
                            <Input
                              type="checkbox"
                              checked={selectedProduct.includes(item.id)}
                              onChange={() => { }}
                            />
                          </div>
                        </td>
                        <td>{`${moment(item.schedule.start_date).format(
                          "DD/MM/yyyy"
                        )} - ${moment(item.schedule.end_date).format(
                          "DD/MM/yyyy"
                        )}`}</td>
                        <td>
                          {listFrequency.find(
                            (day) => day.value === item?.schedule?.frequency
                          )?.label || "-"}
                        </td>
                        <td>
                          {
                            listDayOfWeek.find((dow) => dow.value === item.day)
                              ?.label
                          }
                        </td>
                        <td>{`${moment(item.date).format("DD/MM/yyyy")}`}</td>
                        <td>{timeConvert(item.start_time, item.end_time)}</td>
                        <td>{item?.staff?.last_name + ' ' + item?.staff?.first_name}</td>
                        <td>{item.location.name}</td>
                        <td>
                          <div className="d-flex flex-row gap-1 justify-content-between align-items-center">
                            <div
                              className="px-1"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(item.id, item.active);
                              }}
                            >
                              {item.active === 0 ? (
                                <Badge color="none" className="badge-error">{i18n.t("inactive")}</Badge>
                              ) : (
                                <Badge color="none" className="badge-success">{i18n.t("active")}</Badge>
                              )}
                            </div>
                            <button
                              className="btn btn-delete-outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(true);
                                setDeleteId(item.id);
                                // handleDeleteALocation(location.id);
                              }}
                            >
                              {i18n.t("delete")}
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={() => handleRedirect(item.id, item.date)}
                            >
                              {i18n.t("update")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <MyPagination
                page={page}
                totalRecord={totalRecord}
                rowPerPage={20}
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
              <div>{i18n.t('no_schedule_exist')}</div>
            </div>
          )}
        </div>
      </div>
      {openModal && (
        <ModalScheduleDetail
          id={id}
          name={name}
          isOpen={openModal}
          serviceId={serviceId}
          onClose={() => setOpenModal(false)}
          onAdd={() => handleGetListSchedule(id)}
          isAdd={isAdd}
          scheduleInfo={selectedScheduleDetail}
          date={selectedDate}
        />
      )}
      <MyModalTemplate isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
        <div className="d-flex flex-column gap-3">
          <div>{titleModal}</div>
          <div
            className="d-flex flex-row justify-content-center"
            style={{ gap: 50 }}
          >
            <Button
              color="secondary"
              outline
              className="px-3"
              onClick={() => {
                setIsOpen(false);
                setDeleteId("");
              }}
            >
              {i18n.t("cancel")}
            </Button>

            <button
              className="btn btn-primary btn-block px-3 d-flex gap-1"
              onClick={handleDeleteModal}
            >
              <div className="">{i18n.t("delete")}</div>
            </button>
          </div>
        </div>
      </MyModalTemplate>
    </div>
  );
};
ListScheduleClass.propTypes = {
  id: PropTypes.number || null,
  type: PropTypes.string,
  name: PropTypes.string,
  serviceId: PropTypes.number || null,
};
export default ListScheduleClass;
