// Function Name : Location Page
// Created date :  22/7/24             by :  NgVinh
// Updated date :  1/8/24              by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

import Breadcrumb from "../../../components/Common/Breadcrumb";
import withRouter from "../../../components/Common/withRouter";
import { useAppSelector } from "../../../hook/store.hook";

import { Badge, Button, Col, Collapse, Container, Input, Row, Table } from "reactstrap";
import operatorService from "../../../services/operator.service";
import { toast } from "react-toastify";
import IcPlus from "../../../assets/icon/IcPlus";
import IcDot from "../../../assets/icon/IcDot";
import IcTrash from "../../../assets/icon/IcTrash";
import MyPagination from "../../../components/Common/Mypagination";
import InputSearch from "../../../components/Common/InputSearch";
import MyDropdown from "../../../components/Common/MyDropdown";
import MyModalTemplate from "../../../components/Common/MyModalTemplate";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import { debounce } from "lodash";

const Location = (props) => {
  // document.title = "Location | Actiwell System";

  const path = useLocation();
  const { t } = useTranslation();
  const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [city, setCity] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleResetFilter = () => {
    setSearchName("");
    setCity("");
  }

  const handleCheckboxChange = (locationNo) => {
    setSelectedLocations((prevSelected) => {
      if (prevSelected.includes(locationNo)) {
        return prevSelected.filter((no) => no !== locationNo);
      } else {
        return [...prevSelected, locationNo];
      }
    });
  };
  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedLocations(locations.map((item) => item.id));
    } else {
      setSelectedLocations([]);
    }
  };

  const handleGetListLocation = async () => {
    try {
      const payload = {
        keyword: searchName,
        province: city,
        limit: 20,
        page: page,
      };
      setSelectedLocations([]);
      const res = await operatorService.getListLocation(payload);
      setLocations(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };
  const getListCity = async () => {
    try {
      const res = await operatorService.getListProvinceByOperator();
      if (res.success) {
        const resData = res.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setProvinces(resData);
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleRedirect = (location) => {
    props.router.navigate(`/location-list/detail/${location.id}`);
  };

  const handleUpdateStatus = async (id, active) => {
    try {
      const res = await operatorService.updateStatusLocation(
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
        handleGetListLocation();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteALocation = async (id) => {
    try {
      const res = await operatorService.deleteALocation(id);
      if (res.success) {
        handleGetListLocation();
      }
    } catch (e) {
      console.log(e);
      toast.error(i18n.t("delete_location_fail"));
    } finally {
      setDeleteId("");
    }
  };
  const handleDeleteMulti = async () => {
    try {
      const res = await operatorService.deleteMultiLocation(selectedLocations);
      if (res.success) {
        handleGetListLocation();
      }
    } catch (e) {
      toast.error(i18n.t("delete_location_fail"));
      console.log(e);
    }
  };
  const handleDeleteModal = () => {
    if (deleteId) {
      handleDeleteALocation(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };
  const isAllChecked = useMemo(() => {
    return locations.length === selectedLocations.length;
  }, [selectedLocations, locations]);

  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t("popup_del_this_location")
      : i18n.t("popup_del_selected_location");
  }, [deleteId]);

  useEffect(() => {
    handleGetListLocation();
  }, [page, searchName, city]);

  useEffect(() => {
    getListCity();
  }, []);

  const canAddLocation = useMemo(() => {
    return permissionUser.includes("location:create");
  }, [permissionUser]);

  const canUpdateStatus = useMemo(() => {
    return permissionUser.includes("location:update_status");
  }, [permissionUser]);

  const canDelete = useMemo(() => {
    return permissionUser.includes("location:delete");
  }, [permissionUser]);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (locations.length === 0) return;

    const scrollContainer = tableContainerRef.current;
    if (!scrollContainer) return;
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
  }, [locations]);

  return (
    <React.Fragment>
      <div className="">
        <div className="">
          <Breadcrumb
            title={t("bussiness_information")}
            breadcrumbItem={i18n.t("location_list")}
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
                      <h5 className="filter-title">{i18n.t("location_list")}</h5>
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
                        placeholder={i18n.t("name")}
                      />
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">{i18n.t("city")}</label>
                      <MyDropdown
                        options={provinces}
                        selected={city}
                        displayEmpty={true}
                        setSelected={(e) => setCity(e)}
                        placeholder={i18n.t("city")}
                      />
                    </div>
                  </Collapse>
                </div>
                <div className="action-buttons">
                  <Link
                    to="/location-list/create"
                    style={{
                      display: canAddLocation ? "block" : "none",
                    }}
                  >
                    <button className="btn btn-primary btn-block px-2 d-flex gap-1">
                      <IcPlus />
                      <div
                        className=""
                        style={{
                          lineHeight: "17px",
                        }}
                      >
                        {i18n.t("add_new_location")}
                      </div>
                    </button>
                  </Link>
                  <Button
                    color="danger"
                    outline
                    disabled={selectedLocations.length === 0}
                    style={{
                      display: canDelete ? "block" : "none",
                    }}
                    onClick={() => {
                      if (selectedLocations.length > 0) {
                        setIsOpen(true);
                      }
                    }}
                  >
                    {i18n.t("delete_selected")}
                  </Button>
                </div>
                {locations.length > 0 ? (
                  <>
                    <div className="before-table"></div>
                    <div className="table-container" ref={tableContainerRef}>
                      <Table className="table mb-0">
                        <thead style={{ top: 0 }}>
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
                            <th>{i18n.t("no")}</th>
                            <th>{i18n.t("location_name")}</th>
                            <th>{i18n.t("address")}</th>
                            <th>
                              {i18n.t("state")}/{i18n.t("province")}
                            </th>
                            <th>{i18n.t("email")}</th>
                            <th>{i18n.t("phone")}</th>
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
                          {locations.map((location, index) => (
                            <tr key={index} onClick={() => handleRedirect(location)}>
                              {canDelete && (
                                <td>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCheckboxChange(location.id);
                                    }}
                                  >
                                    <Input
                                      type="checkbox"
                                      checked={selectedLocations.includes(
                                        location.id
                                      )}
                                      onChange={() => { }}
                                    />
                                  </div>
                                </td>
                              )}
                              <td>{page * (index + 1)}</td>
                              <td>{location.name}</td>
                              <td>{location.address}</td>
                              <td>{location.province_name}</td>
                              <td>{location.email}</td>
                              <td>{location.phone}</td>
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
                                      canUpdateStatus &&
                                        handleUpdateStatus(
                                          location.id,
                                          location.active
                                        );
                                    }}
                                  >
                                    {location.active === 0 ? (
                                      <Badge color="none" className="badge-error">{i18n.t("inactive")}</Badge>
                                    ) : (
                                      <Badge color="none" className="badge-success">{i18n.t("active")}</Badge>
                                    )}
                                  </div>
                                  <button
                                    className="btn btn-delete-outline"
                                    style={{ display: canDelete ? "block" : "none" }}
                                    onClick={(e) => {
                                      if (canDelete) {
                                        e.stopPropagation();
                                        setIsOpen(true);
                                        setDeleteId(location.id);
                                      }

                                      // handleDeleteALocation(location.id);
                                    }}
                                  >
                                    {i18n.t("delete")}
                                  </button>
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => handleRedirect(location)}
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
                  </>
                ) : (
                  <div className="d-flex justify-content-center d-flex align-items-center h-100">
                    <div>{i18n.t("no_locations_exist")}</div>
                  </div>
                )}
              </div>
            )}
          </div>
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
Location.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(Location);
