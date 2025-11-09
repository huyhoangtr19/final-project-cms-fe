import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Col,
} from "reactstrap";
import MyModalTemplate from "./MyModalTemplate";
import i18n from "../../i18n";

const CustomerDatePicker = ({ isOpen, onClose, onSend, data }) => {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(now);
  const [selectedDate, setSelectedDate] = useState(now);
  const [selectedTime, setSelectedTime] = useState({
    hours: now.getHours().toString().padStart(2, "0"),
    minutes: now.getMinutes().toString().padStart(2, "0"),
  });

  // Generate array of years (current year to current year + 10)
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() + i);

  const months = [
    i18n.t('jan'),
    i18n.t('feb'),
    i18n.t('mar'),
    i18n.t('apr'),
    i18n.t('may'),
    i18n.t('jun'),
    i18n.t('jul'),
    i18n.t('aug'),
    i18n.t('sep'),
    i18n.t('oct'),
    i18n.t('nov'),
    i18n.t('dec'),
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date is before current date/time
  const isBeforeNow = (year, month, day, hours, minutes) => {
    const dateToCheck = new Date(year, month, day, hours, minutes);
    return dateToCheck < now;
  };
  const generateDayDropdown = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    // const firstDay = getFirstDayOfMonth(year, month);
    const currentDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      disabled: isBeforeNow(
        year,
        month,
        i + 1,
        parseInt(selectedTime.hours),
        parseInt(selectedTime.minutes)
      ),
    }));

    return currentDays;
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonthDays = getDaysInMonth(year, month - 1);
    const prevDays = Array.from({ length: firstDay }, (_, i) => ({
      day: prevMonthDays - firstDay + i + 1,
      currentMonth: false,
      disabled: true,
    }));

    const currentDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      disabled: isBeforeNow(
        year,
        month,
        i + 1,
        parseInt(selectedTime.hours),
        parseInt(selectedTime.minutes)
      ),
    }));

    const totalDays = [...prevDays, ...currentDays];
    const remainingDays = 42 - totalDays.length;

    const nextDays = Array.from({ length: remainingDays }, (_, i) => ({
      day: i + 1,
      currentMonth: false,
      disabled: true,
    }));

    return [...totalDays, ...nextDays];
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    if (newDate.getTime() >= now.getTime()) {
      setCurrentDate(newDate);
    }
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleDateSelect = (day, isCurrentMonth, isDisabled) => {
    if (isCurrentMonth && !isDisabled) {
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      setSelectedDate(newDate);
    }
  };
  const handleTimeChange = (type, value) => {
    if (value === "") {
      setSelectedTime({
        ...selectedTime,
        [type]: value,
      });
      return;
    }
   
    // Ensure the value is a number and falls within a valid range
    const numValue = parseInt(value, 10) || 0; // Ensure value is parsed as a number

    let validValue = numValue;

    if (type === "hours") {
      // Allow hour input between 0 and 23
      validValue = Math.min(Math.max(0, numValue), 23);
    } else if (type === "minutes") {
      // Allow minute input between 0 and 59
      validValue = Math.min(Math.max(0, numValue), 59);
    }
    // Pad single-digit values to two digits
    const paddedValue = validValue.toString().padStart(2, "0");
    // Temporarily update the input value before validation
    setSelectedTime({
      ...selectedTime,
      [type]: paddedValue,
    });

    // After a complete input, validate the time (on blur or any other trigger)
    const selectedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(paddedValue),
      type === "hours" ? parseInt(selectedTime.minutes) : parseInt(paddedValue)
    );
    console.log('selectedDateTime',selectedDateTime)
    if (selectedDateTime >= now) {
      // Final validation: Only update state if the time is valid
      setSelectedTime({
        ...selectedTime,
        [type]: paddedValue,
      });
    }
  };
  const formatSend=(dateString, time)=>{
  const timePart = `${time.hours}:${time.minutes}:00`;
    const datePart =new Date(dateString).toLocaleString()
    .slice(0, 9)
    .replace("T", " ")
  const [month, day, year] = datePart.split("/");

  return `${year}-${month}-${day} ${timePart}`;
  }

  const isSelectedDate = (day, isCurrentMonth) => {
    return (
      isCurrentMonth &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };
  useEffect(() => {
    if (data.length) {
      const newDate = new Date(data);
      console.log("new", newDate.getHours());
      setSelectedDate(newDate);
      setSelectedTime({
        hours: String(newDate.getHours()).padStart(2, "0"),
        minutes: String(newDate.getMinutes()).padStart(2, "0"),
      });
    }
  }, [data]);

  // Disable months before current month in current year
  const isMonthDisabled = (monthIndex) => {
    if (currentDate.getFullYear() === now.getFullYear()) {
      return monthIndex < now.getMonth();
    }
    return false;
  };

  const isDayDisabled = (dayIndex) => {
    if (
      currentDate.getFullYear() === now.getFullYear() &&
      currentDate.getMonth() === now.getMonth()
    ) {
      return dayIndex < now.getDay();
    }
    return false;
  };


  return (
    <MyModalTemplate isOpen={isOpen} onClose={onClose}>
      {/* <Card className="shadow" style={{ width: '320px' }}> */}
      {/* <CardBody> */}
      <h5 className="mb-3">{i18n.t('schedule_send')}</h5>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <Button
          color="light"
          onClick={handlePrevMonth}
          className="px-2 py-1"
          disabled={
            currentDate.getFullYear() === now.getFullYear() &&
            currentDate.getMonth() <= now.getMonth()
          }
        >
          ‹
        </Button>

        <div className="d-flex gap-2">
          <UncontrolledDropdown>
            <DropdownToggle caret color="light">
              {currentDate.getFullYear()}
            </DropdownToggle>
            <DropdownMenu>
              {years.map((year) => (
                <DropdownItem
                  key={year}
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setFullYear(year);
                    setCurrentDate(newDate);
                  }}
                >
                  {year}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>

          <UncontrolledDropdown>
            <DropdownToggle caret color="light">
              {months[currentDate.getMonth()]}
            </DropdownToggle>
            <DropdownMenu>
              {months.map((month, index) => (
                <DropdownItem
                  key={month}
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(index);
                    setCurrentDate(newDate);
                  }}
                  disabled={isMonthDisabled(index)}
                >
                  {month}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>
          <UncontrolledDropdown>
            <DropdownToggle caret color="light">
              {selectedDate.getDate()}
            </DropdownToggle>
            <DropdownMenu style={{ maxHeight: 300, overflowY: "auto" }}>
              {generateDayDropdown().map((date, index) => (
                <DropdownItem
                  key={index}
                  onClick={() => {
                    handleDateSelect(
                      date.day,
                      date.currentMonth,
                      date.disabled
                    );
                  }}
                  disabled={isDayDisabled(index)}
                >
                  {date.day}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>

        <Button color="light" onClick={handleNextMonth} className="px-2 py-1">
          ›
        </Button>
      </div>

      <div className="calendar-grid">
        <Row className="text-center mb-2">
          {[i18n.t('monday'), i18n.t('tuesday'), i18n.t('wednesday'), i18n.t('thursday'), i18n.t('friday'), i18n.t('saturday'), i18n.t('sunday')].map((day) => (
            <Col key={day} className="p-1">
              <small className="text-muted">{day}</small>
            </Col>
          ))}
        </Row>

        <Row>
          {generateCalendarDays().map((date, index) => (
            <Col key={index} className="p-1 text-center">
              <Button
                onClick={() =>
                  handleDateSelect(date.day, date.currentMonth, date.disabled)
                }
                color={
                  isSelectedDate(date.day, date.currentMonth)
                    ? "primary"
                    : "secondary"
                }
                outline={!isSelectedDate(date.day, date.currentMonth)}
                className={`${
                  isSelectedDate(date.day, date.currentMonth)
                    ? "rounded-circle"
                    : "border-0"
                } rounded-circle p-0`}
                style={{
                  width: "32px",
                  height: "32px",
                  opacity: date.currentMonth && !date.disabled ? 1 : 0.5,
                }}
                disabled={date.disabled}
              >
                {date.day}
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      <div className="d-flex align-items-center justify-content-center mt-4">
        <Input
          type="text"
          value={selectedTime.hours}
          onChange={(e) => handleTimeChange("hours", e.target.value)}
          className="text-center"
          style={{ width: "60px" }}
          maxLength={selectedTime.hours.startsWith("0") ? 3 : 2}
        />
        <span className="mx-2 h4 mb-0">:</span>
        <Input
          type="text"
          value={selectedTime.minutes}
          onChange={(e) => handleTimeChange("minutes", e.target.value)}
          className="text-center"
          style={{ width: "60px" }}
          maxLength={selectedTime.minutes.startsWith("0") ? 3 : 2}
        />
      </div>

      <Button
        color="primary"
        block
        onClick={() => {
          onSend(formatSend(selectedDate,selectedTime));
        }}
        className="mt-4"
        disabled={isBeforeNow(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          parseInt(selectedTime.hours),
          parseInt(selectedTime.minutes)
        )}
      >
        Send
      </Button>
      {/* </CardBody>
    </Card> */}
    </MyModalTemplate>
  );
};

export default CustomerDatePicker;
