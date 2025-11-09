import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Col, Collapse, Badge, Button } from "reactstrap";
import MyDropdown from "../../../components/Common/MyDropdown";
import classService from "../../../services/class.service";
import InputSearch from "../../../components/Common/InputSearch";
import operatorService from "../../../services/operator.service";
import Spinners from "../../../components/Common/Spinner";
import moment from "moment/moment";
import { convertToUtcString, formatDate } from "../../../utils/app";
import {
  listStatusClassScheduleTime,
  listTypeClass,
} from "../../../constants/app.const";
import staffService from "../../../services/staff.service";
import i18n from "../../../i18n";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import { useAppSelector } from "../../../hook/store.hook";
import listPlugin from "@fullcalendar/list";
import BootstrapTheme from "@fullcalendar/bootstrap";
import IcPlus from "../../../assets/icon/IcPlus";
import ModalScheduleDetail from "./ModalScheduleDetail";
import ModalAddBooking from "./ModalAddBooking";
import MyDropdownColor from "../../../components/Common/MyDropdownColor";
import allLocales from "@fullcalendar/core/locales-all";
import { detectBrowser } from "../../../utils/app";

const ListScheduleInfo = (prop) => {
  const calendarRef = useRef(null);

  const getCalendarApi = () => {
    return calendarRef?.current?.getApi();
  };
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedClassSchedule, setSelectedClassSchedule] = useState(null);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [isClassModal, setIsClassModal] = useState(false);
  const [dataBooking, setDataBooking] = useState(null);
  const [idOpenMol, setIdOpenMol] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [isList, setIsList] = useState("month");
  const [statusSearch, setStatusSearch] = useState("");
  const [isChange, setIsChange] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [typeClass, setTypeClass] = useState("");
  const [listLocation, setListLocation] = useState([]);
  const [listTrainer, setListTrainer] = useState([]);
  const [trainer, setTrainer] = useState("");
  const [location, setLocation] = useState("");
  const [timeCalendar, setTimeCalendar] = useState({
    start: moment().format("YYYY-MM-DD"),
    end: moment().add(1, "month").format("YYYY-MM-DD"),
  });
  const [listCalendar, setListCalendar] = useState([]);
  const [listClass, setListClass] = useState([]);
  const [listStaff, setListStaff] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [chainLoad, triggerChainLoad] = useState(0);
  const [buttonsCopy, setButtonsCopy] = useState("");
  const rootRef = useRef(null);

  const handleAddNewBooking = (item) => {
    setIsClassModal(true);
    setDataBooking(item);
  };

  const getStatus = (status) => {
    if (!status) {
      return {
        value: 0,
        label: i18n.t("available"),
        color: "#1D39C4",
        bg: "primary",
        badge: "info"
      };
    }
    const statusObj = listStatusClassScheduleTime.find(
      (item) => item.value === status
    );
    return statusObj;
  };
  const handleUpdateStatus = async (id) => {
    try {
      const res = await classService.updateStatusClassSchedule(id);
      if (res.success) {
        handleGetListClassSchedule();
      }
    } catch (e) {
      console.log("e", e);
    }
  };
  const getListClass = async () => {
    const payload = {
      limit: -1,
    };
    const res = await classService.getListClass(payload);
    const temp = res.data.map((item) => {
      return {
        id: item.id,
        title: item.name,
      };
    });
    setListClass(temp);
  };

  const handleAddSchedule = () => {
    setOpenModal(true);
  };

  const handleGetListClassSchedule = async () => {
    try {
      const payloadCalendar = {
        keyword: searchName,
        location: location,
        type_class: typeClass,
        staff: trainer,
        status: statusSearch,
        start_date: timeCalendar.start,
        end_date: timeCalendar.end,
      };
      console.log("payloadCalendar", payloadCalendar);

      // const res = await classService.getListClassScheduleTime(payload);
      // setInfoList(res.data);
      // setTotalRecord(res.meta.total);
      // setTotalPage(res.meta.last_page);

      const resCalendar = await classService.getListClassScheduleCalender(
        payloadCalendar
      );
      const staffList = {};

      resCalendar.data.forEach((item) => {
        const staffId = item.staff.id;
        if (!staffList[staffId]) {
          staffList[staffId] = {
            id: staffId,
            title: item?.staff?.last_name + " " + item?.staff?.first_name,
          };
        }
      });

      const staffArray = Object.values(staffList);
      setListStaff(staffArray);
      const temp = resCalendar.data.map((item) => {
        return {
          ...item,
          resourceId: isList === "day" ? item?.staff?.id : item?.class?.id,
          title: `${item?.staff?.last_name} ${item?.staff?.first_name}`,
          start: convertToUtcString(item?.date, item?.start_time),
          end: convertToUtcString(item?.date, item?.end_time),
          className:
            isList === "list"
              ? "bg-white text-black"
              : `bg-${getStatus(item?.status).bg} text-white`,
        };
      });
      setListCalendar(temp);
      // console.log('as',res)
    } catch (error) {
      console.log("error:", error);
    } finally {
      setLoading(true);
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
        setListLocation(resData);
      }
    } catch (e) {
      console.log("error", e);
    }
  };
  const getListTrainer = async () => {
    try {
      const response = await staffService.getListTrainerForOperator({
        trainer: 1,
      });
      if (response.success) {
        setListTrainer(
          response.data.map((item) => {
            return {
              value: item.id,
              label: `${item.last_name} ${item.first_name}`,
            };
          })
        );
      }
    } catch (e) {
      console.log("error:", e);
    }
  };
  const formatTimeRange = (startTime, endTime) => {
    // Parse the start and end times into Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Format the times using the 24-hour clock
    const formattedStartTime = startDate.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });
    const formattedEndTime = endDate.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });

    return `${formattedStartTime} - ${formattedEndTime}`;
  };

  const handleResetFilter = () => {
    setSearchName("");
    setLocation("");
    setTypeClass("");
    setTrainer("");
  };

  const isMobile = useMemo(() => {
    return window.innerWidth < 768;
  }, []);

  const canAddBooking = useMemo(() => {
    return permissionUser.includes("booking:create");
  }, [permissionUser]);
  const canAddSchedule = useMemo(() => {
    return permissionUser.includes("class:create_schedule");
  }, [permissionUser]);

  useEffect(() => {
    getListClass();
    handleGetListClassSchedule();
    getListLocation();
    getListTrainer();
    // const headerToolbar = document?.querySelector(".fc-monthOfData-button");
    // headerToolbar.classList.add("highlighted-toolbar");
  }, []);
  useEffect(() => {
    handleGetListClassSchedule();
  }, [searchName, location, typeClass, trainer, timeCalendar, statusSearch, isList]);

  const handleDateClick = (info) => {
    if (idOpenMol.toString() !== info.toString()) {
      setIdOpenMol(info);
    } else {
      setIdOpenMol(0);
    }
  };
  const handleOpenDetail = (item) => {
    setSelectedClassSchedule({
      id: item.class.id, //id class
      name: item.class.name, // name class
      serviceId: item.class.service_id, // id service
      data: item.id, //class schedule class id
    });
    setOpenDetail(true);
  };

  const customButtons = {
    listOfData: {
      text: i18n.t("list"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          calendarApi.changeView("listWeek");
          setIsList("list");
          setIsChange((prev) => !prev);
          const previousHeaderToolbar = document?.querySelector(
            ".highlighted-toolbar"
          );
          if (previousHeaderToolbar) {
            previousHeaderToolbar.classList.remove("highlighted-toolbar");
          }
          const headerToolbar = document?.querySelector(
            ".fc-listOfData-button"
          );
          headerToolbar.classList.add("highlighted-toolbar");
          setMenuOpen(false);
        } catch (e) {
          console.log("easd", e);
        }
      },
    },
    monthOfData: {
      text: i18n.t("months"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          setIsList("month");
          setIsChange((prev) => !prev);
          calendarApi.changeView("monthOfData");
          const previousHeaderToolbar = document?.querySelector(
            ".highlighted-toolbar"
          );
          if (previousHeaderToolbar) {
            previousHeaderToolbar.classList.remove("highlighted-toolbar");
          }
          const headerToolbar = document?.querySelector(
            ".fc-monthOfData-button"
          );
          headerToolbar.classList.add("highlighted-toolbar");
          setMenuOpen(false);
        } catch (e) {
          console.log("easd", e);
        }
      },
    },
    weekOfData: {
      text: i18n.t("weeks"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          // calendarApi.changeView("resourceTimelineWeek");
          calendarApi.changeView("weekOfData");
          setIsList("week");
          setIsChange((prev) => !prev);
          const previousHeaderToolbar = document?.querySelector(
            ".highlighted-toolbar"
          );
          if (previousHeaderToolbar) {
            previousHeaderToolbar.classList.remove("highlighted-toolbar");
          }
          const headerToolbar = document?.querySelector(
            ".fc-weekOfData-button"
          );
          headerToolbar.classList.add("highlighted-toolbar");
          setMenuOpen(false);
        } catch (e) {
          console.log("easd", e);
        }
      },
    },
    dayOfData: {
      text: i18n.t("days"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          calendarApi.changeView("resourceTimeGridDay");
          setIsList("day");
          setIsChange((prev) => !prev);
          const previousHeaderToolbar = document?.querySelector(
            ".highlighted-toolbar"
          );
          if (previousHeaderToolbar) {
            previousHeaderToolbar.classList.remove("highlighted-toolbar");
          }
          const headerToolbar = document?.querySelector(".fc-dayOfData-button");
          headerToolbar.classList.add("highlighted-toolbar");
          setMenuOpen(false);
        } catch (e) {
          console.log("easd", e);
        }
      },
    },
    todayOfData: {
      text: i18n.t("today"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          calendarApi.today();
          setIsChange((prev) => !prev);
        } catch (e) {
          console.log("easd", e);
        }
      },
    },
    prevOfData: {
      text: i18n.t("prev"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          calendarApi.prev();
          setIsChange((prev) => !prev);
        } catch (e) {
          console.log("easd", e);
        }
      },
    },
    nextOfData: {
      text: i18n.t("next"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          calendarApi.next();
          setIsChange((prev) => !prev);
        } catch (e) {
          console.log("easd", e);
        }
      },
    },
    AddNewBooking: {
      text: i18n.t(""),
      click: () => { handleAddSchedule() }
    },
  };


  const reactRootRefAdd = useRef(null);

  useEffect(() => {
    const toolbarEl = document.querySelector(".fc-AddNewBooking-button");

    if (toolbarEl) {
      toolbarEl.style.all = "unset";
      if (!toolbarEl.querySelector("#Add-N-B-button")) {
        const placeholder = document.createElement("div");
        placeholder.id = "Add-N-B-button";
        toolbarEl.innerHTML = "";
        toolbarEl.appendChild(placeholder);

        // React 18+ rendering
        reactRootRefAdd.current = createRoot(placeholder);
        reactRootRefAdd.current.render(
          <div className="btn btn-secondary">
            <IcPlus color="white" />
            <div className="" style={{ lineHeight: "17px" }}>
              {i18n.t("add_new_schedule")}
            </div>
          </div>
        );
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
  }, [isChange]);

  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 725;
    if (!isMobile || !chainLoad) return;

    const secondDiv = document.querySelector('.fc-header-toolbar .fc-toolbar-chunk:nth-of-type(2)');
    if (!secondDiv) return;

    if (!rootRef.current) {
      rootRef.current = createRoot(secondDiv);
    }

    const newDiv = document.createElement("div");
    buttonsCopy.forEach((el) => {
      newDiv.appendChild(el.cloneNode(true));
    });

    const preloadButtons = () => {
      const container = document.getElementById("button-container-mob");
      if (container) {
        container.innerHTML = "";
        buttonsCopy.forEach(btn => {
          const cloneBtn = btn;
          cloneBtn.style.display = "block";
          container.appendChild(cloneBtn);
        });
      }
    };

    preloadButtons();

    rootRef.current.render(
      <div style={{ position: "relative", display: "inline-block", margin: "0" }}>
        <button className="btn-mob-menu gap-2" onClick={() => {

          preloadButtons();
          setMenuOpen(prev => !prev);
        }}>
          <i className="fa fa-bars"></i> {i18n.t("view")}
        </button>

        <div className="button-wrapper-mob" style={menuOpen ? { display: "block" } : { display: "none" }}>
          <div id="button-container-mob" />
        </div>
      </div>
    );
  }, [menuOpen, chainLoad]);


  const updateToolbar = useCallback(() => {
    setMenuOpen(false);
    const secondDiv = document.querySelector('.fc-header-toolbar .fc-toolbar-chunk:nth-of-type(2)');
    if (!secondDiv) return;

    triggerChainLoad(chainLoad + 1);

    const buttons = secondDiv.querySelectorAll(".btn");
    if (!buttonsCopy && buttons)
      setButtonsCopy(buttons);

    const isMobile = window.innerWidth < 725;

    if (!isMobile) {
      secondDiv.classList.add("view-switcher")
      buttons.forEach(b => {
        b.classList.remove("btn");
        b.classList.remove("btn-primary");
        b.classList.add("view-btn");
        b.style.margin = "0rem";
      });
    } else {
      buttons.forEach(b => {
        b.style.display = "none";
      })
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 725) {
      const secondDiv = document.querySelector('.fc-header-toolbar .fc-toolbar-chunk:nth-of-type(2)');
      if (secondDiv === null) return
      secondDiv.classList.add("view-switcher");
      const buttons = secondDiv.querySelectorAll(".btn");
      buttons.forEach(b => {
        b.classList.remove("btn");
        b.classList.remove("btn-primary");
        b.classList.add("view-btn");
        b.style.margin = "0rem";
      });
    }
  }, [isList]);


  return (
    <div>
      <div className={"page-content m-0 bg-white " + detectBrowser()}>
        <div className="filter-container" style={{ marginBottom: "0" }}>
          <div className="filter-header">
            <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
              <button
                className="filter-clear"
              >
                {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
              </button>
              <h5 className="filter-title">{i18n.t("class_schedule")}</h5>
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
              <label className="filter-label">{i18n.t("class_name")}</label>
              <InputSearch
                value={searchName}
                onChange={(e) => setSearchName(e)}
                placeholder={i18n.t("class_name")}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">{i18n.t("location")}</label>
              <MyDropdown
                options={listLocation}
                selected={location}
                displayEmpty={true}
                setSelected={(e) => setLocation(e)}
                placeholder={i18n.t("location")}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">{i18n.t("class_type")}</label>
              <MyDropdown
                options={listTypeClass}
                selected={typeClass}
                displayEmpty={true}
                setSelected={(e) => setTypeClass(e)}
                placeholder={i18n.t("class_type")}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">{i18n.t("trainer")}</label>
              <MyDropdown
                options={listTrainer}
                selected={trainer}
                displayEmpty={true}
                setSelected={(e) => setTrainer(e)}
                placeholder={i18n.t("trainer")}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">{i18n.t("status")}</label>
              <MyDropdownColor
                options={listStatusClassScheduleTime}
                selected={statusSearch}
                displayEmpty={true}
                setSelected={(e) => setStatusSearch(e)}
                placeholder={i18n.t("status")}
              />
            </div>
          </Collapse>
        </div>
        <div style={{ display: "none" }}>
          <Col md={2} xs={6}>
            <button
              className="btn btn-primary btn-block px-2 d-flex gap-1 w-100"
              disabled={false}
              onClick={handleAddSchedule}
              style={{ display: canAddSchedule ? "block" : "none" }}
            >
              <IcPlus />
              <div className="" style={{ lineHeight: "17px" }}>
                {i18n.t("add_new_schedule")}
              </div>
            </button>
          </Col>
        </div>

        <div
          style={{ position: "relative" }}
        >
          {isLoading && (
            <div
              style={{
                position: "absolute",
                backgroundColor: "#fff",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 999999,
              }}
            >
              <Spinners setLoading={setLoading} />
            </div>
          )}
          <FullCalendar
            viewClassNames={"class-calendar"}
            ref={calendarRef}
            plugins={[
              BootstrapTheme,
              dayGridPlugin,
              resourceTimelinePlugin,
              resourceTimeGridPlugin,
              listPlugin,
            ]}
            slotMinWidth={150}
            locale={i18n.language === "vi" ? "vi" : "en"}
            locales={allLocales}
            firstDay={1}
            viewDidMount={updateToolbar}
            height={"auto"}
            resourceAreaWidth={isMobile ? "30%" : "10%"}
            initialDate={new Date()}
            nowIndicator
            // contentHeight={"10%"}
            initialView="monthOfData"
            headerToolbar={{
              start: "prevOfData,title,nextOfData todayOfData",
              center: "monthOfData weekOfData dayOfData listOfData",
              end: "AddNewBooking",
            }}
            views={{
              listOfData: {
                type: "listWeek",
                buttonText: "List",
              },
              monthOfData: {
                type: "resourceTimeline",
                duration: { days: 30 },
                buttonText: "Month",
              },
              weekOfData: {
                type: 'timeGridWeek',
                duration: { days: 7 },
                buttonText: "Week",
              },
              dayOfData: {
                type: "resourceTimeGridDay",
                buttonText: "Day",
              },
              todayOfData: {
                type: "today",
                buttonText: "Today",
              },
              prevOfData: {
                type: "prev",
                buttonText: "Prev",
              },
              nextOfData: {
                type: "next",
                buttonText: "Next",
              },
            }}
            customButtons={customButtons}
            themeSystem="bootstrap"
            datesSet={(arg) => {
              setTimeCalendar({
                start: arg.startStr.slice(0, 10),
                end: arg.endStr.slice(0, 10),
              });
              console.log("start date: " + arg.startStr.slice(0, 10) + "/end date: " + arg.endStr.slice(0, 10))
              // if (calendarRef.current) {
              //   const calendarApi = calendarRef.current.getApi();
              //   calendarApi.gotoDate(moment().format("YYYY-MM-DD"));
              // }
            }}
            resourceAreaHeaderContent=""
            stickyHeaderDates={true}
            resources={isList === "day" ? listStaff : listClass}
            displayEventTime={false}
            events={listCalendar}
            allDaySlot={false}
            dayHeaderContent={(ev) => {
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              if (isList != "week") {
                return (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      paddingLeft: isMobile ? 0 : 14,
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      className="over-flow-hidden"
                      style={{ width: isMobile ? "10%" : "12.5%" }}
                    >
                      {formatDate(ev.date)}
                    </div>
                    <div
                      className="over-flow-hidden"
                      style={{ width: isMobile ? "10%" : "12.5%" }}
                    >
                      {i18n.t("signed_in")}
                    </div>
                    <div
                      className="over-flow-hidden"
                      style={{ width: isMobile ? "10%" : "12.5%" }}
                    >
                      {i18n.t("class_type")}
                    </div>
                    <div
                      className="over-flow-hidden"
                      style={{ width: "12.5%" }}
                    >
                      {i18n.t("class_name")}
                    </div>
                    <div
                      className="over-flow-hidden"
                      style={{ width: "12.5%" }}
                    >
                      {i18n.t("trainer")}
                    </div>
                    <div
                      className="over-flow-hidden"
                      style={{ width: "12.5%" }}
                    >
                      {i18n.t("location")}
                    </div>
                    <div
                      className="over-flow-hidden"
                      style={{ width: "12.5%" }}
                    >
                      {i18n.t("status")}
                    </div>
                    <div
                      style={{ width: "12.5%" }}
                      className="over-flow-hidden"
                    >
                      {i18n.t("action")}
                    </div>
                  </div >
                );
              } else {
                return (
                  <div>
                    {days[ev.date.getDay()]}
                  </div>
                );
              }
            }}
            // dayPopoverFormat={ }
            eventMouseEnter={(info) => {
              if (isList !== "day") {
                info.el.style.transform = "translateY(-1px)";
                info.el.style.transition = "transform 0.2s ease";
              } else {
                setIdOpenMol(Number(info.event.id));
              }
            }}
            eventMouseLeave={(info) => {
              if (isList !== "day") {
                info.el.style.transform = "translateY(0px)";
              } else {
                setIdOpenMol(0);
              }
            }}
            eventContent={(eventInfo) => {
              const item = listCalendar.find(
                (child) =>
                  child.id.toString() === eventInfo.event.id.toString()
              );

              if (isList !== "list") {
                return (
                  <div
                    className={`${idOpenMol.toString() ===
                      eventInfo.event.id.toString() &&
                      "event-hover-day-class"
                      }`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%"
                    }}
                    onMouseEnter={(e) => {
                      if (isList !== "day") {
                        setIdOpenMol(eventInfo.event.id);
                      }
                      // setIdOpenMol(eventInfo.event.id);
                    }}
                    onMouseLeave={(e) => {
                      if (isList !== "day") {
                        setIdOpenMol(0);
                      }
                      // setIdOpenMol(0);
                    }}
                    onClick={() => {
                      handleOpenDetail(item);
                    }}
                  >
                    {isList !== "day" ? (
                      <div>
                        <div style={{
                          textAlign: "left"
                        }}
                        >
                          {eventInfo.event.title}
                        </div>
                        {isList === "week" ? (
                          <div
                            style={{
                              textAlign: "left"
                            }}
                          >{eventInfo.event.extendedProps.class.name}</div>
                        ) : <></>}
                      </div>
                    ) : (
                      <div>
                        <div>
                          {formatTimeRange(
                            eventInfo.event.startStr,
                            eventInfo.event.endStr
                          )}
                        </div>
                        <div>{eventInfo.event.extendedProps.class.name}</div>
                      </div>
                    )}
                    <div>
                      {idOpenMol.toString() ===
                        eventInfo.event.id.toString() && (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: 0,
                              left: 0,
                              zIndex: 9999,
                              backgroundColor: "#fff",
                              border: "1px solid #f4f4f4",
                              display: "flex",
                              flexDirection: "column",
                              padding: "10px 0",
                            }}
                          >
                            <li
                              style={{
                                color: "#000",
                                textAlign: "left",
                                paddingLeft: "10px",
                              }}
                            >
                              {getStatus(item?.status).label}
                            </li>
                            <li
                              style={{
                                color: "#000",
                                textAlign: "left",
                                paddingLeft: "10px",
                              }}
                            >
                              {i18n.t("signed_in")}: {item?.bookings_count}/
                              {item?.capacity}
                            </li>
                            <li
                              style={{
                                color: "#000",
                                textAlign: "left",
                                paddingLeft: "10px",
                              }}
                            >
                              {i18n.t("class_type")}:{" "}
                              {
                                listTypeClass.find(
                                  (type) => type?.value === item?.class?.type
                                )?.label
                              }
                            </li>
                            <li
                              style={{
                                color: "#000",
                                textAlign: "left",
                                paddingLeft: "10px",
                              }}
                            >
                              {eventInfo.event.title}
                            </li>
                            <div
                              className=" justify-content-end p-1"
                              style={{
                                display:
                                  item?.status === 0 && canAddBooking
                                    ? "flex"
                                    : "none",
                                color: "#90A1EF",
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddNewBooking(item);
                              }}
                            >
                              {" "}
                              + {i18n.t("add_new_booking")}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              }
              // console.log('item,',item)
              return (
                <div
                  style={{
                    backgroundColor: "#fff",
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  onClick={() => {
                    handleOpenDetail(item);
                  }}
                >
                  <div
                    className="over-flow-hidden"
                    style={{ width: isMobile ? "10%" : "12.5%" }}
                  >
                    {formatTimeRange(
                      eventInfo.event.startStr,
                      eventInfo.event.endStr
                    )}
                  </div>
                  <div
                    className="over-flow-hidden"
                    style={{ width: isMobile ? "10%" : "12.5%" }}
                  >
                    {item?.bookings_count}/{item?.capacity}
                  </div>
                  <div
                    className="over-flow-hidden"
                    style={{ width: isMobile ? "10%" : "12.5%" }}
                  >
                    {
                      listTypeClass.find(
                        (type) => type?.value === item?.class?.type
                      )?.label
                    }
                  </div>
                  <div
                    className="over-flow-hidden"
                    style={{ width: "12.5%" }}
                  >
                    {item?.class?.name}
                  </div>
                  <div
                    className="over-flow-hidden"
                    style={{ width: "12.5%" }}
                  >{`${item?.staff?.last_name} ${item?.staff?.first_name}`}</div>
                  <div
                    className="over-flow-hidden"
                    style={{ width: "12.5%" }}
                  >
                    {item?.location?.name}
                  </div>

                  <div
                    className="over-flow-hidden"
                    style={{ width: "12.5%" }}
                  >
                    <Badge color="none" className={"badge-" + getStatus(item?.status).badge}>{getStatus(item?.status).label}</Badge>
                  </div>
                  <div
                    className="over-flow-hidden"
                    style={{ width: "12.5%", padding: "0 2px" }}
                  >
                    <button
                      className={"btn btn-delete-outline btn-sm " + (item.allow_cancel ? "" : "disabled")}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item?.status !== 2 && item?.allow_cancel === 1) {
                          handleUpdateStatus(item?.id);
                        }
                        // handleDeleteALocation(item.id);
                      }}
                    >
                      {i18n.t("cancel")}
                    </button>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>
      {openModal && (
        <ModalScheduleDetail
          id={null}
          name={""}
          isOpen={openModal}
          serviceId={null}
          onClose={() => setOpenModal(false)}
          onAdd={() => handleGetListClassSchedule()}
          isAdd={true}
          scheduleInfo={null}
        />
      )}
      {openDetail && (
        <ModalScheduleDetail
          id={selectedClassSchedule?.id}
          name={selectedClassSchedule?.name}
          isOpen={openDetail}
          serviceId={selectedClassSchedule?.serviceId}
          onClose={() => setOpenDetail(false)}
          onAdd={() => handleGetListClassSchedule()}
          isAdd={false}
          scheduleInfo={selectedClassSchedule?.data}
        />
      )}
      {isClassModal && (
        <ModalAddBooking
          isOpen={isClassModal}
          bookingDetail={dataBooking}
          onClose={() => {
            setDataBooking(null);
            setIsClassModal(false);
          }}
          onAdd={() => {
            setDataBooking(null);
            setIsClassModal(false);
            handleGetListClassSchedule();
          }}
        />
      )}
    </div>
  );
};
// - 3788D8 : Available
// - 00B400 : Ongoing
// - 885EFE : Completed
// - D8373A : Cancelled
// - 74788D : FullyBooked
export default ListScheduleInfo;
