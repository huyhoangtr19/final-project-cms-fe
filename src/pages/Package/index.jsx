// Function Name : Package Page
// Created date :  1/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { Badge, Button, Col, Collapse, Container, Input, Row, Table } from "reactstrap";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import IcPlus from "../../assets/icon/IcPlus";
import MyPagination from "../../components/Common/Mypagination";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import withRouter from "../../components/Common/withRouter";
import { useAppSelector } from "../../hook/store.hook";
import Breadcrumb from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import ModalPackage from "./ModalPackage";
import packageService from "../../services/package.service";
import serviceService from "../../services/service.service";
import { listKindPackage } from "../../constants/app.const";
import operatorService from "../../services/operator.service";
import i18n from "../../i18n";
import { debounce } from "lodash";

const listStatus = [
  { value: 1, label: i18n.t("active") },
  { value: 0, label: i18n.t("inactive") },
];

const Package = (props) => {
  document.title = "Package | Actiwell System";
  const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const [packages, setPackages] = useState([]);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [selectedPackageDetail, setSelectedPackageDetail] = useState(null);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [city, setCity] = useState("");
  const [kind, setKind] = useState("");
  const [service, setService] = useState("");
  const [listService, setListService] = useState([]);
  const [location, setLocation] = useState("");
  const [listLocation, setListLocation] = useState([]);
  const [deleteId, setDeleteId] = useState("");
  const [isShowPackage, setIsShowPackage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdd, setIsAdd] = useState(false);

  const handleResetFilter = () => {
    setSearchName("");
    setCity("");
    setKind("");
    setLocation("");
    setService("");
  }

  const handleCheckboxChange = (choose) => {
    setSelectedPackages((prevSelected) => {
      if (prevSelected.includes(choose)) {
        return prevSelected.filter((no) => no !== choose);
      } else {
        return [...prevSelected, choose];
      }
    });
  };
  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedPackages(packages.map((item) => item.id));
    } else {
      setSelectedPackages([]);
    }
  };

  const handleGetListPackage = async () => {
    try {
      const payload = {
        keyword: searchName,
        active: city,
        kind: kind,
        location: location,
        service: service,
        limit: 20,
        page: page,
      };
      setSelectedPackages([]);
      const res = await packageService.getListPackages(payload);
      setPackages(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };
  const handleGetListLocation = async () => {
    try {
      const response = await operatorService.getListLocationForOperator();
      if (response.success) {
        setListLocation(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          })
        );
      }
    } catch (e) {
      console.log("error: ", e)
    }
  };
  const handleRedirect = (choose) => {
    setIsAdd(false);
    setSelectedPackageDetail(choose);
    setIsShowPackage(true);
  };
  const handleGetListService = async () => {
    try {
      const response = await serviceService.getListServiceForOperator();
      if (response.success) {
        setListService(
          response.data.map((el) => {
            return { value: el.id, label: el.name }
          }));
      };
    } catch (e) {
      console.log("error: ", e)
    }
  };

  const handleUpdateStatus = async (id, active) => {
    try {
      const res = await packageService.updateStatusPackages(
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
        handleGetListPackage();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteAPackage = async (id) => {
    try {
      const res = await packageService.deleteAPackages(id);
      if (res.success) {
        toast.success("Delete Package successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListPackage();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setDeleteId("");
    }
  };
  const handleDeleteMulti = async () => {
    try {
      const res = await packageService.deleteMultiPackages(selectedPackages);
      if (res.success) {
        toast.success("Delete Multiple Package successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListPackage();
      }
    } catch (e) {
      if (e.message && e.message === "package_purchased") {
        toast.error("Delete Multiple Package fail", {
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
      handleDeleteAPackage(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };
  const getState = (kindId) => {
    switch (kindId) {
      case 0:
        return i18n.t("membership");
      case 1:
        return i18n.t("group");
      case 2:
        return i18n.t("private");
      default:
        return "-";
    }
  };
  const isAllChecked = useMemo(() => {
    return packages.length === selectedPackages.length;
  }, [selectedPackages, packages]);

  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t("popup_del_this_package")
      : i18n.t("popup_del_selected_package");
  }, [deleteId]);

  const canAddPackage = useMemo(() => {
    return permissionUser.includes("package:create");
  }, [permissionUser]);

  const canUpdateStatus = useMemo(() => {
    return permissionUser.includes("package:update_status");
  }, [permissionUser]);

  const canDelete = useMemo(() => {
    return permissionUser.includes("package:delete");
  }, [permissionUser]);

  useEffect(() => {
    if (listLocation.length) {
      handleGetListPackage();
    }
  }, [page, searchName, city, listLocation, location, kind, service]);

  useEffect(() => {
    handleGetListLocation();
    handleGetListService();
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (packages.length === 0) return;

    const scrollContainer = tableContainerRef.current;
    if (!scrollContainer) return

    const table = scrollContainer.querySelector('table');
    if (!table) return;

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
  }, [packages]);

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="content-container">
          <Breadcrumb
            title={i18n.t("package")}
            breadcrumbItem={i18n.t("package_list")}
          />
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
              <div className="p-0">
                <div className="filter-container">
                  <div className="filter-header">
                    <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
                      <button
                        className="filter-clear"
                      >
                        {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
                      </button>
                      <h5 className="filter-title">{i18n.t("package_list")}</h5>
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
                      <label className="filter-label">{`${i18n.t("package_id")}, ${i18n.t("name")}`}</label>
                      <InputSearch
                        value={searchName}
                        onChange={(e) => setSearchName(e)}
                        placeholder={`${i18n.t("package_id")}, ${i18n.t("name")}`}
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
                      <label className="filter-label">{i18n.t("kind")}</label>
                      <MyDropdown
                        options={listKindPackage}
                        selected={kind}
                        displayEmpty={true}
                        setSelected={(e) => setKind(e)}
                        placeholder={i18n.t("kind")}
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
                    <div className="filter-group">
                      <label className="filter-label">{i18n.t("service")}</label>
                      <MyDropdown
                        options={listService}
                        selected={service}
                        displayEmpty={true}
                        setSelected={(e) => setService(e)}
                        placeholder={i18n.t("service")}
                      />
                    </div>
                  </Collapse>
                </div>
                <div className="action-buttons">
                  <button
                    style={{
                      display: canAddPackage ? "block" : "none",
                    }}
                    className="btn btn-primary btn-block px-2 d-flex gap-1"
                    onClick={() => {
                      setIsAdd(true);
                      setSelectedPackageDetail(null);
                      setIsShowPackage(true);
                    }}
                  >
                    <IcPlus />
                    <div className="" style={{ lineHeight: "17px" }}>
                      {i18n.t("add_new_package")}
                    </div>
                  </button>

                  <Button
                    color="danger"
                    outline={true}
                    style={{
                      display: canDelete ? "block" : "none",
                    }}
                    disabled={selectedPackages.length === 0}
                    onClick={() => {
                      if (selectedPackages.length > 0) {
                        setIsOpen(true);
                      }
                    }}
                  >
                    {i18n.t("delete_selected")}
                  </Button>
                </div>
                {packages.length > 0 ? (
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

                            <th>{i18n.t("package_id")}</th>
                            <th>{i18n.t("package_name")}</th>
                            <th>{i18n.t("kind")}</th>
                            <th>{i18n.t("months")}</th>
                            <th>{i18n.t("sessions")}</th>
                            <th style={{ textAlign: 'right' }}>{i18n.t("base_price")}</th>
                            <th style={{ textAlign: 'right' }}>{i18n.t("total")}</th>
                            <th>{i18n.t("applied_location")}</th>
                            <th>{i18n.t("service")}</th>
                            <th
                              style={{
                                width: i18n.language === "en" ? 130 : 195,
                              }}
                            >
                              {i18n.t('action')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {packages.map((item, index) => (
                            <tr key={index} onClick={() => handleRedirect(item)}>
                              {canDelete && (
                                <td>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCheckboxChange(item.id);
                                    }}
                                  >
                                    <Input
                                      type="checkbox"
                                      checked={selectedPackages.includes(item.id)}
                                      onChange={() => { }}
                                    />
                                  </div>
                                </td>
                              )}
                              <td>{item.id}</td>
                              <td>{item.name}</td>
                              <td>{getState(item.kind)}</td>
                              <td>{item.months || "-"}</td>
                              <td>{item.sessions || "-"}</td>
                              <td style={{ textAlign: "right", width: "7rem" }}>{item.price.toLocaleString("vi-VN")}</td>
                              <td style={{ textAlign: "right", width: "9rem" }}>
                                {(item.price * (item.kind !== 0 ? (!item.sessions || item.sessions === 0 ? 1 : item.sessions) : 1))
                                  .toLocaleString("vi-VN")}
                              </td>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8,
                                  }}
                                >
                                  {item.locations.map((location, index) => (
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
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8,
                                  }}
                                >
                                  {item.services.map((service, index) => (
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
                                      {service.name}
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
                                    className={"btn btn-" + (!item.purchased ? "delete-outline" : "outline-danger disabled")}
                                    style={{
                                      display: canDelete ? "block" : "none",
                                    }}
                                    onClick={(e) => {
                                      if (!item.purchased) {
                                        e.stopPropagation();
                                        setIsOpen(true);
                                        setDeleteId(item.id);
                                      }
                                    }}
                                  >
                                    {i18n.t("delete")}
                                  </button>
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => handleRedirect(item)}
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
                    <div>{i18n.t("no_packages_exist")}</div>
                  </div>
                )}
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
          {isShowPackage && (
            <ModalPackage
              isOpen={isShowPackage}
              onClose={() => setIsShowPackage(false)}
              onAdd={handleGetListPackage}
              isAdd={isAdd}
              serviceInfo={selectedPackageDetail}
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
Package.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(Package);
