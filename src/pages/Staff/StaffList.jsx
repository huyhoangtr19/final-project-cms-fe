import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { Badge, Button, Collapse, Input, Table } from "reactstrap";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import IcPlus from "../../assets/icon/IcPlus";
import MyPagination from "../../components/Common/Mypagination";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import withRouter from "../../components/Common/withRouter";
import { useAppSelector } from "../../hook/store.hook";
import Breadcrumb from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import staffService from "../../services/staff.service";
import departmentService from "../../services/department.service";
import operatorService from "../../services/operator.service";
import i18n from "../../i18n";
import { debounce } from "lodash";
// import { set } from "lodash";

const listStatus = [
  { value: 1, label: i18n.t("active") },
  { value: 0, label: i18n.t("inactive") },
];

const StaffList = (props) => {
  document.title = "Staff | Fitness CMS";
  const path = useLocation();
  const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [listLocation, setListLocation] = useState([]);
  // const [listPosition, setListPosition] = useState([]);
  const [listDepartment, setListDepartment] = useState([]);
  // const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (choose) => {
    setSelectedStaff((prevSelected) => {
      if (prevSelected.includes(choose)) {
        return prevSelected.filter((no) => no !== choose);
      } else {
        return [...prevSelected, choose];
      }
    });
  };

  const handleResetFilter = () => {
    setSearchName("");
    setLocation("");
    setCity("");
    // setPosition("");
    setDepartment("");
  };

  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedStaff(staff.map((item) => item.id));
    } else {
      setSelectedStaff([]);
    }
  };

  const handleGetListStaff = async () => {
    try {
      const payload = {
        keyword: searchName,
        active: city,
        location: location,
        // position: position,
        department: department,
        limit: 20,
        page: page,
      };
      setSelectedStaff([]);
      const res = await staffService.getListStaff(payload);
      setStaff(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRedirect = (choose) => {
    props.router.navigate(`/staff/detail/${choose.id}`);
  };

  const handleUpdateStatus = async (id, active) => {
    try {
      const res = await staffService.updateStatusStaff(
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
        handleGetListStaff();
      }
    } catch (e) {
      console.log(e);
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
      console.log(e);
    }
  };
  const handleGetListDepartment = async () => {
    try {
      const response = await departmentService.getListDepartments();
      if (response.success) {
        setListDepartment(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteAStaff = async (id) => {
    try {
      const res = await staffService.deleteAStaff(id);
      if (res.success) {
        toast.success(i18n.t("delete_staff_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListStaff();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setDeleteId("");
    }
  };
  const handleDeleteMulti = async () => {
    try {
      const res = await staffService.deleteMultiStaff(selectedStaff);
      if (res.success) {
        toast.success(i18n.t("delete_staff_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListStaff();
      }
    } catch (e) {
      if (e.message && e.message === "staff_has_class_schedule") {
        toast.error(i18n.t("delete_staff_fail"), {
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
      handleDeleteAStaff(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };

  const isAllChecked = useMemo(() => {
    return staff.length === selectedStaff.length;
  }, [selectedStaff, staff]);

  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t("popup_del_this_staff")
      : i18n.t("popup_del_selected_staff");
  }, [deleteId]);

  const canAddStaff = useMemo(() => {
    return permissionUser.includes("staff:create");
  }, [permissionUser]);

  const canUpdateStatus = useMemo(() => {
    return permissionUser.includes("staff:update_status");
  }, [permissionUser]);

  const canDelete = useMemo(() => {
    return permissionUser.includes("staff:delete");
  }, [permissionUser]);

  const isMobile = useMemo(() => {
    return window.innerWidth < 768;
  }, []);

  useEffect(() => {
    handleGetListDepartment();
    handleGetListLocation();
  }, []);

  useEffect(() => {
    if (listLocation.length && listDepartment.length) {
      handleGetListStaff();
    }
  }, [page, searchName, city, location, department, listLocation, listDepartment]);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (staff.length === 0) return;

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
  }, [staff]);

  return (
    <React.Fragment>
      <div className="!page-content">
        <div className="!content-container">
          <Breadcrumb title={i18n.t("staff")} />
          <div className="filter-container">
            <div className="filter-header">
              <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
                <button
                  className="filter-clear"
                >
                  {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
                </button>
                <h5 className="filter-title">{i18n.t("staff_list")}</h5>
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
                <label className="filter-label">{`${i18n.t("staff_id")}/${i18n.t("name")}/${i18n.t("phone")}/${i18n.t("email")}`}</label>
                <InputSearch
                  value={searchName}
                  onChange={(e) => setSearchName(e)}
                  placeholder={`${i18n.t("staff_id")}/${i18n.t(
                    "name"
                  )}/${i18n.t("phone")}/Email`}
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
                <label className="filter-label">{i18n.t("department")}</label>
                <MyDropdown
                  options={listDepartment}
                  selected={department}
                  displayEmpty={true}
                  setSelected={(e) => setDepartment(e)}
                  placeholder={i18n.t("department")}
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
              <div className="p-0">
                <div className="action-buttons">
                  <Link
                    to="create"
                    style={{
                      display: canAddStaff ? "block" : "none",
                      margin: 0,
                    }}
                  >
                    <button className="btn btn-primary btn-block d-flex gap-1">
                      <IcPlus />
                      <div className="" style={{ lineHeight: "17px" }}>
                        {i18n.t("add_new_staff")}
                      </div>
                    </button>
                  </Link>
                  <Button
                    color="danger"
                    outline={true}
                    disabled={selectedStaff.length === 0}
                    onClick={() => {
                      if (selectedStaff.length > 0) {
                        setIsOpen(true);
                      }
                    }}
                    style={{
                      lineHeight: "17px",
                      display: canDelete ? "block" : "none",
                    }}
                  >
                    {i18n.t("delete_selected")}
                  </Button>
                </div>
                {staff.length > 0 ? (
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

                            <th>{i18n.t("staff_id")}</th>
                            <th>{i18n.t("staff_name")}</th>
                            {/* <th>{i18n.t("position")}</th> */}
                            <th>{i18n.t("department")}</th>
                            <th>Email</th>
                            <th>{i18n.t("phone")}</th>
                            <th>{i18n.t("location")}</th>
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
                          {staff.map((item, index) => (
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
                                      checked={selectedStaff.includes(item.id)}
                                      onChange={() => { }}
                                    />
                                  </div>
                                </td>
                              )}
                              <td>{item.id}</td>
                              <td>
                                {item.last_name} {item.first_name}
                              </td>
                              <td>
                                {listDepartment.find(
                                  (dep) => dep?.value === item?.department_id
                                )?.label || "-"}
                              </td>
                              <td>{item.email || "-"}</td>
                              <td>{item.phone || "-"}</td>
                              <td>
                                {listLocation.find(
                                  (loc) => loc?.value === item?.location_id
                                )?.label || "-"}
                              </td>
                              <td>
                                <div className="d-flex flex-row gap-1 justify-content-between">
                                  <div
                                    style={{
                                      cursor: canUpdateStatus
                                        ? "pointer"
                                        : "none"
                                    }}
                                    className="px-1"
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (canUpdateStatus) {
                                        handleUpdateStatus(item.id, item.active);
                                      }
                                    }}
                                  >
                                    {item.active === 0 ? (
                                      <Badge color="none" className="badge-error">{i18n.t("inactive")}</Badge>
                                    ) : (
                                      <Badge color="none" className="badge-success">{i18n.t("active")}</Badge>
                                    )}
                                  </div>
                                  <button
                                    className={"btn btn-" + (item.allow_del ? "delete-outline" : "outline-danger disabled")}
                                    style={{
                                      display: canDelete ? "block" : "none",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.allow_del) {
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
                    <div>{i18n.t("no_staff_exist")}</div>
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
StaffList.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(StaffList);
