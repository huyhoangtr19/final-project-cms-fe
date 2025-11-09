// Function Name : Customer Page
// Created date :  30/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge, Col, Collapse, Container, Row, Table } from "reactstrap";

import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import MyPagination from "../../components/Common/Mypagination";

import customerService from "../../services/customer.service";
import {
  listStatusBooking,
  STATUS_SALE_PACKAGE_DETAIL,
} from "../../constants/app.const";
import moment from "moment";
import IcDot from "../../assets/icon/IcDot";
import operatorService from "../../services/operator.service";
import sourceService from "../../services/source.service";
import packageService from "../../services/package.service";
import IcPlus from "../../assets/icon/IcPlus";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import { debounce } from "lodash";

const BookingHistory = (props) => {
  const path = useLocation();
  const navigate = useNavigate();
  const { id, cId } = useParams();
  const { permissionUser } = useAppSelector((state) => state.auth);
  //   const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const [customers, setCustomers] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [city, setCity] = useState("");
  const [listLocation, setListLocation] = useState([]);
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [listSource, setListSource] = useState([]);
  const [keySort, setKeySort] = useState("create_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [packageSel, setPackageSel] = useState("");
  const [listPackage, setListPackage] = useState([]);
  const handleResetFilter = () => {
    setSearchName("");
    setLocation("");
    setSource("");
    setCity("");
    setPackageSel("");
  };

  const handleSortSchedule = () => {
    if (keySort === "schedule") {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setKeySort("schedule");
      setSortOrder("desc");
    }
  };
  const handleSortCreateAt = () => {
    if (keySort === "create_at") {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setKeySort("create_at");
      setSortOrder("desc");
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
  const handleGetSource = async () => {
    try {
      const response = await sourceService.getListSource();
      if (response.success) {
        setListSource(
          response.data.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          })
        );
      }
    } catch (e) { }
  };

  const getListPackage = async () => {
    try {
      const payload = {
        customer_id: cId,
        limit: -1,
      };
      const res = await customerService.getListPackageCustomer(payload);
      if (res.success) {
        const resData = res.data.map((item) => {
          return {
            value: item.package.id,
            label: item.package.package_name,
          };
        });
        setListPackage(resData);
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleGetListCustomer = async () => {
    try {
      const payload = {
        booking_id: searchName,
        status: city,
        limit: 20,
        page: page,
        source: source,
        package_id: packageSel,
        location: location,
        key_sort: keySort,
        order: sortOrder,
      };

      const res = await customerService.getListBookingForDetail(cId, payload);
      setCustomers(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRedirect = (customer) => {
    // props.router.navigate(`/customer/detail/${customer.id}`);
  };

  const convertMinutesToTimeString = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };
  const getStatus = (status) => {
    const statusObj = listStatusBooking.find((item) => item.value === status);
    return statusObj;
  };
  const canViewHistory = useMemo(() => {
    return permissionUser.includes("customer:view_booking_history");
  }, [permissionUser]);

  useEffect(() => {
    getListLocation();
    getListPackage();
    handleGetSource();
  }, []);

  useEffect(() => {
    if (canViewHistory) {
      handleGetListCustomer();
    }
  }, [
    page,
    searchName,
    city,
    cId,
    location,
    source,
    sortOrder,
    keySort,
    packageSel,
  ]);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {
    if (!props.isActive || customers.length === 0) return;

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
  }, [props.isActive, customers]);

  return (
    <React.Fragment>
      <div className="page-container">
        <div>
          <div className="filter-container">
            <div className="filter-header">
              <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
                <button
                  className="filter-clear"
                >
                  {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
                </button>
                <h5 className="filter-title">{i18n.t("booking_history")}</h5>
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
                <label className="filter-label">{i18n.t("booking_id")}</label>
                <InputSearch
                  value={searchName}
                  onChange={(e) => setSearchName(e)}
                  placeholder={i18n.t("booking_id")}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("package")}</label>
                <MyDropdown
                  options={listPackage}
                  selected={packageSel}
                  displayEmpty={true}
                  setSelected={(e) => setPackageSel(e)}
                  placeholder={i18n.t("package")}
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
                <label className="filter-label">{i18n.t("status")}</label>
                <MyDropdown
                  options={listStatusBooking}
                  selected={city}
                  displayEmpty={true}
                  setSelected={(e) => setCity(e)}
                  placeholder={i18n.t("status")}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("source")}</label>
                <MyDropdown
                  options={listSource}
                  selected={source}
                  displayEmpty={true}
                  setSelected={(e) => setSource(e)}
                  placeholder={i18n.t("source")}
                />
              </div>
            </Collapse>
          </div>
          <div>
            <Col>
              <div className="d-flex flex-row gap-3 justify-content-end mb-3">
                <button
                  className="btn btn-primary btn-block d-flex gap-1"
                  onClick={() => {
                    navigate(`/booking/create`);
                  }}
                >
                  <IcPlus />
                  <div className="" style={{ lineHeight: "17px" }}>
                    {i18n.t("add_new_booking")}
                  </div>
                </button>
              </div>
            </Col>
            {/* <Col md={5}>
                <div className="d-flex flex-row gap-4 justify-content-end">
                  <Link to="create">
                    <button className="btn btn-primary btn-block px-3 d-flex gap-1">
                      <IcPlus />
                      <div className="" style={{ lineHeight: "17px" }}>
                        Add new contact
                      </div>
                    </button>
                  </Link>
                </div>
              </Col> */}
          </div>
          {customers.length > 0 ? (
            <>
              <div className="before-table" ref={beforeTableRef}></div>
              <div className="table-container" ref={tableContainerRef}>
                <Table className="table mb-0">
                  <thead>
                    <tr>
                      <th>{i18n.t("booking_id")}</th>
                      <th>{i18n.t("status")}</th>
                      <th>{i18n.t("source")}</th>
                      {/* <th>
                        <div
                          className="d-flex gap-1 align-items-center"
                          onClick={handleSortCreateAt}
                        >
                          {i18n.t("create_date")}
                          {keySort !== "create_at" ? (
                            <div className="d-flex flex-col">
                              <i className="bx bxs-up-arrow"></i>
                              <i className="bx bxs-down-arrow"></i>
                            </div>
                          ) : sortOrder === "asc" ? (
                            <i className="bx bxs-up-arrow"></i>
                          ) : (
                            <i className="bx bxs-down-arrow"></i>
                          )}
                        </div>
                      </th> */}
                      <th>{i18n.t("package_name")}</th>
                      <th>{i18n.t("class_information")}</th>
                      {/* <th>
                        <div
                          className="d-flex gap-1 align-items-center"
                          onClick={handleSortSchedule}
                        >
                          {i18n.t("schedule")}
                          {keySort !== "schedule" ? (
                            <div className="d-flex flex-col">
                              <i className="bx bxs-up-arrow"></i>
                              <i className="bx bxs-down-arrow"></i>
                            </div>
                          ) : sortOrder === "asc" ? (
                            <i className="bx bxs-up-arrow"></i>
                          ) : (
                            <i className="bx bxs-down-arrow"></i>
                          )}
                        </div>
                      </th> */}
                      <th>{i18n.t("trainer")}</th>
                      <th>Check-in</th>
                      <th>{i18n.t("location")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer, index) => (
                      <tr key={index} onClick={() => handleRedirect(customer)}>
                        <td>{customer.booking_number}</td>
                        <td>
                          <Badge
                            color="none"
                            className={"badge-" + getStatus(customer.status).badge}
                          >
                            {getStatus(customer.status).label}
                          </Badge>
                        </td>
                        <td>{customer?.source?.name}</td>
                        {/* <td>
                          {moment(customer.created_at).format("DD/MM/yyyy")}
                        </td> */}
                        <td>{customer.package.name || "-"}</td>
                        <td>
                          {customer.class.name || "-"}
                          <br />
                          {convertMinutesToTimeString(
                            customer.schedule.start_time
                          )}
                          {" - "}
                          {moment(customer.schedule.date).format("DD/MM/yyyy")}
                        </td>

                        <td>
                          {customer.staff.last_name} {customer.staff.first_name}
                        </td>
                        <td>
                          {customer.checked_in_at
                            ? `${moment(customer.checked_in_at).format(
                              "HH:mm"
                            )} - ${moment(customer.checked_in_at).format(
                              "DD/MM/yyyy"
                            )}`
                            : "--"}
                        </td>
                        <td>{customer.location.name || "-"}</td>
                        {/* <td>
                          <div className="d-flex flex-row gap-1 justify-content-between">
                            <div
                              style={{
                                cursor: "pointer",
                                display: "inline-block",
                                border: `1px solid ${getStateColor(
                                  customer.status
                                )}`,

                                borderRadius: "20px",
                                color: getStateColor(customer.status),
                              }}
                              className="px-1"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(
                                  customer.id,
                                  customer.status
                                );
                              }}
                            >
                              {customer.status === 0 ? (
                                <Badge color="none" className="badge-error">{i18n.t("inactive")}</Badge>
                              ) : customer.status === 1 ? (
                                <Badge color="none" className="badge-success">{i18n.t("active")}</Badge>
                              ) : (
                                <Badge color="none" className="badge-error">{i18n.t("expired")}</Badge>
                              )}
                            </div>
                          </div>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          ) : (
            <div className="d-flex justify-content-center d-flex align-items-center h-100">
              <div>{i18n.t("no_record_exist")}</div>
            </div>
          )}
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
      </div>
    </React.Fragment>
  );
};
BookingHistory.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default BookingHistory;

