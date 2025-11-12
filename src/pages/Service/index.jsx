// Function Name : Service Page
// Created date :  28/7/24             by :  NgVinh
// Updated date :  1/8/24              by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { Badge, Button, Col, Collapse, Container, Input, Row, Table } from "reactstrap";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import IcPlus from "../../assets/icon/IcPlus";
import IcDot from "../../assets/icon/IcDot";
import MyPagination from "../../components/Common/Mypagination";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import serviceService from "../../services/service.service";
import withRouter from "../../components/Common/withRouter";
import { useAppSelector } from "../../hook/store.hook";
import Breadcrumb from "../../components/Common/Breadcrumb";
import ModalService from "./ModalService";
import IcTrash from "../../assets/icon/IcTrash";
import { toast } from "react-toastify";
import i18n from "../../i18n";
import { debounce } from "lodash";

const listStatus = [
  { value: 1, label: i18n.t("active") },
  { value: 0, label: i18n.t("inactive") },
];

const Service = (props) => {
  document.title = "Service | Fitness CMS";
  const path = useLocation();
  const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [services, setServices] = useState([]);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [city, setCity] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [isShowService, setIsShowService] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdd, setIsAdd] = useState(false);

  const handleResetFilter = () => {
    setSearchName("");
    setCity("");
  }

  const handleCheckboxChange = (service) => {
    setSelectedServices((prevSelected) => {
      if (prevSelected.includes(service)) {
        return prevSelected.filter((no) => no !== service);
      } else {
        return [...prevSelected, service];
      }
    });
  };
  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedServices(services.map((item) => item.id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleGetListService = async () => {
    try {
      const payload = {
        keyword: searchName,
        active: city,
        limit: 20,
        page: page,
      };
      setSelectedServices([]);
      const res = await serviceService.getListServices(payload);
      setServices(res.data);

      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRedirect = (service) => {
    console.log(service);
    setIsAdd(false);
    setSelectedServiceDetail(service);
    setIsShowService(true);
  };

  const handleUpdateStatus = async (id, active) => {
    try {
      const res = await serviceService.updateStatusService(
        id,
        active === 1 ? 0 : 1
      );
      if (res.success) {
        toast.success(i18n.t("update_status_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListService();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteAService = async (id) => {
    try {
      const res = await serviceService.deleteAService(id);
      if (res.success) {
        toast.success(i18n.t("del_service_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListService();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setDeleteId("");
    }
  };
  const handleDeleteMulti = async () => {
    try {
      const res = await serviceService.deleteMultiService(selectedServices);
      if (res.success) {
        toast.success(i18n.t("del_multiple_service_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListService();
      }
    } catch (e) {
      if (e.message && e.message === "product_purchased") {
        toast.error(i18n.t("delete_service_fail"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
      console.log(e);
    }
  };
  const handleDeleteModal = () => {
    if (deleteId) {
      handleDeleteAService(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };
  const isAllChecked = useMemo(() => {
    return services.length === selectedServices.length;
  }, [selectedServices, services]);

  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t("popup_del_this_service")
      : i18n.t("popup_del_selected_service");
  }, [deleteId]);

  useEffect(() => {
    handleGetListService();
  }, [page, searchName, city]);

  const canAddService = useMemo(() => {
    return permissionUser.includes("service:create");
  }, [permissionUser]);

  const canUpdateStatus = useMemo(() => {
    return permissionUser.includes("service:update_status");
  }, [permissionUser]);

  const canDelete = useMemo(() => {
    return permissionUser.includes("service:delete");
  }, [permissionUser]);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (services.length === 0) return;

    const scrollContainer = tableContainerRef.current;
    const table = scrollContainer.querySelector('table');

    if (!scrollContainer || !table) return;

    const updateOverflow = () => {
      const isOverflowing = table.scrollWidth > scrollContainer.clientWidth;
      scrollContainer.style.overflowX = isOverflowing ? 'auto' : 'unset';
    };

    const debouncedUpdate = debounce(updateOverflow, 100); // 100ms debounce
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener("sidebar-toggled", debouncedUpdate);
    debouncedUpdate();

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener("sidebar-toggled", debouncedUpdate);
      debouncedUpdate.cancel();
    };
  }, [services]);

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="content-container">
          <Breadcrumb
            title={i18n.t("service")}
            breadcrumbItem={i18n.t("service_list")}
          />
          <div className="filter-container">
            <div className="filter-header">
              <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
                <button
                  className="filter-clear"
                >
                  {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
                </button>
                <h5 className="filter-title">{i18n.t("service_list")}</h5>
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
                <label className="filter-label">{i18n.t("name")}</label>
                <InputSearch
                  value={searchName}
                  onChange={(e) => setSearchName(e)}
                  placeholder={`ID,  ${i18n.t("name")}`}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("status")}</label>
                <MyDropdown
                  options={listStatus}
                  selected={city}
                  displayEmpty={true}
                  setSelected={(e) => setCity(e)}
                  placeholder={i18n.t("status")}
                />
              </div>
            </Collapse>
          </div>
          <div className="page-container">
            {!hasOperator && props.type !== "create" ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <p>{i18n.t("operator_info_missing")}</p>
                <Link to="/settings?tab=4">
                  <button className="btn btn-primary btn-block align-self-center rounded-3">
                    {i18n.t("create_operator")}
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="action-buttons">
                  <button
                    style={{
                      display: canAddService ? "block" : "none",
                    }}
                    className="btn btn-primary btn-block px-2 d-flex gap-1"
                    onClick={() => {
                      setIsAdd(true);
                      setSelectedServiceDetail(null);
                      setIsShowService(true);
                    }}
                  >
                    <IcPlus />
                    <div className="" style={{ lineHeight: "17px" }}>
                      {i18n.t("add_new_service")}
                    </div>
                  </button>
                  <Button
                    style={{
                      display: canDelete ? "block" : "none",
                    }}
                    color="danger"
                    outline={true}
                    disabled={selectedServices.length === 0}
                    onClick={() => {
                      if (selectedServices.length > 0) {
                        setIsOpen(true);
                      }
                    }}
                  >
                    {i18n.t("delete_selected")}
                  </Button>
                </div>
                {services.length > 0 ? (
                  <>
                    <div className="before-table"></div>
                    <div className="table-container" ref={tableContainerRef}>
                      <Table className="table mb-0">
                        <thead>
                          <tr>
                            {canDelete && (
                              <th>
                                <div onClick={handleCheckAll}>
                                  <Input
                                    type="checkbox"
                                    checked={isAllChecked}
                                    onChange={() => { }}
                                  />
                                </div>
                              </th>
                            )}

                            <th>{i18n.t("service_id")}</th>
                            <th>{i18n.t("service_name")}</th>
                            <th>{i18n.t("applied_location")}</th>
                            <th
                              style={{
                                width: i18n.language === "en" ? 130 : 195,
                              }}
                            >
                              {i18n.t("action")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((service, index) => (
                            <tr key={index} onClick={() => handleRedirect(service)}>
                              {canDelete && (
                                <td>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCheckboxChange(service.id);
                                    }}
                                  >
                                    <Input
                                      type="checkbox"
                                      checked={selectedServices.includes(
                                        service.id
                                      )}
                                      onChange={() => { }}
                                    />
                                  </div>
                                </td>
                              )}
                              <td>{service.id}</td>
                              <td>{service.name}</td>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8,
                                  }}
                                >
                                  {service.locations.map((location, index) => (
                                    <div
                                      key={index}
                                      className=""
                                      style={{
                                        padding: "2px 5px",
                                        backgroundColor: "#F5F5F5",
                                        color: "#000",
                                        fontSize: "10px",
                                      }}
                                    >
                                      {location.name}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex flex-row gap-1 justify-content-between align-items-center">
                                  <div
                                    style={{
                                      cursor: canUpdateStatus
                                        ? "pointer"
                                        : "none",
                                    }}
                                    className="px-1"
                                    type="button"
                                    onClick={(e) => {
                                      if (canUpdateStatus) {
                                        handleUpdateStatus(
                                          service.id,
                                          service.active
                                        );
                                      }
                                      e.stopPropagation();
                                    }}
                                  >
                                    {service.active === 0 ? (
                                      <Badge color="none" className="badge-error">{i18n.t("inactive")}</Badge>
                                    ) : (
                                      <Badge color="none" className="badge-success">{i18n.t("active")}</Badge>
                                    )}
                                  </div>
                                  <button
                                    className={"btn btn-" + (!service.purchased ? "delete-outline" : "outline-danger disabled")}
                                    style={{
                                      display: canDelete ? "block" : "none",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!service.purchased) {
                                        setIsOpen(true);
                                        setDeleteId(service.id);
                                      }
                                    }}
                                  >
                                    {i18n.t("delete")}
                                  </button>
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => handleRedirect(service)}
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
                  </>
                ) : (
                  <div className="d-flex justify-content-center d-flex align-items-center h-100">
                    <div>{i18n.t("no_services_exist")}</div>
                  </div>
                )}
              </>
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
          {isShowService && (
            <ModalService
              isOpen={isShowService}
              onClose={() => setIsShowService(false)}
              onAdd={handleGetListService}
              isAdd={isAdd}
              serviceInfo={selectedServiceDetail}
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
      </div>
    </React.Fragment>
  );
};
Service.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(Service);
