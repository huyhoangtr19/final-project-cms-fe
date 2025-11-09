// Function Name : TrainerSchedule Page
// Created date :  5/8/2025           by :  Antoine REY
// Updated date :                     by :  Antoine REY

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import moment from "moment/moment";
import allLocales from "@fullcalendar/core/locales-all";

import withRouter from "../../components/Common/withRouter";
import bookingService from "../../services/booking.service";
import staffService from "../../services/staff.service";
import { listStatusBooking } from "../../constants/app.const";
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
import { convertToUtcString } from "../../utils/app";
import { toast } from "react-toastify";
import { detectBrowser } from "../../utils/app"
import avatar from "../../assets/icon/circle-user-round.svg";

const TrainerSchedule = (props) => {
  document.title = "Staff Schedule | Actiwell System";
  const calendarRef = useRef(null);

  const getCalendarApi = () => {
    return calendarRef?.current?.getApi();
  };
  const [booking, setBookings] = useState([]);

  const [staffs, setStaffs] = useState([]);
  const [timeCalendar, setTimeCalendar] = useState({
    start: moment().format("YYYY-MM-DD"),
    end: moment().format("YYYY-MM-DD"),
  });
  const [isLoading, setLoading] = useState(false);
  const [view, setView] = useState("view");

  const [menuOpen, setMenuOpen] = useState(false);
  const [chainLoad, triggerChainLoad] = useState(false);
  const [buttonsCopy, setButtonsCopy] = useState("");
  const rootRef = useRef(null);

  const handleGetListBooking = async () => {
    try {
      setLoading(true);
      const payload = {
        start_date: timeCalendar.start,
        end_date: timeCalendar.end,
      };
      const res = await bookingService.getListBookingCalendar(payload);
      const temp = res.data.map((item) => {
        const itemTemp = {
          ...item,
          resourceId: item?.class?.id,
          title: `${item?.customer?.last_name} ${item?.customer?.first_name}`,
          start: convertToUtcString(
            item?.schedule?.date,
            item?.schedule?.start_time
          ),
          end: convertToUtcString(
            item?.schedule?.date,
            item?.schedule?.end_time
          ),
        };
        return itemTemp;
      });

      const resPT = await bookingService.getListBookingPTCalendar(payload);
      const tempPT = resPT.data.map((item) => {
        const itemTemp = {
          ...item,
          resourceId: item?.class?.id,
          title: ` ${item?.customer?.last_name} ${item?.customer?.first_name}`,
          start: convertToUtcString(
            item?.date,
            item?.start_time
          ),
          end: convertToUtcString(
            item?.date,
            item?.end_time
          ),
        };
        return itemTemp;
      });
      setBookings(temp.concat(tempPT));

      const staffResource = await getTrainersFromBookings(temp.concat(tempPT));
      setStaffs(staffResource)


    } catch (error) {
      console.log("error:", error);
    }
  };

  const getStatus = (status) => {
    const statusObj = listStatusBooking.find((item) => item.value === status);
    return statusObj;
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

  const fetchData = async () => {
    try {
      const staffResource = await getTrainersFromBookings();
      setStaffs(staffResource)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    handleGetListBooking();
  }, [timeCalendar]);

  useEffect(() => {
    fetchData();
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

  const getTrainersFromBookings = async (bookings) => {
    if (!bookings) return;

    try {
      const uniqueStaff = [];
      const seenStaffIds = new Set();

      bookings.forEach((booking) => {
        const staff = booking.staff;
        if (staff && !seenStaffIds.has(staff.id)) {
          seenStaffIds.add(staff.id);
          uniqueStaff.push(staff);
        }
      });

      const staffProfiles = await Promise.all(
        uniqueStaff.map(async (staff) => {
          try {
            const profile = await staffService.getDetailStaffProfile(staff.id);
            return {
              id: String(staff.id),
              title: `${staff.first_name} ${staff.last_name}`,
              image: profile.avatar_url,
            };
          } catch (err) {
            console.error(`Failed to fetch profile for staff ${staff.id}`, err);
            toast.error(`error fetching staff ${staff.first_name} ${staff.last_name}`, {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              hideProgressBar: true,
            })
            return null;
          }
        })
      );

      return staffProfiles.filter(Boolean);
    } catch (e) {
      console.error("Error fetching trainers:", e);
      return [];
    }
  };

  function getStatusFromArray(status) {
    if (status.includes(1)) return 1;
    if (status.includes(2)) return 2;
    if (status.includes(0)) return 0;
    if (status.includes(4)) return 4;
    if (status.includes(3)) return 3;
    return 4;
  }

  const getCalendarEvents = (bookings = []) => {
    if (!bookings) return;

    const grouped = {};

    bookings.forEach((booking) => {
      const staffId = booking.staff?.id;
      const classId = booking.class?.id;

      if (classId) {
        const scheduleDate = booking.schedule?.date?.slice(0, 10); // 'YYYY-MM-DD'
        const key = `${classId}_${staffId}_${scheduleDate}`;
        const durationMin = booking.schedule.end_time - booking.schedule.start_time;
        const start = new Date(booking.start);
        const end = new Date(start.getTime() + durationMin * 60000);
        if (!grouped[key]) {
          grouped[key] = {
            title: booking.class.name,
            type: "class",
            start,
            end,
            id: `group-${key}`,
            resourceId: String(staffId),
            status: [booking.status],
          };
        } else {
          grouped[key].status.push(booking.status);
        }
      } else {
        const scheduleDate = booking.date?.slice(0, 10);
        const key = `__${staffId}_${scheduleDate}`;
        const start = new Date(booking.start);
        const end = new Date(booking.end);

        grouped[key] = {
          id: String(booking.id),
          type: "pt",
          title: `${booking.customer.first_name} ${booking.customer.last_name}`,
          start,
          end,
          resourceId: String(booking.staff.id),
          status: [booking.status],
        };
      }
    });

    return Object.values(grouped).map((group) => {
      return {
        id: group.id,
        type: group.type,
        title: group.title,
        start: group.start,
        end: group.end,
        resourceId: group.resourceId,
        status: getStatusFromArray(group.status),
      }
    });
  };

  const { earliest, latest } = useMemo(() => {
    const sixAM = 6 * 60;   // 360 minutes
    const eightPM = 20 * 60; // 1200 minutes

    if (!booking || booking.length === 0) {
      return {
        earliest: moment().startOf("day").add(sixAM, "minutes").format("HH:mm:ss"),
        latest: moment().startOf("day").add(eightPM, "minutes").format("HH:mm:ss"),
      };
    }

    let min = Infinity;
    let max = -Infinity;

    booking.forEach(b => {
      const start = moment(b.start);
      const end = moment(b.end);

      if (start.isValid()) {
        const minutes = start.hours() * 60 + start.minutes();
        if (minutes < min) min = minutes;
      }
      if (end.isValid()) {
        const minutes = end.hours() * 60 + end.minutes();
        if (minutes > max) max = minutes;
      }
    });

    if (min > sixAM) min = sixAM;
    if (max < eightPM) max = eightPM;

    return {
      earliest: moment().startOf("day").add(min, "minutes").format("HH:mm:ss"),
      latest: moment().startOf("day").add(max, "minutes").format("HH:mm:ss"),
    };
  }, [booking]);

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
      <div className={"page-content content-container " + detectBrowser()} style={{ padding: "0" }}>
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
                  dayOfData: {
                    type: "timeGridDay",
                    buttonText: "Day",
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
                events={getCalendarEvents(booking)}
                eventContent={(eventInfo) => {
                  const bookingItem = getCalendarEvents(booking)?.find(
                    (child) =>
                      child.id.toString() === eventInfo.event.id.toString()
                  );
                  if (!bookingItem) {
                    return <div></div>;
                  }
                  const status = getStatus(bookingItem?.status);

                  return (
                    <div className="container-calendar-schedule"
                      style={{
                        backgroundColor: bookingItem.type !== "pt" ? "#7c3aed" : "#EA580C",
                      }}
                    >
                      <div className="item-calendar-schedule" style={{
                        backgroundColor: status ? status.color : "black"
                      }}>
                        <div style={{ wordBreak: "break-word" }}>
                          {bookingItem.title}
                        </div>
                        <div style={{ wordBreak: "break-word" }}>
                          {formatTimeRange(bookingItem.start, bookingItem.end)}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              {booking && booking.length === 0 && (
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

export default withRouter(TrainerSchedule);
