// Function Name : Customer Page
// Created date :  30/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useLocation, useParams } from "react-router-dom";
import { Badge, Col, Collapse, Container, Row, Table } from "reactstrap";

import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import MyPagination from "../../components/Common/Mypagination";
import ModalPurchaseHistoryStatus from "./ModalPurchaseHistoryStatus";

import customerService from "../../services/customer.service";
import { STATUS_SALE_PACKAGE_DETAIL } from "../../constants/app.const";
import moment from "moment";
import IcDot from "../../assets/icon/IcDot";
import { toast } from "react-toastify";
import operatorService from "../../services/operator.service";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import { debounce } from "lodash";

const PurchaseHistory = (props) => {
  const path = useLocation();
  const { id, cId } = useParams();
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [customers, setCustomers] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [city, setCity] = useState("");
  const [listLocation, setListLocation] = useState([]);
  const [location, setLocation] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [salePackage, setSalePackage] = useState(null);

  const handleResetFilter = () => {
    setSearchName("");
    setLocation("");
    setCity("");
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
  const handleGetListCustomer = async () => {
    try {
      const payload = {
        keyword: searchName,
        status: city,
        limit: 20,
        page: page,
        location: location,
      };

      const res = await customerService.getListPurchaseForDetail(cId, payload);
      setCustomers(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  const getStateColor = (status) => {
    switch (status) {
      case 0:
        return "#FF0000";
      case 1:
        return "#1EAD07";
      case 2:
        return "#5D5D5D";
    }
  };

  const handleRedirect = (customer) => {
    // props.router.navigate(`/customer/detail/${customer.id}`);
  };

  const openModalPurchaseHistoryStatus = (salePackage) => {
    setOpenModal(true);
    setSalePackage(salePackage);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const newStatus = status === 1 ? 0 : 1;
      const res = await customerService.updateStatusCustomerPurchase(
        id,
        newStatus
      );
      if (res.success) {
        handleGetListCustomer();
        toast.success("Update booking purchase success", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log(e);
      if (e.message && e.message == "package_is_booked") {
        toast.error("Package has already booked ", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    }
  };
  const canViewPurchase = useMemo(() => {
    return permissionUser.includes("customer:view_purchasing_history");
  }, [permissionUser]);
  useEffect(() => {
    getListLocation();
  }, []);

  useEffect(() => {
    if (canViewPurchase) {
      handleGetListCustomer();
    }
  }, [page, searchName, city, cId, location]);

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
        <div className="filter-container">
          <div className="filter-header">
            <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
              <button
                className="filter-clear"
              >
                {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
              </button>
              <h5 className="filter-title">{i18n.t("purchase_history")}</h5>
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
              <label className="filter-label">{i18n.t("sales_order_id")}</label>
              <InputSearch
                value={searchName}
                onChange={(e) => setSearchName(e)}
                placeholder={`${i18n.t("sales_order_id")}/${i18n.t(
                  "package_name"
                )}`}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">{i18n.t("status")}</label>
              <MyDropdown
                options={STATUS_SALE_PACKAGE_DETAIL}
                selected={city}
                displayEmpty={true}
                setSelected={(e) => setCity(e)}
                placeholder={i18n.t("status")}
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
          </Collapse>
        </div>
        <div>
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
                    <th>{i18n.t("sales_order_id")}</th>
                    <th>{i18n.t("create_date")}</th>
                    <th>{i18n.t("package_name")}</th>
                    <th>{i18n.t("amount")}</th>
                    <th>{i18n.t("start_date")}</th>
                    <th>{i18n.t("end_date")}</th>
                    <th>{i18n.t("remaining_sessions")}</th>
                    <th>{i18n.t("location")}</th>
                    <th>{i18n.t("action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr
                      key={index}
                      onClick={() => openModalPurchaseHistoryStatus(customer)}
                    >
                      <td>{customer.sale_order_number}</td>
                      <td>
                        {moment(customer.created_at).format("DD/MM/yyyy")}
                      </td>
                      <td>{customer.package.name || "-"}</td>
                      <td>{customer.amount}</td>
                      <td>
                        {moment(customer.start_date).format("DD/MM/yyyy")}
                      </td>
                      <td>
                        {moment(customer.end_date).format("DD/MM/yyyy")}
                      </td>
                      <td>
                        {customer.sessions
                          ? `${customer.sessions - customer.booking_count}/${customer.sessions
                          }`
                          : "-"}
                      </td>
                      <td>{customer.location.name || "-"}</td>
                      <td>
                        <div className="d-flex flex-row gap-1 justify-content-between">
                          <div
                            className="px-1"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              [0, 1].includes(customer.status) &&
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
                            ) : customer.status === 3 ? (
                              <Badge color="none" className="badge-primary">{i18n.t("transfert")}</Badge>
                            ) : customer.status === 4 ? (
                              <Badge color="none" className="badge-onhold">{i18n.t("on_hold")}</Badge>
                            ) : (
                              <Badge color="none" className="badge-error">{i18n.t("expired")}</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-center d-flex align-items-center h-100">
            <div>{i18n.t('no_record_exist')}</div>
          </div>
        )}
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
      <ModalPurchaseHistoryStatus
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        afterSubmit={handleGetListCustomer}
        salePackage={salePackage}
      />
    </React.Fragment>
  );
};
PurchaseHistory.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default PurchaseHistory;
