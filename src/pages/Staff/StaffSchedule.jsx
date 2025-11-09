// Function Name : StaffSchedule Page
// Created date :  3/9/2025           by :  Antoine REY
// Updated date :                     by :  Antoine REY

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import moment from "moment/moment";
import allLocales from "@fullcalendar/core/locales-all";

import withRouter from "../../components/Common/withRouter";
import staffService from "../../services/staff.service";
import operatorService from "../../services/operator.service";
import i18n from "../../i18n";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import listPlugin from "@fullcalendar/list";
import BootstrapTheme from "@fullcalendar/bootstrap";
import Spinners from "../../components/Common/Spinner";
import { toast } from "react-toastify";
import { detectBrowser } from "../../utils/app"
import avatar from "../../assets/icon/circle-user-round.svg";

const StaffSchedule = (props) => {
  document.title = "Staff Schedule | Actiwell System";
  const calendarRef = useRef(null);

  const getCalendarApi = () => {
    return calendarRef?.current?.getApi();
  };

  const [schedules, setSchedules] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [locations, setLocations] = useState([]);

  const [timeCalendar, setTimeCalendar] = useState({
    start: moment().format("YYYY-MM-DD"),
    end: moment().add(7, "days").format("YYYY-MM-DD"),
  });

  const [isLoading, setLoading] = useState(false);
  const [view, setView] = useState("view");

  const [menuOpen, setMenuOpen] = useState(false);
  const [chainLoad, triggerChainLoad] = useState(false);
  const [buttonsCopy, setButtonsCopy] = useState("");
  const rootRef = useRef(null);

  const handleGetStaffSchedules = async () => {
    try {
      setLoading(true);
      const payload = {
        start_date: timeCalendar.start,
        end_date: timeCalendar.end
      };
      const res = await staffService.getListStaffSchedule(payload);
      if (res.success) {
        setSchedules(res.data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setLoading(false);
    }
  };

  const handleGetLocations = async () => {
    try {
      const res = await operatorService.getListLocationForOperator();
      if (res.success) {
        setLocations(res.data);
      }
    } catch (e) {
      console.log("error", e);
    }
  }

  const getCalendarEventsFromSchedules = (schedules = []) => {
    if (!schedules) return [];

    const events = [];

    schedules.forEach((staff) => {
      staff.schedules.forEach((sched, index) => {
        const start = new Date(`${sched.schedule_date}T00:00:00`);
        start.setMinutes(sched.schedule_from);

        const end = new Date(`${sched.schedule_date}T00:00:00`);
        end.setMinutes(sched.schedule_to);

        events.push({
          id: `${staff.staff_id}_${sched.schedule_date}_${index}`,
          type: sched.schedule_type,
          title: `${staff.staff_name}`,
          start,
          end,
          resourceId: String(staff.staff_id),
          location_id: sched.location_id,
        });
      });
    });

    return events;
  };

  const getStaffProfilesByIds = async (staffIds = []) => {
    if (!staffIds || staffIds.length === 0) return [];

    try {
      const staffProfiles = await Promise.all(
        staffIds.map(async (id) => {
          try {
            const profile = (await staffService.getDetailStaffProfile(id)).data;
            if (!profile) return null;

            return {
              id: String(profile.id),
              title: `${profile.first_name} ${profile.last_name}`,
              image: profile.avatar_url,
            };
          } catch (err) {
            console.error(`Failed to fetch profile for staff ${id}`, err);
            toast.error(`Error fetching staff ${id}`, {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              hideProgressBar: true,
            });
            return null;
          }
        })
      );

      return staffProfiles.filter(Boolean);
    } catch (e) {
      console.error("Error fetching staff profiles:", e);
      return [];
    }
  }

  const { earliest, latest } = useMemo(() => {
    const sixAM = moment().startOf("day").add(6, "hours");   // 06:00
    const eightPM = moment().startOf("day").add(20, "hours"); // 20:00
    if (!schedules || schedules.length === 0) return { earliest: sixAM.format("HH:mm:ss"), latest: eightPM.format("HH:mm:ss") };

    let min = Infinity;
    let max = -Infinity;

    schedules.forEach(staff => {
      staff.schedules.forEach(sched => {
        if (sched.schedule_from < min) min = sched.schedule_from;
        if (sched.schedule_to > max) max = sched.schedule_to;
      });
    });

    let earliestMoment = moment().startOf("day").add(min, "minutes");
    let latestMoment = moment().startOf("day").add(max, "minutes");

    if (earliestMoment.isAfter(sixAM)) earliestMoment = sixAM;
    if (latestMoment.isBefore(eightPM)) latestMoment = eightPM;

    return {
      earliest: earliestMoment.format("HH:mm:ss"),
      latest: latestMoment.format("HH:mm:ss")
    };
  }, [schedules]);

  useEffect(() => {
    const loadProfiles = async () => {
      if (!schedules || schedules.length === 0) {
        setStaffs([]);
        return;
      }

      const staffIds = schedules.map((el) => el.staff_id);
      const profiles = await getStaffProfilesByIds(staffIds);
      setStaffs(profiles);
    };

    loadProfiles();
  }, [schedules]);


  useEffect(() => {
    handleGetStaffSchedules();
  }, [timeCalendar]);

  useEffect(() => {
    handleGetLocations()
  }, []);

  const customButtons = {
    trainerWeekView: {
      text: i18n.t("weeks"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          calendarApi.changeView("trainerWeekView");
          setView("week");
          const previousHeaderToolbar = document?.querySelector(
            ".highlighted-toolbar"
          );
          if (previousHeaderToolbar) {
            previousHeaderToolbar.classList.remove("highlighted-toolbar");
          }

          const headerToolbar = document?.querySelector(
            ".fc-trainerWeekView-button"
          );
          headerToolbar.classList.add("highlighted-toolbar");
          setMenuOpen(false);
        } catch (e) {
          console.log("easd", e);
        }
      },
    },
    trainerDayView: {
      text: i18n.t("days"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          calendarApi.changeView("trainerDayView");
          setView("day");
          const previousHeaderToolbar = document?.querySelector(
            ".highlighted-toolbar"
          );
          if (previousHeaderToolbar) {
            previousHeaderToolbar.classList.remove("highlighted-toolbar");
          }
          const headerToolbar = document?.querySelector(".fc-trainerDayView-button");
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
        } catch (e) {
          console.log("easd", e);
        }
      },
    },
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 860;
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

    const isMobile = window.innerWidth < 860;

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
    if (window.innerWidth >= 860) {
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
  }, [view]);

  return (
    <React.Fragment>
      <div className={"" + detectBrowser()} style={{ padding: "0" }}>
        <div className="page-container">
          <div>
            <div
              style={{
                position: "relative",
                padding: "0 6px",
              }}
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
                ref={calendarRef}
                plugins={[
                  BootstrapTheme,
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  resourceTimelinePlugin,
                  resourceTimeGridPlugin,
                  listPlugin,
                ]}
                locale={i18n.language === "vi" ? "vi" : "en"}
                locales={allLocales}
                height={"auto"}
                slotMinTime={earliest}
                slotMaxTime={latest}
                resourceAreaWidth={window.innerWidth >= '576' ? "180px" : "100px"}
                dayMaxEventRows={3}
                dayHeaderFormat={{ weekday: 'long' }}
                firstDay={1}
                viewDidMount={updateToolbar}
                allDaySlot={false}
                initialView="trainerWeekView"
                headerToolbar={{
                  start: "prevOfData,title,nextOfData todayOfData",
                  center: "trainerWeekView trainerDayView",
                  end: "",
                }}
                views={{
                  trainerWeekView: {
                    type: 'resourceTimeline',
                    duration: { days: 7 },
                    buttonText: 'Trainer Week',
                    slotLabelFormat: [{ weekday: 'long', day: 'numeric' }],
                    slotDuration: { days: 1 },
                  },
                  trainerDayView: {
                    type: 'resourceTimelineDay',
                    buttonText: 'Trainer Timeline',
                    slotDuration: '00:30:00',
                    slotMinTime: earliest,
                    slotMaxTime: latest,

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
                  const end = new Date(arg.endStr.slice(0, 10));
                  end.setDate(end.getDate() - 1);
                  setTimeCalendar({
                    start: arg.startStr.slice(0, 10),
                    end: end.toISOString().split('T')[0],
                  });
                }}
                resourceAreaHeaderContent={'Trainer'}
                resources={staffs}
                resourceLabelContent={(arg) => {
                  if (!staffs) return
                  const resource = staffs.find((el) => arg.resource._resource.id === el.id);
                  if (!resource) return
                  if (!resource.image) {
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {window.innerWidth >= '576' && (
                          <img src={avatar} alt="NULL" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                        )}
                        <span style={{ whiteSpace: "collapse" }}>{resource.title}</span>
                      </div>);
                  }
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {window.innerWidth >= '576' && (
                        <img src={resource.image} alt="NULL" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                      )}
                      <span style={{ whiteSpace: "collapse" }}>{resource.title}</span>
                    </div>);
                }}
                displayEventTime={false}
                events={getCalendarEventsFromSchedules(schedules)}
                eventContent={(eventInfo) => {
                  const { event } = eventInfo

                  const loc = locations.find((el) => Number(el.id) === Number(event.extendedProps.location_id));

                  return (
                    <div className="container-calendar-schedule"
                      style={{ backgroundColor: event.extendedProps.type === "repeated" ? " #2563EB" : "#7c3aed" }}
                    >
                      <div className="item-calendar-schedule">
                        <div>{moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}</div>
                        <div>{loc ? loc.name : ""}</div>
                      </div>
                    </div>
                  );
                }}
              />
              {schedules && schedules.length === 0 && (
                <div style={{ textAlign: "center", marginTop: "50px", fontWeight: 700, fontSize: "18px" }}>
                  {i18n.t("there_are_no_data_exist")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment >
  );
};

export default withRouter(StaffSchedule);
