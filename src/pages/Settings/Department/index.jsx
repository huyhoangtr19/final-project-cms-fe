import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Button, Input, Table } from "reactstrap";
import i18n from "i18next";
import { toast } from "react-toastify";
import MyModalTemplate from "../../../components/Common/MyModalTemplate";
import departmentService from "../../../services/department.service";
import departmentGroupService from "../../../services/department.group.service";
import customerGroupService from "../../../services/customer.group.service";
import operatorService from "../../../services/operator.service";
import { useAppSelector } from "../../../hook/store.hook";
import withRouter from "../../../components/Common/withRouter";
import ModalDepartment from "./ModalDepartment";
import ModalDepartmentGroup from "./ModalDepartmentGroup";
import TreeComponent from "../TreeComponent";
import { debounce } from "lodash";

const Department = (props) => {
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [departments, setDepartments] = useState([]);
  const [departmentGroups, setDepartmentGroups] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedDepartmentGroups, setSelectedDepartmentGroups] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteIdGroup, setDeleteIdGroup] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenGroup, setIsOpenGroup] = useState(false);
  const [isOpenDepartmentModal, setIsOpenDepartmentModal] = useState(false);
  const [isOpenDepartmentGroupModal, setIsOpenDepartmentGroupModal] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [departmentGroupInfo, setDepartmentGroupInfo] = useState(null);
  const [type, setType] = useState('create');
  const [typeGroup, setTypeGroup] = useState('create');
  const [listLocations, setListLocaitons] = useState([]);
  const [listCustomerGroups, setListCustomerGroups] = useState([]);

  const canAdd = useMemo(() => permissionUser.includes("department:create"), [permissionUser]);
  const canDelete = useMemo(() => permissionUser.includes("department:delete"), [permissionUser]);
  const isAllChecked = useMemo(() => departmentGroups.length > 0 && departmentGroups.length === selectedDepartmentGroups.length, [departmentGroups, selectedDepartmentGroups]);
  const treeData = useMemo(() => buildSegmentTreeByLocation(departments), [departments]);

  const handleGetDepartments = async () => {
    try {
      const res = await departmentService.getListDepartments({});
      if (res.success) {
        setDepartments(res.data);
      } else {
        console.log("fail: ", res);
        toast.error("Error fetching data", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        })
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleGetDepartmentGroups = async () => {
    try {
      const res = await departmentGroupService.getListDepartmentGroups({});
      if (res.success) {
        setDepartmentGroups(res.data);
      } else {
        console.log("fail: ", res);
        toast.error("Error fetching data", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        })
      }
    } catch (err) {
      console.log(err);
    }
  };
  const HandleGetListLocation = async () => {
    try {
      const res = await operatorService.getListLocationForOperator();
      if (res.success) {
        setListLocaitons(
          res.data.map((el) => {
            return {
              value: el.id,
              label: el.name,
            };
          })
        );
      } else {
        console.log("fail: ", res)
      }
    } catch (err) {
      console.log("error: ", err);
    }
  }
  const HandleGetListCustomerGroups = async () => {
    try {
      const res = await customerGroupService.getListCustomerGroups();
      if (res.success) {
        setListCustomerGroups(
          res.data.map((el) => {
            return {
              value: el.id,
              label: el.name,
            };
          })
        );
      } else {
        console.log("fail: ", res)
      }
    } catch (err) {
      console.log("error: ", err);
    }
  }

  const handleDeleteDepartment = async (id) => {
    try {
      const res = await departmentService.deleteDepartment(id);
      if (res.success) {
        toast.success("Deleted successfully", {
          position: "top-right",
          autoClose: 200,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetDepartments();
      }
    } catch (err) {
      console.log("err:", err);
      toast.error("Delete failed", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        hideProgressBar: true,
      });
    }
    setDeleteId(null);
  };
  const handleDeleteDepartmentGroup = async (id) => {
    try {
      const res = await departmentGroupService.deleteDepartmentGroup(id);
      if (res.success) {
        toast.success("Deleted successfully", {
          position: "top-right",
          autoClose: 200,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetDepartmentGroups();
      }
    } catch (err) {
      console.log("err:", err);
      toast.error("Delete failed", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        hideProgressBar: true,
      });
    }
    setDeleteIdGroup(null);
  };

  const handleDeleteMultiple = async () => {
    try {
      const res = await departmentService.deleteMultiDepartment(selectedDepartments);
      if (res.success) {
        toast.success("Deleted selected departments", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        setSelectedDepartments([]);
        handleGetDepartments();
      }
    } catch (err) {
      console.log("error:", err);
      toast.error("Batch delete failed", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        hideProgressBar: true,
      });
    }
  };
  const handleDeleteMultipleGroup = async () => {
    try {
      const res = await departmentGroupService.deleteMultiDepartmentGroup(selectedDepartmentGroups);
      if (res.success) {
        toast.success("Deleted selected departments", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        setSelectedDepartmentGroups([]);
        handleGetDepartmentGroups();
      }
    } catch (err) {
      console.log("error:", err);
      toast.error("Batch delete failed", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        hideProgressBar: true,
      });
    }
  };

  const handleDeleteModal = () => {
    if (deleteId) {
      handleDeleteDepartment(deleteId);
    } else {
      handleDeleteMultiple();
    }
    setIsOpen(false);
  };

  const handleDeleteModalGroup = () => {
    if (deleteIdGroup) {
      handleDeleteDepartmentGroup(deleteIdGroup);
    } else {
      handleDeleteMultipleGroup();
    }
    setIsOpenGroup(false);
  };

  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedDepartmentGroups(departmentGroups.map((item) => item.id));
    } else {
      setSelectedDepartmentGroups([]);
    }
  };

  const handleCheckboxChange = useCallback((id) => {
    setSelectedDepartments((prev) =>
      prev.includes(Number(id))
        ? prev.filter((sid) => sid !== Number(id))
        : [...prev, Number(id)]
    );
  }, []);

  const handleCheckboxChangeGroup = useCallback((id) => {
    setSelectedDepartmentGroups((prev) =>
      prev.includes(Number(id))
        ? prev.filter((sid) => sid !== Number(id))
        : [...prev, Number(id)]
    );
  }, []);

  const openDepartmentDetail = useCallback((departments) => {
    setDepartmentInfo(departments);
    setType(departments === null ? 'create' : 'update');
    setIsOpenDepartmentModal(true);
  }, []);

  const openDepartmentGroupDetail = useCallback((depG) => {
    setDepartmentGroupInfo(depG);
    setTypeGroup(depG === null ? 'create' : 'update');
    setIsOpenDepartmentGroupModal(true);
  }, []);

  const handleSetDeleteId = useCallback((id) => {
    setDeleteId(id);
  }, []);

  const handleSetIsOpen = useCallback((isOpen) => {
    setIsOpen(isOpen);
  }, []);

  const titleModal = useMemo(() => {
    return deleteId
      ? "Are you sure you want to delete this department?"
      : "Are you sure you want to delete selected departments?";
  }, [deleteId]);

  function buildSegmentTreeByLocation(departments) {
    const groupedTrees = {};

    const groups = departments.reduce((acc, dept) => {
      const locId = dept.location_id ?? 'null';
      if (!acc[locId]) acc[locId] = [];
      acc[locId].push(dept);
      return acc;
    }, {});

    for (const [locId, deptGroup] of Object.entries(groups)) {
      const map = new Map();
      const tree = [];

      deptGroup.forEach((seg) => {
        map.set(seg.id, { ...seg, children: [] });
      });

      deptGroup.forEach((seg) => {
        if (seg.upper_id) {
          const parent = map.get(seg.upper_id);
          if (parent) parent.children.push(map.get(seg.id));
        } else {
          tree.push(map.get(seg.id));
        }
      });

      groupedTrees[locId === 'null' ? null : locId] = tree.sort((a, b) => a.id - b.id);
    }
    return groupedTrees;
  }

  useEffect(() => {
    if (!isOpenDepartmentModal) {
      handleGetDepartments();
      handleGetDepartmentGroups();
    }
  }, [isOpenDepartmentModal]);

  useEffect(() => {
    if (!isOpenDepartmentGroupModal)
      handleGetDepartmentGroups();
  }, [isOpenDepartmentGroupModal]);

  useEffect(() => {
    handleGetDepartmentGroups();
  }, [])

  useEffect(() => {
    if (props.isActive) {
      HandleGetListLocation();
      HandleGetListCustomerGroups();
    }
  }, [props.isActive])

  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (departmentGroups.length === 0) return;

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
  }, [departmentGroups]);

  return (
    <div className="">
      <div className="action-buttons">
        <h5 className="mb-0 d-flex"
          style={{ alignItems: "center" }}
        >
          {departments.length <= 1 ? i18n.t("department") : i18n.t("departments")}
        </h5>
        <div className="action-buttons mb-1">
          {canAdd && (
            <Button color="primary"
              onClick={() => openDepartmentDetail(null)}
            >
              {i18n.t("add_department")}
            </Button>
          )}
          {canDelete && (
            <Button
              color="danger"
              outline
              disabled={selectedDepartments.length === 0}
              onClick={() => setIsOpen(true)}
            >
              {i18n.t("delete_selected") + (selectedDepartments.length >= 1 ? " - (" + selectedDepartments.length + ")" : "")}
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4"></div>

      {treeData['null'] && (
        <div className="tree-scroller">
          <div className="tree-container">
            <TreeComponent
              items={treeData['null']}
              selectedItems={selectedDepartments}
              handleCheckboxChange={handleCheckboxChange}
              canDelete={canDelete}
              openItemDetail={openDepartmentDetail}
              setDeleteId={handleSetDeleteId}
              setIsOpen={handleSetIsOpen}
              isDepartment={true}
            />
          </div>
        </div>
      )}

      <div>
        <h5 style={{ marginTop: "1rem" }}>
          {i18n.t("location")}
        </h5>
        <div
          style={{ marginLeft: ".3rem" }}
        >
          {listLocations.map((el) => {
            return (
              <div>
                <div className="staff-label">
                  {el.label}
                </div>
                <div style={{ marginLeft: ".5rem" }}>
                  {treeData[el.value] ? (
                    <div className="tree-scroller">
                      <div className="tree-container">
                        <TreeComponent
                          items={treeData[el.value]}
                          selectedItems={selectedDepartments}
                          handleCheckboxChange={handleCheckboxChange}
                          canDelete={canDelete}
                          openItemDetail={openDepartmentDetail}
                          setDeleteId={handleSetDeleteId}
                          setIsOpen={handleSetIsOpen}
                          isDepartment={true}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      {i18n.t("there_are_no_data_exist")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="separator-primary mt-4 mb-4" />

      <div className="">
        <div className="action-buttons">
          <h5 className="mb-0 d-flex"
            style={{ alignItems: "center" }}
          >
            {departmentGroups.length <= 1 ? i18n.t("department_group") : i18n.t("department_groups")}
          </h5>
          <div className="action-buttons mb-1">
            {canAdd && (
              <Button color="primary"
                onClick={() => openDepartmentGroupDetail(null)}
              >
                {i18n.t("add_department_group") + (selectedDepartments.length >= 1 ? " - (" + selectedDepartments.length + ")" : "")}
              </Button>
            )}
            {canDelete && (
              <Button
                color="danger"
                outline
                disabled={selectedDepartmentGroups.length === 0}
                onClick={() => setIsOpenGroup(true)}
              >
                {i18n.t("delete_selected_groups") + (selectedDepartmentGroups.length >= 1 ? " - (" + selectedDepartmentGroups.length + ")" : "")}
              </Button>
            )}
          </div>
        </div>

        {departmentGroups.length > 0 && (
          <>
            <div className="before-table"></div>
            <div className="table-container" ref={tableContainerRef}>
              <Table className="table mb-0">
                <thead style={{ top: 0 }}>
                  <tr>
                    {canDelete && (
                      <th style={{ width: "50px"}}>
                        <div onClick={handleCheckAll}>
                          <Input
                            type="checkbox"
                            checked={isAllChecked}
                            onChange={() => { }}
                          />
                        </div>
                      </th>
                    )}
                    <th style={{ width: window.innerWidth >= 800 ? 300 : 160 }}>{i18n.t("name")}</th>
                    <th style={{ maxWidth: "1150px" }}>{i18n.t("departments")}</th>
                    {canDelete && (
                      <th
                        style={{
                          width: "150px",
                        }}
                      >
                        {i18n.t("action")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {departmentGroups.map((depG, index) => (
                    <tr key={index} onClick={() => openDepartmentGroupDetail(depG)}>
                      {canDelete && (
                        <td>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChangeGroup(depG.id);
                            }}
                          >
                            <Input
                              type="checkbox"
                              checked={selectedDepartmentGroups.includes(depG.id)}
                              onChange={() => { }}
                            />
                          </div>
                        </td>
                      )}
                      <td style={{ wordBreak: "break-all" }}>
                        {depG?.name}
                      </td>
                      <td>
                        <div
                          style={{
                            maxWidth: "1150px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {depG.departments.map((dep, index) => (
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
                              {dep.id + " - " + dep.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      {canDelete && (
                        <td style={{ width: 150 }}>
                          <div className="d-flex gap-1 justify-content-center align-items-center">
                            <button
                              className="btn btn-delete-outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpenGroup(true);
                                setDeleteIdGroup(depG.id);
                              }}
                            >
                              {i18n.t("delete")}
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={() => openDepartmentGroupDetail(depG)}
                            >
                              {i18n.t("update")}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </div>

      <ModalDepartmentGroup
        type={typeGroup}
        isOpen={isOpenDepartmentGroupModal}
        onClose={() => setIsOpenDepartmentGroupModal(false)}
        departmentGroupInfo={departmentGroupInfo}
        listSelectedDepartment={selectedDepartments}
        setListSelectedDepartment={setSelectedDepartments}
      />

      <ModalDepartment
        type={type}
        isOpen={isOpenDepartmentModal}
        onClose={() => setIsOpenDepartmentModal(false)}
        departmentInfo={departmentInfo}
        onRefresh={() => { }}
        listLocations={listLocations}
        listCustomerGroups={listCustomerGroups}
      />

      <MyModalTemplate
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size={"sm"}
      >
        <div className="d-flex flex-column gap-3">
          <div>{titleModal}</div>
          <div
            className="d-flex flex-row justify-content-center"
            style={{ gap: 50 }}
          >
            <Button color="secondary"
              outline
              onClick={() => {
                setIsOpen(false)
                setDeleteId("");
              }}>
              {i18n.t("cancel")}
            </Button>
            <button
              className="btn btn-primary btn-block d-flex gap-1"
              onClick={handleDeleteModal}
            >
              <div className="">{i18n.t("delete")}</div>
            </button>
          </div>
        </div>
      </MyModalTemplate>

      <MyModalTemplate
        isOpen={isOpenGroup}
        onClose={() => setIsOpenGroup(false)}
        size={"sm"}
      >
        <div className="d-flex flex-column gap-3">
          <div>{titleModal}</div>
          <div
            className="d-flex flex-row justify-content-center"
            style={{ gap: 50 }}
          >
            <Button color="secondary"
              outline
              onClick={() => {
                setIsOpenGroup(false)
                setDeleteIdGroup("");
              }}>
              {i18n.t("cancel")}
            </Button>
            <button
              className="btn btn-primary btn-block d-flex gap-1"
              onClick={handleDeleteModalGroup}
            >
              <div className="">{i18n.t("delete")}</div>
            </button>
          </div>
        </div>
      </MyModalTemplate>

    </div>
  );
};

export default withRouter(Department);
