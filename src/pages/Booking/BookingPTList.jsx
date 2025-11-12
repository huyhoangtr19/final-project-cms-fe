// Function Name : Booking Page
// Created date :  6/8/24             by :  VinhLQ
// Updated date :                     by :  VinhLQ

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { createRoot } from "react-dom/client";
import PropTypes from "prop-types";
import { Button, Badge, Input, Collapse } from "reactstrap";
import moment from "moment/moment";
import allLocales from "@fullcalendar/core/locales-all";

// import enLocale from "@fullcalendar/core/locales/en-gb";
import Breadcrumb from "../../components/Common/Breadcrumb";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import IcPlus from "../../assets/icon/IcPlus";
import withRouter from "../../components/Common/withRouter";
import customerService from "../../services/customer.service";
import bookingService from "../../services/booking.service";
import sourceService from "../../services/source.service";
import operatorService from "../../services/operator.service";
import { listStatusBooking } from "../../constants/app.const";
import MyDropdownMultiple from "../../components/Common/MyDropdownMultiple";
import styled from "styled-components";
import i18n from "../../i18n";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import BootstrapTheme from "@fullcalendar/bootstrap";
import classService from "../../services/class.service";
import Spinners from "../../components/Common/Spinner";
import { convertToUtcString, formatDate } from "../../utils/app";
import QRCodeCheckInScanner from "../../components/Common/QRCodeCheckInScanner";
import { toast } from "react-toastify";
import MyDropdownColor from "../../components/Common/MyDropdownColor";
import { useAppSelector } from "../../hook/store.hook";
import IcQR from "../../assets/icon/IcQR";
import { detectBrowser } from "../../utils/app";

const StatusDot = styled.span`
  height: 8px;
  width: 8px;
  background-color: ${(props) => props.color || "gray"};
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
`;

