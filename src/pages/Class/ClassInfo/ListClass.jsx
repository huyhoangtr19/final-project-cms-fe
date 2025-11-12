// Function Name : List Class
// Created date :  2/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";

import withRouter from "../../../components/Common/withRouter";
import { useAppSelector } from "../../../hook/store.hook";
import { Button, Col, Input, Row, Table, Collapse, Badge } from "reactstrap";
import { toast } from "react-toastify";
import IcPlus from "../../../assets/icon/IcPlus";
import IcDot from "../../../assets/icon/IcDot";
import IcTrash from "../../../assets/icon/IcTrash";
import MyPagination from "../../../components/Common/Mypagination";
import MyDropdown from "../../../components/Common/MyDropdown";

import serviceService from "../../../services/service.service";
import classService from "../../../services/class.service";
import MyModalTemplate from "../../../components/Common/MyModalTemplate";
import i18n from "../../../i18n";
import { clone, debounce, wrap } from "lodash";

const ListClass = (props) => {
  document.title = "Class List | Fitness CMS";
  const { id } = useParams();
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [provinces, setProvinces] = useState([]);
  const [city, setCity] = useState("");
  const [service, setService] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const listStatus = [
    { value: 1, label: i18n.t("active") },
    { value: 0, label: i18n.t("inactive") },
  ];

  const handleResetFilter = () => {
    setCity("");
    setService("");
  }

  const handleGetListLocation = async () => {
    try {
      const payload = {
        active: city,
        service: service,
        limit: 20,
        page: page,
      };
      setSelectedClasses([]);
      const res = await classService.getListClass(payload);
      setClasses(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };
  const getListCity = async () => {
    try {
      const res = await serviceService.getListServiceForOperator();
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
    props.router.navigate(`/class-info/detail/${location.id}`);
  };

  const handleUpdateStatus = async (id, active) => {
    try {
      const res = await classService.updateStatusClass(
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
  const handleDeleteModal = () => {
    if (deleteId) {
      handleDeleteALocation(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };
  const handleDeleteMulti = async () => {
    try {
      const res = await classService.deleteMultiClasses(selectedClasses);
      if (res.success) {
        toast.success("Delete Multiple Contact successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        setSelectedClasses([]);
        handleGetListLocation();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleDeleteALocation = async (id) => {
    try {
      const res = await classService.deleteClass(id);
      if (res.success) {
        toast.success(i18n.t('delete_location_success'), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListLocation();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setDeleteId("");
    }
  };

  const handleAddSelect = (id) => {
    setSelectedClasses((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((no) => no !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedClasses(classes.map((item) => item.id));
    } else {
      setSelectedClasses([]);
    }
  };

  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t('are_you_sure_delete_this_class')
      : i18n.t('are_you_sure_delete_selected_classes');
  }, [deleteId]);

  const isAllChecked = useMemo(() => {
    return classes.length === selectedClasses.length;
  }, [classes]);
  const canSeeClass = useMemo(() => {
    return permissionUser.includes("class:view_list");
  }, [permissionUser]);

  useEffect(() => {
    if (canSeeClass) {
      handleGetListLocation();
    }
  }, [page, service, city, provinces]);

  useEffect(() => {
    getListCity();
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {
    if (!props.isActive || classes.length === 0) return;

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
  }, [props.isActive, classes]);

  return (
    <div className="bg-white page-container">
      <div className="filter-container">
        <div className="filter-header">
          <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
            <button
              className="filter-clear"
            >
              {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
            </button>
            <h5 className="filter-title">{i18n.t("class_list")}</h5>
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
              options={provinces}
              selected={service}
              displayEmpty={true}
              setSelected={(e) => setService(e)}
              placeholder={i18n.t("service")}
            />
          </div>
        </Collapse>
      </div>

      <div className="action-buttons">
        <Link to="create">
          <button className="btn btn-primary d-flex gap-1">
            <IcPlus />
            <div className="" style={{ lineHeight: "19px" }}>
              {i18n.t("add_new_class")}
            </div>
          </button>
        </Link>
        <Button
          color="danger"
          outline
          disabled={selectedClasses.length === 0}
          onClick={() => {
            if (selectedClasses.length > 0) {
              setIsOpen(true);
            }
          }}
        >
          {i18n.t("delete_selected")}
        </Button>
      </div>
      {classes.length > 0 ? (
        <>
          <div className="before-table" ref={beforeTableRef}></div>
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
                  <th>{i18n.t("class_id")}</th>
                  <th>{i18n.t("service")}</th>
                  <th>{i18n.t("class_name")}</th>
                  <th>{i18n.t("number_of_schedules")}</th>
                  <th>{i18n.t("status")}</th>
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
                {classes.map((location, index) => (
                  <tr key={index} onClick={() => handleRedirect(location)}>
                    <td>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSelect(location.id);
                        }}
                      >
                        <Input
                          type="checkbox"
                          checked={selectedClasses.includes(location.id)}
                          onChange={() => { }}
                        />
                      </div>
                    </td>
                    <td>{location.id}</td>
                    <td>
                      {provinces.find(
                        (ser) => ser.value === location.service_id
                      )?.label || "-"}
                    </td>
                    <td>{location.name}</td>
                    <td>
                      {location.number_schedules > 0
                        ? `${location.number_schedules} ${i18n.t(
                          "schedules"
                        )}`
                        : "-"}
                    </td>
                    <td>
                      <div
                        className="px-1"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(location.id, location.active);
                        }}
                      >
                        {location.active === 0 ? (
                          <Badge color="none" className="badge-error">{i18n.t("inactive")}</Badge>
                        ) : (
                          <Badge color="none" className="badge-success">{i18n.t("active")}</Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-row gap-1 justify-content-between align-items-center">
                        <button
                          className="btn btn-delete-outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(true);
                            setDeleteId(location.id);
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
          <div className="pagination-footer">
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
        </>
      ) : (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div>{i18n.t('no_class_exist')}</div>
        </div>
      )}
    </div>
  );
};
ListClass.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(ListClass);
