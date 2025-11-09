// Function Name : Service Page
// Created date :  28/7/24             by :  NgVinh
// Updated date :  1/8/24              by :  NgVinh

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
import i18n from "../../i18n";
import notificationService from "../../services/notification.service";
import {
  listLabelCustomer,
  listStatusNotification,
} from "../../constants/app.const";
import moment from "moment";
import { debounce } from "lodash";

const Notification = (props) => {
  document.title = "Notification | Actiwell System";

  const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [keySort, setKeySort] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleResetFilter = () => {
    setSearchName("");
    setLabel("");
    setStatus("");
  }

  const handleCheckboxChange = (service) => {
    setSelectedNotification((prevSelected) => {
      if (prevSelected.includes(service)) {
        return prevSelected.filter((no) => no !== service);
      } else {
        return [...prevSelected, service];
      }
    });
  };
  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedNotification(notifications.map((item) => item.id));
    } else {
      setSelectedNotification([]);
    }
  };

  const handleGetListService = async () => {
    try {
      const payload = {
        keyword: searchName,
        group_type: label,
        status: status,
        limit: 20,
        page: page,
        key_sort: keySort,
        order: sortOrder,
      };
      setSelectedNotification([]);
      const res = await notificationService.getListNotification(payload);
      setNotifications(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRedirect = (service) => {
    props.router.navigate(`/notification/${service.id}`);
  };

  const handleSortSend = () => {
    if (keySort === "date_push") {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setKeySort("date_push");
      setSortOrder("desc");
    }
  };
  const handleSortCreateAt = () => {
    if (keySort === "created_at") {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setKeySort("created_at");
      setSortOrder("desc");
    }
  };

  const handleUpdateStatus = async (id, active) => {
    try {
      const res = await notificationService.updateStatusNotifications(
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
      const res = await notificationService.deleteNotifications([id]);
      if (res.success) {
        toast.success("Delete notification successfully", {
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
      const res = await notificationService.deleteNotifications(
        selectedNotification
      );
      if (res.success) {
        toast.success("Delete notification selected successfully", {
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
  const handleDeleteModal = () => {
    if (deleteId) {
      handleDeleteAService(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };

  const convertHtmlToTextContent = (html) => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    const textContent = tempElement.innerText || "";
    return textContent;
  };
  const userSegment = (group) => {
    const labels = group.map((item) => {
      const option = listLabelCustomer.find((option) => option.value === item);
      return option ? option.label : null;
    });
    return labels.join(", ");
  };

  const isAllChecked = useMemo(() => {
    return notifications.length === selectedNotification.length;
  }, [selectedNotification, notifications]);

  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t("popup_del_this_service")
      : i18n.t("popup_del_selected_service");
  }, [deleteId]);

  useEffect(() => {
    handleGetListService();
  }, [page, searchName, status, label]);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (notifications.length === 0) return;

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
  }, [notifications]);

  return (
    <React.Fragment>
      <div className="page-content content-container">
        <Breadcrumb
          title={"Notification"}
          breadcrumbItem={"Notification List"}
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
                    <h5 className="filter-title">{i18n.t("notification_list")}</h5>
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
                    <label className="filter-label">{i18n.t("user_segment")}</label>
                    <MyDropdown
                      options={listLabelCustomer}
                      selected={label}
                      displayEmpty={true}
                      setSelected={(e) => setLabel(e)}
                      placeholder={i18n.t("user_segment")}
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">{i18n.t("status")}</label>
                    <MyDropdown
                      options={listStatusNotification}
                      selected={status}
                      displayEmpty={true}
                      setSelected={(e) => setStatus(e)}
                      placeholder={i18n.t("status")}
                    />
                  </div>
                </Collapse>
              </div>
              <div className="action-buttons">
                <Link to="create">
                  <button className="btn btn-primary btn-block d-flex gap-2">
                    <IcPlus />
                    <div className="" style={{ lineHeight: "17px" }}>
                      {i18n.t('add_new_notification')}
                    </div>
                  </button>
                </Link>
                <Button
                  color="danger"
                  outline={true}
                  disabled={selectedNotification.length === 0}
                  onClick={() => {
                    if (selectedNotification.length > 0) {
                      setIsOpen(true);
                    }
                  }}
                >
                  {i18n.t("delete_selected")}
                </Button>
              </div>
              {notifications.length > 0 ? (
                <>
                  <div className="before-table"></div>
                  <div className="table-container" ref={tableContainerRef}>
                    <Table className="table mb-0">
                      <thead>
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
                          <th>ID</th>
                          <th>{i18n.t('title')}</th>
                          <th>{i18n.t('content')}</th>
                          <th>{i18n.t('user_segment')}</th>
                          <th>
                            <div
                              className="d-flex gap-1 align-items-center"
                              onClick={handleSortCreateAt}
                            >
                              {i18n.t("create_date")}
                              {keySort !== "created_at" ? (
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
                          </th>
                          <th>
                            <div
                              className="d-flex gap-1 align-items-center"
                              onClick={handleSortSend}
                            >
                              {i18n.t("send_date")}
                              {keySort !== "date_push" ? (
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
                          </th>
                          <th>{i18n.t('recipient')}</th>
                          <th>{i18n.t('creator')}</th>
                          <th>{i18n.t('status')}</th>
                          <th>{i18n.t('action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notifications.map((noti, index) => (
                          <tr key={index} onClick={() => handleRedirect(noti)}>
                            <td>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange(noti.id);
                                }}
                              >
                                <Input
                                  type="checkbox"
                                  checked={selectedNotification.includes(
                                    noti.id
                                  )}
                                  onChange={() => { }}
                                />
                              </div>
                            </td>
                            <td>{noti.id}</td>
                            <td style={{ maxWidth: "20rem" }}>{noti.title}</td>
                            <td style={{ maxWidth: "20rem" }}>{convertHtmlToTextContent(noti.body)}</td>
                            <td>{userSegment(noti.group_type)}</td>
                            <td>
                              {moment(noti.created_at).format(
                                "DD/MM/yyyy HH:mm:ss"
                              )}
                            </td>
                            <td>
                              {noti?.date_push
                                ? moment(noti?.date_push).format(
                                  "DD/MM/yyyy HH:mm:ss"
                                )
                                : "-"}
                            </td>
                            <td>{noti.recipients_count}</td>
                            <td>{noti.creator?.username}</td>
                            <td>
                              <Badge
                                color="none"
                                className={"badge-" + (
                                  listStatusNotification.find((not) => not.value === noti.status || 0).badge
                                )}
                              >
                                {
                                  listStatusNotification.find(
                                    (not) => not.value === noti.status || 0
                                  ).label
                                }
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex flex-row gap-1 justify-content-between align-items-center">
                                <button
                                  className={"btn btn-" + (!noti.purchased ? "delete-outline" : "outile-danger disabled")}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!noti.purchased) {
                                      setIsOpen(true);
                                      setDeleteId(noti.id);
                                    }
                                  }}
                                >
                                  {i18n.t("delete")}
                                </button>
                                <button
                                  className="btn btn-outline"
                                  onClick={() => handleRedirect(noti)}
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
                  <div>{i18n.t('no_notification_exist')}</div>
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
    </React.Fragment>
  );
};
Notification.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(Notification);