const BookingPTList = (props) => {
  document.title = "Private Booking | Fitness CMS";
  const calendarRef = useRef(null);

  const getCalendarApi = () => {
    return calendarRef?.current?.getApi();
  };
  const [ptBooking, setPtBookings] = useState([]);
  const [data, setData] = useState({
    locations: [],
    sources: [],
  });
  const [params, setParams] = useState({
    keyword: "",
    id: "",
    locations: [],
    status: "",
    source: "",
    class: "",
  });
  const [timeCalendar, setTimeCalendar] = useState({
    start: moment().format("YYYY-MM-DD"),
    end: moment().format("YYYY-MM-DD"),
  });
  const [startDate, setStartDate] = useState(
    new Date(timeCalendar.start).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date(timeCalendar.end).toISOString().slice(0, 10)
  );

  const { permissionUser } = useAppSelector((state) => state.auth);
  const [isLoading, setLoading] = useState(false);
  const [isList, setIsList] = useState("month");
  const [isChange, setIsChange] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const isCheckingRef = useRef(false);

  const [eventCounts, setEventCounts] = useState({});

  const [menuOpen, setMenuOpen] = useState(false);
  const [chainLoad, triggerChainLoad] = useState(false);
  const [buttonsCopy, setButtonsCopy] = useState("");
  const rootRef = useRef(null);

  const canSeeProduct = useMemo(() => {
    return permissionUser.includes("ptBooking:create");
  }, [permissionUser]);

  useEffect(() => {
    const counts = {};
    ptBooking.forEach((event) => {
      const date = new Date(event?.start).toDateString();
      counts[date] = (counts[date] || 0) + 1;
    });
    setEventCounts(counts);
  }, [ptBooking]);

  const handleScanCheckIn = async (data) => {
    if (data && !isCheckingRef.current) {
      try {
        isCheckingRef.current = true;
        const res = await customerService.checkInMember(data);
        setShowCamera(false);
        const messageConfig = {
          check_in_success: {
            type: "success",
            text: "Check in thành công",
          },
          package_not_found: {
            type: "info",
            text: "Gói tập của khách hàng đã hết hạn",
          },
          location_not_apply: {
            type: "info",
            text: "Gói tập của khách hàng không được áp dụng tại chi nhánh",
          },
        };
        const message = messageConfig[res.data.code];
        toast[message.type](message.text, {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
        isCheckingRef.current = false;
      } catch (error) {
        setShowCamera(false);
        isCheckingRef.current = false;
        if (error.message === "expired") {
          toast.error("QR hết hạn", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        } else {
          toast.error("Check in đã xảy ra lỗi", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            hideProgressBar: true,
          });
        }
      }
    }
  };
  const handleCheckInPtBooking = async (bookingId) => {
    try {
      const response = await bookingService.checkInBookingPT(bookingId);
      if (response.success) {
        await handleGetListPtBooking();
        toast.success("Check in ptBooking successfully", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {}
  };
  const formatTime = (startTime) => {
    // Parse the start and end times into Date objects
    const startDate = new Date(startTime);

    // Format the times using the 24-hour clock
    const formattedStartTime = startDate.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });

    return `${formattedStartTime}`;
  };
  const handleGetListPtBooking = async () => {
    try {
      setLoading(true);
      const payload = {
        ...params,
        start_date: timeCalendar.start,
        end_date: timeCalendar.end,
      };

      // trans form status 5 to empty and confirmed 0 for PT booking
      if (payload.status && payload.status == 5) {
        payload.status = "";
        payload.confirmed = 0;
      }

      const res = await bookingService.getListBookingPTCalendar(payload);
      // console.log('res', res.data.length);
      const temp = res.data.map((item) => {
        const itemTemp = {
          ...item,
          resourceId: item?.class?.id,
          title: ` ${item?.customer?.last_name} ${item?.customer?.first_name}`,
          start: convertToUtcString(item?.date, item?.start_time),
          end: convertToUtcString(item?.date, item?.end_time),
          // allDay: true,
          className:
            isList === "list"
              ? "bg-white text-black"
              : isList === "month"
              ? "bg-transparent text-black"
              : `bg-${getStatus(item.status)?.bg} text-black`,
        };
        if (isList === "month") {
          delete itemTemp.end;
        }
        return itemTemp;
      });
      setPtBookings(temp);
    } catch (error) {
      console.log("error:", error);
    }
  };

  const getStatus = (status) => {
    const statusObj = listStatusBooking.find((item) => item.value === status);
    return statusObj;
  };

  const handleRedirectPt = (ptBooking) => {
    props.router.navigate(`/book-by-pt/detail/${ptBooking.id}`);
  };

  const handleResetFilter = () => {
    setParams({
      keyword: "",
      id: [],
      locations: [],
      status: "",
      source: "",
      class: "",
    });
  };

  const handleGetLocationForOperator = async () => {
    try {
      const response = await operatorService.getListLocationForOperator();
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
      }
    } catch (e) {}
  };

  const handleGetSource = async () => {
    try {
      const response = await sourceService.getListSource();
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
      }
    } catch (e) {}
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

  const convertMinutesToTimeString = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const fetchData = async () => {
    try {
      const [sources, locations] = await Promise.all([
        handleGetSource(),
        handleGetLocationForOperator(),
      ]);

      setData({
        sources: sources,
        locations: locations,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    handleGetListPtBooking();
  }, [params, timeCalendar]);

  useEffect(() => {
    fetchData();
    // const headerToolbar = document?.querySelector(".fc-monthOfData-button");
    // headerToolbar.classList.add("highlighted-toolbar");
  }, []);

  const handleDateClick = (e) => {
    if (isList === "month") {
      try {
        const calendarApi = getCalendarApi();
        calendarApi.changeView("timeGridDay", e?.dateStr);

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
      } catch (e) {
        console.log("easd", e);
      }
    }
  };
  const getCustomVisibleRange = (currentDate) => {
    return {
      start: startDate.toISOString().split("T")[0], // YYYY-MM-DD
      end: endDate.toISOString().split("T")[0],
    };
  };
  useEffect(() => {
    if (isList === "list") {
      setTimeCalendar({
        start: startDate.slice(0, 10),
        end: endDate.slice(0, 10),
      });
    }
  }, [startDate, endDate, isList]);

  const qrScannerRef = useRef();

  const openCamera = () => {
    qrScannerRef.current?.triggerCamera(); // Call the exposed function
  };

  const customButtons = {
    listOfData: {
      text: i18n.t("list"),
      click: function () {
        try {
          const calendarApi = getCalendarApi();
          calendarApi.changeView("listYear");
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
          calendarApi.changeView("dayGridMonth");
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
          calendarApi.changeView("timeGridDay");
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
    QrScanner: {
      text: "",
      click: () => {
        openCamera();
      },
    },
    AddNewBooking: {
      text: i18n.t(""),
      click: () => {},
    },
  };

  const reactRootRef = useRef(null);

  useEffect(() => {
    const toolbarEl = document.querySelector(".fc-QrScanner-button");

    if (toolbarEl) {
      toolbarEl.classList.remove("btn-primary");
      toolbarEl.classList.add("btn-outline");

      if (!toolbarEl.querySelector("#qr-scanner-button")) {
        const placeholder = document.createElement("div");
        placeholder.id = "qr-scanner-button";
        toolbarEl.innerHTML = "";
        toolbarEl.appendChild(placeholder);

        // React 18+ rendering
        reactRootRef.current = createRoot(placeholder);
        reactRootRef.current.render(
          <div className="d-flex align-items-center gap-2">
            <IcQR color="#2563EB" />
            <div className="" style={{ lineHeight: "17px" }}>
              Check in
            </div>
          </div>
        );
      }
    }
  }, []);

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
          <a href="/book-by-pt/create" className="btn btn-secondary">
            <IcPlus color="white" />
            <div className="" style={{ lineHeight: "17px" }}>
              {window.innerWidth <= "660"
                ? i18n.t("add_new_booking_short")
                : i18n.t("add_new_booking")}
            </div>
          </a>
        );
      }
    }
  }, []);

  useEffect(() => {
    const moreButtons = document.querySelectorAll(".fc-more-link");
    moreButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setTimeout(() => {
          const popup = document.querySelector(".popover-body");
          if (popup) {
            const footer = document.querySelector(".footer");

            const buttonBottom = button.getBoundingClientRect().bottom;
            const pageBottom = document.body.scrollHeight;

            const spaceAvailable = pageBottom - buttonBottom + 95;

            popup.style.maxHeight = spaceAvailable + "px";
            popup.style.overflowY = "auto";
            popup.style.display = "block";
          }
        }, 100); // Delay enough for the popup to be inserted
      });
    });
  });

  useEffect(() => {
    setLoading(true);
    const isHasHead = document?.querySelector(".additional-content");
    // if (isList !== "list") {
    //   const eventGraphic = document?.querySelector(".fc-list-event-graphic");
    //   if (eventGraphic) {
    //     eventGraphic.style.display = "none";
    //   }
    // }
    if (isList === "list" && !isHasHead) {
      try {
        // Select the header and content elements
        const headerEl = document.querySelector(".fc-listYear-view");

        //         const newTh = document.createElement('th');
        // newTh.textContent = 'New Column Header';
        // Add margin between the header and content
        headerEl.style.marginBottom = "20px";

        const additionBoxEl = document.createElement("div");
        additionBoxEl.classList.add("sticky-additional-content");
        additionBoxEl.style.display = "flex";
        additionBoxEl.style.width = "100%";
        const additionBoxDot = document.createElement("div");
        additionBoxDot.style.width = "12px";
        additionBoxEl.appendChild(additionBoxDot);
        const additionalContentEl = document.createElement("div");

        // Set styles for the additional content container
        additionalContentEl.classList.add("additional-content"); // Add a class for easier styling
        additionalContentEl.style.display = "flex";
        additionalContentEl.style.padding = "8px 14px"; // Make it a flexbox for easier layout
        additionalContentEl.style.justifyContent = "space-between";
        additionalContentEl.style.width = "100%";
        // Create individual divs for each label
        const labels = [
          "schedule",
          "booking_id",
          "source",
          "location",
          // "class_name",
          "trainer",
          "customer",
          "phone",
          "email",
          "status",
          "timestamp",
          "action",
        ];

        labels.forEach((label) => {
          const labelEl = document.createElement("div");
          labelEl.textContent = i18n.t(label);
          labelEl.style.textAlign = "left";
          labelEl.style.overflow = "hidden";

          // additionBoxEl.className ='over-flow-hidden'
          if (isMobile) {
            labelEl.style.fontSize = "9px";
          }
          labelEl.style.width =
            label === "email"
              ? "12.6%"
              : label === "timestamp"
              ? "10.4%"
              : label === "schedule"
              ? "9%"
              : label === "phone"
              ? "8%"
              : label === "status" || label === "booking_id"
              ? "6%"
              : "9.6%";
          additionalContentEl.appendChild(labelEl);
        });
        const firstChild = headerEl.firstChild;

        // Insert the new element before the first child
        additionBoxEl.appendChild(additionalContentEl);
        headerEl.insertBefore(additionBoxEl, firstChild);
      } catch (e) {
        console.log("e", e);
      }
    }
  }, [isChange, isList]);
  const isMobile = useMemo(() => {
    return window.innerWidth < 768;
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (isList === "week" || isList === "day") {
      const classList = [
        ".fc-day-mon",
        ".fc-day-tue",
        ".fc-day-wed",
        ".fc-day-thu",
        ".fc-day-fri",
        ".fc-day-sat",
        ".fc-day-sun",
      ];
      classList.forEach((el) => {
        const component = document.querySelector(el);
        let smallWindow = false;

        if (component) {
          const dateValue = component.getAttribute("data-date");
          const dateObj = new Date(dateValue);
          const formattedDate = dateObj.toDateString();
          const dayAnchor = component.querySelector(
            "div.fc-scrollgrid-sync-inner"
          );

          if (window.innerWidth <= "500" && isList === "week") {
            smallWindow = true;
          }

          if (dayAnchor) {
            if (dayAnchor.querySelector(".calendar-badge")) return;

            // Create and append the badge container
            const badgeContainer = document.createElement("span");
            badgeContainer.className = "calendar-badge";
            if (!smallWindow) badgeContainer.style.marginLeft = "8px";
            dayAnchor.appendChild(badgeContainer);

            const root = createRoot(badgeContainer);
            root.render(
              <span
                className="fc-col-header-badge"
                style={{
                  backgroundColor: "#7c3aed",
                  color: "white",
                  borderRadius: "9999px",
                  padding: "2px 6px",
                  fontSize: "0.8em",
                  textAlign: "center",
                }}
              >
                {eventCounts[formattedDate] || 0}
              </span>
            );
          }
        }
      });
    }
  }, [eventCounts]);

  useEffect(() => {
    const isMobile = window.innerWidth < 725;
    if (!isMobile || !chainLoad) return;

    const secondDiv = document.querySelector(
      ".fc-header-toolbar .fc-toolbar-chunk:nth-of-type(2)"
    );
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
        buttonsCopy.forEach((btn) => {
          const cloneBtn = btn;
          cloneBtn.style.display = "block";
          container.appendChild(cloneBtn);
        });
      }
    };

    preloadButtons();

    rootRef.current.render(
      <div
        style={{ position: "relative", display: "inline-block", margin: "0" }}
      >
        <button
          className="btn-mob-menu gap-2"
          onClick={() => {
            preloadButtons();
            setMenuOpen((prev) => !prev);
          }}
        >
          <i className="fa fa-bars"></i> {i18n.t("view")}
        </button>

        <div
          className="button-wrapper-mob"
          style={menuOpen ? { display: "block" } : { display: "none" }}
        >
          <div id="button-container-mob" />
        </div>
      </div>
    );
  }, [menuOpen, chainLoad]);

  const updateToolbar = useCallback(() => {
    setMenuOpen(false);
    const secondDiv = document.querySelector(
      ".fc-header-toolbar .fc-toolbar-chunk:nth-of-type(2)"
    );
    if (!secondDiv) return;

    triggerChainLoad(chainLoad + 1);

    const buttons = secondDiv.querySelectorAll(".btn");
    if (!buttonsCopy && buttons) setButtonsCopy(buttons);

    const isMobile = window.innerWidth < 725;

    if (!isMobile) {
      secondDiv.classList.add("view-switcher");
      buttons.forEach((b) => {
        b.classList.remove("btn");
        b.classList.remove("btn-primary");
        b.classList.add("view-btn");
        b.style.margin = "0rem";
      });
    } else {
      buttons.forEach((b) => {
        b.style.display = "none";
      });
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 725) {
      const secondDiv = document.querySelector(
        ".fc-header-toolbar .fc-toolbar-chunk:nth-of-type(2)"
      );
      if (secondDiv === null) return;
      secondDiv.classList.add("view-switcher");
      const buttons = secondDiv.querySelectorAll(".btn");
      buttons.forEach((b) => {
        b.classList.remove("btn");
        b.classList.remove("btn-primary");
        b.classList.add("view-btn");
        b.style.margin = "0rem";
      });
    }
  }, [isList]);

  return (
    <React.Fragment>
      <div
        className={"page-content content-container " + detectBrowser()}
        style={{ padding: "0" }}
      >
        <Breadcrumb title={i18n.t("booking_pt")} />
        <div className="bg-white page-container">
          <div className="p-0">
            <div className="filter-container" style={{ marginBottom: "0" }}>
              <div className="filter-header">
                <div
                  className="filter-title-group"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <button className="filter-clear">
                    {filterOpen ? (
                      <i className="fa fa-chevron-right" />
                    ) : (
                      <i className="fa fa-chevron-down" />
                    )}
                  </button>
                  <h5 className="filter-title">{i18n.t("all_bookings")}</h5>
                </div>
                <button className="filter-reset" onClick={handleResetFilter}>
                  {i18n.t("reset")}
                </button>
              </div>
              <Collapse isOpen={filterOpen} className="filter-grid">
                <div className="filter-group">
                  <label className="filter-label">{`${i18n.t("email")}/${i18n.t(
                    "phone"
                  )}/${i18n.t("name")}`}</label>
                  <InputSearch
                    value={params.keyword}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        keyword: e,
                      }))
                    }
                    placeholder={`${i18n.t("email")}/${i18n.t(
                      "phone"
                    )}/${i18n.t("name")}`}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Location</label>
                  <MyDropdownMultiple
                    options={data.locations}
                    placeholder={i18n.t("location")}
                    selected={params.locations}
                    setSelected={(selected) =>
                      setParams((prev) => ({
                        ...prev,
                        locations: selected,
                      }))
                    }
                    displayEmpty={true}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Status</label>
                  <MyDropdownColor
                    options={listStatusBooking}
                    selected={params.status}
                    displayEmpty={true}
                    setSelected={(e) =>
                      setParams((prevParams) => ({
                        ...prevParams,
                        status: e,
                      }))
                    }
                    placeholder={i18n.t("status")}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Source</label>
                  <MyDropdown
                    options={data.sources}
                    selected={params.source}
                    displayEmpty={true}
                    setSelected={(e) =>
                      setParams((prevParams) => ({
                        ...prevParams,
                        source: e,
                      }))
                    }
                    placeholder={i18n.t("source")}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Start date</label>
                  <Input
                    className="filter-select"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">End date</label>
                  <Input
                    className="filter-select"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </Collapse>
            </div>
            <div>
              <QRCodeCheckInScanner
                onResult={handleScanCheckIn}
                showCamera={showCamera}
                setShowCamera={setShowCamera}
                ref={qrScannerRef}
                hide={true}
              />
            </div>
            <div
              style={{
                position: "relative",
                padding: "6px",
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
                  listPlugin,
                ]}
                locale={i18n.language === "vi" ? "vi" : "en"}
                locales={allLocales}
                height={"auto"}
                // eventLimit={2}
                dayMaxEventRows={3}
                dayHeaderFormat={{
                  weekday:
                    window.innerWidth >= "576"
                      ? "long"
                      : isList === "month"
                      ? "short"
                      : "long",
                }}
                firstDay={1}
                viewDidMount={updateToolbar}
                allDaySlot={false}
                dayCellContent={(arg) => {
                  const day = new Date(arg.date).toDateString();
                  const evnCount = eventCounts[day] || 0;
                  if (isList === "month") {
                    return (
                      <div style={{ fontWeight: 700 }}>
                        <p style={{ margin: "0rem" }}>{arg.dayNumberText}</p>
                      </div>
                    );
                  }
                  return (
                    <div
                      style={{
                        width: "100%",
                        padding: "0.5rem 0",
                      }}
                    >
                      <div
                        className="nb-event-day"
                        style={{
                          display: "flex",
                          height: 40,
                          width: 40,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 30,
                        }}
                      >
                        <div className="event-count text-white">{evnCount}</div>
                      </div>
                    </div>
                  );
                }}
                // dayCount={eventCounts}
                initialView="monthOfData"
                headerToolbar={{
                  start: "prevOfData,title,nextOfData todayOfData",
                  center: "monthOfData weekOfData dayOfData listOfData",
                  end: "AddNewBooking QrScanner",
                }}
                dateClick={(e) => handleDateClick(e)}
                views={{
                  listOfData: {
                    type: "list", // Base type is 'list'
                    duration: {
                      days:
                        (new Date(endDate).getTime() -
                          new Date(startDate).getTime()) /
                          (1000 * 60 * 60 * 24) +
                        1,
                    }, // Calculate duration in days
                    // OR, more robustly, use visibleRange function:
                    visibleRange: getCustomVisibleRange,
                    buttonText: "List",
                  },
                  monthOfData: {
                    type: "dayGridMonth",
                    buttonText: "Month",
                  },
                  weekOfData: {
                    type: "timeGridWeek",
                    duration: { days: 7 },
                    buttonText: "Week",
                  },
                  dayOfData: {
                    type: "timeGridDay",
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
                  setStartDate(arg.startStr.slice(0, 10));
                  setEndDate(arg.endStr.slice(0, 10));
                }}
                // allDayContent={(event)=>{
                //   return <div>{event.event}</div>
                // }}
                // allDa
                // allDayContent={(arg)=>{
                //   console.log('arg',arg)
                //   return <div>a</div>
                // }}
                // resources={listClass}
                displayEventTime={false}
                events={ptBooking}
                eventContent={(eventInfo) => {
                  const bookingItem = ptBooking?.find(
                    (child) =>
                      child.id.toString() === eventInfo.event.id.toString()
                  );
                  if (!bookingItem) {
                    return <div></div>;
                  }
                  const status = getStatus(bookingItem?.status);
                  if (isList === "month") {
                    return (
                      <div
                        className="item-calendar"
                        style={{
                          backgroundColor: status?.color,
                          color: "white",
                          padding: "0rem",
                          margin: "0rem auto",
                          fontWeight: "500",
                          display: "flex",
                          flexDirection: "column",
                          zIndex: 2,
                          gap: "2px",
                          textAlign: "left",
                          wordBreak: "break-word",
                        }}
                        onClick={() => handleRedirectPt(bookingItem)}
                      >
                        <div
                          className="d-flex align-items-center gap-1"
                          style={{
                            wordBreak: "break-all",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              wordBreak: "break-word",
                              marginLeft: "5px",
                            }}
                          >
                            {convertMinutesToTimeString(bookingItem.start_time)}
                            <br></br>
                            {eventInfo.event.title}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (isList != "list") {
                    return (
                      <div
                        className="item-calendar"
                        style={{
                          backgroundColor: "transparent",
                          color: "white",
                          display: "flex",
                          flexDirection: "column",
                          zIndex: 2,
                          gap: "2px",
                          textAlign: "left",
                          wordBreak: "break-word",
                          marginLeft: "2px",
                        }}
                        onClick={() => handleRedirectPt(bookingItem)}
                      >
                        <div
                          className="d-flex align-items-center gap-1"
                          style={{ wordBreak: "break-all" }}
                        >
                          <div
                            style={{
                              wordBreak: "break-word",
                            }}
                          >
                            {eventInfo.event.title}
                          </div>
                        </div>
                        <div>
                          {bookingItem.staff.last_name +
                            " " +
                            bookingItem.staff.first_name}
                        </div>
                      </div>
                    );
                  }
                  const created_date = new Date(bookingItem.created_at);
                  return (
                    <div
                      style={{
                        backgroundColor: "#fff",
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      onClick={() => handleRedirectPt(bookingItem)}
                    >
                      <div
                        className="over-flow-hidden"
                        style={{
                          width: "9%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          wordBreak: "break-word",
                        }}
                      >
                        {/* {convertMinutesToTimeString(
                            bookingItem.schedule.start_time
                          ) +
                            " - " +
                            moment(bookingItem.schedule.date).format(
                              "DD-MM-yyyy"
                            )} */}
                        {formatTimeRange(
                          eventInfo.event.startStr,
                          eventInfo.event.endStr
                        )}
                      </div>
                      <div
                        className="over-flow-hidden"
                        style={{
                          width: "6%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                        }}
                      >
                        {bookingItem.booking_number}
                      </div>

                      <div
                        className="over-flow-hidden"
                        style={{
                          width: "9.6%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                        }}
                      >
                        {bookingItem.source.name}
                      </div>
                      <div
                        className="over-flow-hidden"
                        style={{
                          width: "9.6%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          wordBreak: "break-word",
                        }}
                      >
                        {bookingItem.location.name}
                      </div>
                      <div
                        className="over-flow-hidden"
                        style={{
                          width: "9.6%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          wordBreak: "break-word",
                        }}
                      >
                        {`${bookingItem.staff.last_name} ${bookingItem.staff.first_name}`}
                      </div>
                      <div
                        className="over-flow-hidden"
                        style={{
                          width: "9.6%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          wordBreak: "break-word",
                        }}
                      >
                        {`${bookingItem.customer.last_name} ${bookingItem.customer.first_name}`}
                      </div>
                      <div
                        className="over-flow-hidden"
                        style={{
                          width: "8%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                        }}
                      >
                        {bookingItem.customer.phone}
                      </div>
                      <div
                        className="over-flow-hidden"
                        style={{
                          width: "12.6%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          wordBreak: "break-all",
                        }}
                      >
                        {bookingItem.customer.email}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          width: "6%",
                        }}
                      >
                        <Badge
                          color="none"
                          className={"badge-" + status?.badge}
                        >
                          {status?.label}
                        </Badge>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          width: "10.4%",
                        }}
                      >
                        {bookingItem.cancelled_at
                          ? bookingItem.cancelled_at
                          : created_date.getFullYear() +
                            "-" +
                            String(created_date.getMonth() + 1).padStart(
                              2,
                              "0"
                            ) +
                            "-" +
                            String(created_date.getDate()).padStart(2, "0") +
                            " " +
                            String(created_date.getHours()).padStart(2, "0") +
                            ":" +
                            String(created_date.getMinutes()).padStart(2, "0") +
                            ":" +
                            String(created_date.getSeconds()).padStart(2, "0")}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          width: "9.6%",
                        }}
                      >
                        <div
                          className="over-flow-hidden table"
                          style={{
                            display:
                              bookingItem?.status === 0 &&
                              bookingItem?.check_in === 1
                                ? "flex"
                                : "none",
                            margin: 0,
                          }}
                        >
                          <Button
                            color="success"
                            outline={true}
                            className="my-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckInPtBooking(bookingItem.id);
                            }}
                          >
                            {i18n.t("check_in")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
BookingPTList.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(BookingPTList);
