import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Badge, Button, Col, Collapse, Container, Input, Row, Table } from "reactstrap";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import IcPlus from "../../assets/icon/IcPlus";
import IcDot from "../../assets/icon/IcDot";
import MyPagination from "../../components/Common/Mypagination";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import withRouter from "../../components/Common/withRouter";
import { useAppSelector } from "../../hook/store.hook";
import Breadcrumb from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";

import { listStageUser } from "../../constants/app.const";
import userService from "../../services/user.service";
import roleService from "../../services/role.service";
import moment from "moment";
import i18n from "../../i18n";
import { debounce } from "lodash";

const listStatus = [
  { value: 1, label: i18n.t("active") },
  { value: 0, label: i18n.t("inactive") },
];

const Users = (props) => {
  // document.title = "Users | Fitness CMS";

  const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const [users, setUsers] = useState([]);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [selectedUsers, setselectedUsers] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState("");
  const [role, setRole] = useState("");
  const [listRole, setListRole] = useState([]);
  const [deleteId, setDeleteId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [keySort, setKeySort] = useState("asc");

  const canAdd = useMemo(() => {
    return permissionUser.includes("user:create");
  }, [permissionUser]);
  const canSee = useMemo(() => {
    return permissionUser.includes("user:view_detail");
  }, [permissionUser]);

  const handleCheckboxChange = (choose) => {
    setselectedUsers((prevSelected) => {
      if (prevSelected.includes(choose)) {
        return prevSelected.filter((no) => no !== choose);
      } else {
        return [...prevSelected, choose];
      }
    });
  };
  const handleCheckAll = () => {
    if (!isAllChecked) {
      setselectedUsers(users.map((item) => item.id));
    } else {
      setselectedUsers([]);
    }
  };

  const handleGetListUser = async () => {
    try {
      const payload = {
        keyword: searchName,
        status: status,
        role: role,
        key_sort: "created_at",
        order: keySort,
        stage: stage,
        limit: 20,
        page: page,
      };
      setselectedUsers([]);
      const res = await userService.getListUsers(payload);
      setUsers(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };
  const handleGetRole = async () => {
    try {
      const response = await roleService.getListRoles();
      if (response.success) {
        setListRole(
          response.data.map((item) => {
            return { value: item.id, label: i18n.t(item.name) };
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleRedirect = (choose) => {
    if (canSee) {
      props.router.navigate(`/users/detail/${choose.id}`);
    }
  };
  const handleResetFilter = () => {
    setSearchName("");
    setStatus("");
    setRole("");
    setStage("");
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await userService.updateStatusUser(id, status === 1 ? 0 : 1);
      if (res.success) {
        toast.success(i18n.t("update_status_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListUser();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // const handleDeleteAPackage = async (id) => {
  //   try {
  //     const res = await packageService.deleteAPackages(id);
  //     if (res.success) {
  //       toast.success("Delete Package successfully", {
  //         position: "top-right",
  //         autoClose: 2000,
  //         theme: "light",
  //         hideProgressBar: true,
  //       });
  //       handleGetListUser();
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     setDeleteId("");
  //   }
  // };
  const handleDeleteMulti = async () => {
    try {
      const res = await userService.deleteMultiUsers(selectedUsers);
      if (res.success) {
        toast.success("Delete selected users successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListUser();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleDeleteModal = () => {
    handleDeleteMulti();
  };
  const handleSortCreateAt = () => {
    setKeySort((prev) => (prev === "asc" ? "desc" : "asc"));
  };
  const getState = (kindId) => {
    switch (kindId) {
      case 0:
        return i18n.t("invitation_sent");
      case 1:
        return i18n.t("confirmed");

      default:
        return i18n.t("invitation_sent");
    }
  };

  const getStateSeverity = (kindId) => {
    switch (kindId) {
      case 0:
        return "warning"
      case 1:
        return "success"
      case 2:
        return "warning"
    }
  }

  const isAllChecked = useMemo(() => {
    return users.length === selectedUsers.length;
  }, [users, selectedUsers]);

  const titleModal = useMemo(() => {
    return deleteId
      ? "Are you sure you want to delete this user?"
      : "Are you sure you want to delete selected users?";
  }, [deleteId]);

  useEffect(() => {
    handleGetListUser();
  }, [page, searchName, stage, role, status, keySort]);
  useEffect(() => {
    handleGetListUser();
    handleGetRole();
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (users.length === 0) return;

    const scrollContainer = tableContainerRef.current;
    if (!scrollContainer) return
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
  }, [users]);

  return (
    <React.Fragment>
      <div className="">
        <div className="">
          <Breadcrumb title={i18n.t("user_permission")} />
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
                <div className="filter-container">
                  <div className="filter-header">
                    <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
                      <button
                        className="filter-clear"
                      >
                        {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
                      </button>
                      <h5 className="filter-title">{i18n.t("user_list")}</h5>
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
                      <label className="filter-label">{`${i18n.t("name")}/${i18n.t("email")}`}</label>
                      <InputSearch
                        value={searchName}
                        onChange={(e) => setSearchName(e)}
                        placeholder={`${i18n.t("name")}/${i18n.t("email")}`}
                      />
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">{i18n.t("role")}</label>
                      <MyDropdown
                        options={listRole}
                        selected={role}
                        displayEmpty={true}
                        setSelected={(e) => setRole(e)}
                        placeholder={i18n.t("role")}
                      />
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">{i18n.t("stage")}</label>
                      <MyDropdown
                        options={listStageUser}
                        selected={stage}
                        displayEmpty={true}
                        setSelected={(e) => setStage(e)}
                        placeholder={i18n.t("stage")}
                      />
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">{i18n.t("status")}</label>
                      <MyDropdown
                        options={listStatus}
                        selected={status}
                        displayEmpty={true}
                        setSelected={(e) => setStatus(e)}
                        placeholder={i18n.t("status")}
                      />
                    </div>
                  </Collapse>
                </div>
                <div className="action-buttons">
                  <button
                    style={{
                      display: canAdd ? "block" : "none",
                    }}
                    className="btn btn-primary btn-block d-flex gap-1"
                    onClick={() => {
                      props.router.navigate("/users/create");
                    }}
                  >
                    <IcPlus />
                    <div className="" style={{ lineHeight: "17px" }}>
                      {i18n.t("add_new_user")}
                    </div>
                  </button>
                  <Button
                    color="danger"
                    outline={true}
                    disabled={selectedUsers.length === 0}
                    onClick={() => {
                      if (selectedUsers.length > 0) {
                        setIsOpen(true);
                      }
                    }}
                  >
                    {i18n.t("delete_selected")}
                  </Button>
                </div>
                {users.length > 0 ? (
                  <>
                    <div className="before-table"></div>
                    <div className="table-container" ref={tableContainerRef}>
                      <Table className="table mb-0">
                        <thead style={{ top: 0 }}>
                          <tr>
                            <th>
                              <div onClick={handleCheckAll}>
                                <Input
                                  type="checkbox"
                                  checked={isAllChecked}
                                  onChange={() => { }}
                                />
                              </div>
                            </th>
                            <th>{i18n.t("no")}</th>
                            <th>
                              <div
                                className="d-flex gap-1 align-items-center"
                                onClick={handleSortCreateAt}
                              >
                                {i18n.t("create_date")}
                                {keySort === "asc" ? (
                                  <i className="bx bxs-up-arrow"></i>
                                ) : (
                                  <i className="bx bxs-down-arrow"></i>
                                )}
                              </div>
                            </th>
                            <th>{i18n.t("name")}</th>
                            <th>{i18n.t("email")}</th>
                            <th>{i18n.t("role")}</th>
                            <th>{i18n.t("status")}</th>
                            <th style={{ maxWidth: 195 }}>{i18n.t("action")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((item, index) => (
                            <tr key={index} onClick={() => handleRedirect(item)}>
                              <td>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckboxChange(item.id);
                                  }}
                                >
                                  <Input
                                    type="checkbox"
                                    checked={selectedUsers.includes(item.id)}
                                    onChange={() => { }}
                                  />
                                </div>
                              </td>
                              <td>{item.id}</td>
                              <td>
                                {moment(item?.created_at).format("DD/MM/yyyy")}
                              </td>
                              <td>{item.username || "-"}</td>
                              <td>{item.email || "-"}</td>

                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8,
                                  }}
                                >
                                  {item.roles.map((role, index) => (
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
                                      {i18n.t(role.name)}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <Badge
                                  className={"badge-" + getStateSeverity(item.stage_id)}
                                  color="none"
                                >
                                  {getState(item.stage_id) || "-"}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex flex-row gap-1 justify-content-end align-items-center">
                                  <div
                                    style={{ cursor: "pointer" }}
                                    className="px-1"
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(item.id, item.status);
                                    }}
                                  >
                                    {item.status === 0 ? (
                                      <Badge color="none" className="badge-error">{i18n.t("inactive")}</Badge>
                                    ) : (
                                      <Badge color="none" className="badge-success">{i18n.t("active")}</Badge>
                                    )}
                                  </div>
                                  {/* <button
                                    className="btn btn-secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsOpen(true);
                                      setDeleteId(item.id);
                                    }}
                                  >
                                    {i18n.t("delete")}
                                  </button> */}
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
                    <div>{i18n.t('no_user_exist')}</div>
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
                  onClick={() => {
                    setIsOpen(false);
                    setDeleteId("");
                  }}
                >
                  {i18n.t("cancel")}
                </Button>

                <button
                  className="btn btn-primary btn-block d-flex gap-1"
                  onClick={() => {
                    handleDeleteModal();
                    setIsOpen(false);
                  }}
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
Users.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(Users);
