// Function Name : Booking today
// Created date :  22/8/24            by :  VinhLQ
// Updated date :                     by :  VinhLQ

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { Button, Col, Container, Row, Table } from "reactstrap";
import withRouter from "../../components/Common/withRouter";
import Breadcrumb from "../../components/Common/Breadcrumb";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdownMultiple from "../../components/Common/MyDropdownMultiple";
import MyDropdown from "../../components/Common/MyDropdown";
import { STATUS_BOOKING, listStatusBooking } from "../../constants/app.const";
import bookingService from "../../services/booking.service";
import operatorService from "../../services/operator.service";
import moment from "moment";
import MyPagination from "../../components/Common/Mypagination";
import sourceService from "../../services/source.service";
import { toast } from "react-toastify";
import QRCodeCheckInScanner from "../../components/Common/QRCodeCheckInScanner";
import customerService from "../../services/customer.service";
import i18n from "../../i18n";

const listSection = [
  { name: i18n.t("reserved"), type: STATUS_BOOKING.RESERVER },
  { name: i18n.t("in_class"), type: STATUS_BOOKING.IN_CLASS },
  { name: i18n.t("no_show"), type: STATUS_BOOKING.NO_SHOW },
];

const BookingToday = (props) => {
  document.title = "Booking Today | Fitness CMS";
  const [typeScreen, setTypeScreen] = useState(STATUS_BOOKING.RESERVER);
  const [booking, setBookings] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    locations: [],
    sources: [],
  });
  const [params, setParams] = useState({
    keyword: "",
    id: "",
    locations: [],
    source: "",
    date: moment().format("yyyy-MM-DD"),
  });
  const [showCamera, setShowCamera] = useState(false);
  const isCheckingRef = useRef(false);

  const handleGetListBooking = async () => {
    try {
      const payload = {
        ...params,
        status: typeScreen,
        limit: 20,
        page: page,
      };
      const res = await bookingService.getListBooking(payload);
      setBookings(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatus = (status) => {
    const statusObj = listStatusBooking.find((item) => item.value === status);
    return statusObj;
  };

  const handleRedirect = (booking) => {
    props.router.navigate(`/booking/detail/${booking.id}?today=true`);
  };

  const handleResetFilter = () => {
    setParams({
      keyword: "",
      id: "",
      locations: [],
      source: "",
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

  const handleCheckInBooking = async (bookingId) => {
    try {
      const response = await bookingService.checkInBooking(bookingId);
      if (response.success) {
        await handleGetListBooking();
        toast.success("Check in booking successfully", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {}
  };

  const handleClick = (section) => {
    setBookings([]);
    setTypeScreen(section.type);
  };

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
        toast.error("Check in đã xảy ra lỗi", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    }
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
    handleGetListBooking();
  }, [params, typeScreen, page]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content ">
        <Container fluid className="">
          <Breadcrumb
            title={i18n.t("booking")}
            breadcrumbItem={i18n.t("booking_today")}
          />

          <Row className="bg-white ">
            {listSection.map((section) => (
              <Col
                md={2}
                key={section.type}
                onClick={() => handleClick(section)}
                className="text-center"
                style={{
                  padding: "5px 0",
                  borderBottom:
                    typeScreen === section.type ? "2px solid #1d39c4" : "none",
                  color: typeScreen === section.type ? "#1d39c4" : "inherit",
                }}
              >
                {section.name}
              </Col>
            ))}
          </Row>
          <Row className="mt-1 bg-white page-container">
            <div>
              <h5 className="mt-2 mb-4">{i18n.t("all_bookings")}</h5>
              <Row>
                <Col md={9}>
                  <Row className="row-gap-2">
                    <Col md={4} xl={3} xxl={2}>
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
                    </Col>
                    <Col md={4} xl={3} xxl={2}>
                      <InputSearch
                        value={params.id}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            id: e,
                          }))
                        }
                        placeholder={i18n.t("booking_id")}
                      />
                    </Col>
                    <Col md={4} xl={3}>
                      <MyDropdownMultiple
                        options={data.locations}
                        placeholder={i18n.t('locations')}
                        selected={params.locations}
                        setSelected={(selected) =>
                          setParams((prev) => ({
                            ...prev,
                            locations: selected,
                          }))
                        }
                        displayEmpty={true}
                      />
                    </Col>
                    <Col md={3} xxl={2}>
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
                    </Col>
                    <Col md={2} xxl={1}>
                      <div
                        className="btn btn-outline"
                        onClick={handleResetFilter}
                      >
                        {i18n.t("reset")}
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col md={3} className="d-flex justify-content-end">
                  <QRCodeCheckInScanner
                    onResult={handleScanCheckIn}
                    showCamera={showCamera}
                    setShowCamera={setShowCamera}
                  />
                </Col>
              </Row>
              {booking.length > 0 ? (
                <div className="table-responsive">
                  <Table className="table mb-0">
                    <thead>
                      <tr>
                        <th>{i18n.t("booking_id")}</th>
                        <th>{i18n.t("source")}</th>
                        <th>{i18n.t("location")}</th>
                        <th>{i18n.t("class_name")}</th>
                        <th>{i18n.t("schedule")}</th>
                        <th>{i18n.t("trainer")}</th>
                        <th> {i18n.t("customer")}</th>
                        <th>{i18n.t("email")}</th>
                        <th>{i18n.t("phone")}</th>
                        {typeScreen == STATUS_BOOKING.RESERVER && (
                          <th>{i18n.t("action")}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {booking.map((booking, index) => {
                        const status = getStatus(booking.status);
                        return (
                          <tr
                            key={index}
                            onClick={() => handleRedirect(booking)}
                          >
                            <td>{booking.booking_number}</td>
                            <td>{booking.source.name}</td>
                            <td>{booking.location.name}</td>
                            <td>{booking.class.name}</td>
                            <td>
                              {convertMinutesToTimeString(
                                booking.schedule.start_time
                              ) +
                                " - " +
                                moment(booking.schedule.date).format(
                                  "DD-MM-yyyy"
                                )}
                            </td>
                            <td>
                              {`${booking.staff.last_name} ${booking.staff.first_name}`}
                            </td>
                            <td>
                              {`${booking.customer.last_name} ${booking.customer.first_name}`}
                            </td>
                            <td>{booking.customer.email}</td>
                            <td>{booking.customer.phone}</td>
                            {typeScreen == STATUS_BOOKING.RESERVER && (
                              <td>
                                <Button
                                  color="success"
                                  outline={true}
                                  className="px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckInBooking(booking.id);
                                  }}
                                >
                                  {i18n.t("check_in")}
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
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
                </div>
              ) : (
                <div className="d-flex justify-content-center d-flex align-items-center h-100">
                  <div>{i18n.t('there_are_no_data_exist')}</div>
                </div>
              )}
            </div>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
BookingToday.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(BookingToday);
