import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Button, Input, Table } from "reactstrap";
import i18n from "i18next";
import { toast } from "react-toastify";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import customerGroupService from "../../services/customer.group.service";
import { useAppSelector } from "../../hook/store.hook";
import withRouter from "../../components/Common/withRouter";
import ModalCustomer from "./ModalCustomerGroup";
import ModalCustomerGroup from "./ModalCustomerGroup";
import { debounce } from "lodash";

const CustomerGroup = (props) => {
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [selectedCustomerGroups, setSelectedCustomerGroups] = useState([]);
  const [deleteIdGroup, setDeleteIdGroup] = useState(null);
  const [isOpenGroup, setIsOpenGroup] = useState(false);
  const [isOpenCustomerGroupModal, setIsOpenCustomerGroupModal] = useState(false);
  const [customerGroupInfo, setCustomerGroupInfo] = useState(null);
  const [typeGroup, setTypeGroup] = useState('create');

  const canAdd = useMemo(() => permissionUser.includes("customer_group:create"), [permissionUser]);
  const canDelete = useMemo(() => permissionUser.includes("customer_group:delete"), [permissionUser]);
  const isAllChecked = useMemo(() => customerGroups.length > 0 && customerGroups.length === selectedCustomerGroups.length, [customerGroups, selectedCustomerGroups]);

  const handleGetCustomerGroups = async () => {
    try {
      const res = await customerGroupService.getListCustomerGroups({});
      if (res.success) {
        setCustomerGroups(res.data);
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

  const handleDeleteCustomerGroup = async (id) => {
    try {
      const res = await customerGroupService.deleteCustomerGroup(id);
      if (res.success) {
        toast.success("Deleted successfully", {
          position: "top-right",
          autoClose: 200,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetCustomerGroups();
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

  const handleDeleteMultipleGroup = async () => {
    try {
      const res = await customerGroupService.deleteMultiCustomerGroup(selectedCustomerGroups);
      if (res.success) {
        toast.success("Deleted selected customers", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        setSelectedCustomerGroups([]);
        handleGetCustomerGroups();
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

  const handleDeleteModalGroup = () => {
    if (deleteIdGroup) {
      handleDeleteCustomerGroup(deleteIdGroup);
    } else {
      handleDeleteMultipleGroup();
    }
    setIsOpenGroup(false);
  };

  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedCustomerGroups(customerGroups.map((item) => item.id));
    } else {
      setSelectedCustomerGroups([]);
    }
  };

  const handleCheckboxChangeGroup = useCallback((id) => {
    setSelectedCustomerGroups((prev) =>
      prev.includes(Number(id))
        ? prev.filter((sid) => sid !== Number(id))
        : [...prev, Number(id)]
    );
  }, []);

  const openCustomerGroupDetail = useCallback((customerGroup) => {
    setCustomerGroupInfo(customerGroup);
    setTypeGroup(customerGroup === null ? 'create' : 'update');
    setIsOpenCustomerGroupModal(true);
  }, []);

  const titleModal = useMemo(() => {
    return deleteIdGroup
      ? "Are you sure you want to delete this customer group?"
      : "Are you sure you want to delete selected customer groups?";
  }, [deleteIdGroup]);

  useEffect(() => {
    if (!isOpenCustomerGroupModal)
      handleGetCustomerGroups();
  }, [isOpenCustomerGroupModal]);

  useEffect(() => {
    handleGetCustomerGroups();
  }, [])

  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (customerGroups.length === 0) return;

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
  }, [customerGroups]);

  return (
    <div className="">
      <div className="">
        <div className="action-buttons">
          <h5 className="mb-0 d-flex"
            style={{ alignItems: "center" }}
          >
            {customerGroups.length <= 1 ? i18n.t("customer_group") : i18n.t("customer_groups")}
          </h5>
          <div className="action-buttons mb-1">
            {canAdd && (
              <Button color="primary"
                onClick={() => openCustomerGroupDetail(null)}
              >
                {i18n.t("add_customer_group")}
              </Button>
            )}
            {canDelete && (
              <Button
                color="danger"
                outline
                disabled={selectedCustomerGroups.length === 0}
                onClick={() => setIsOpenGroup(true)}
              >
                {i18n.t("delete_selected_groups")}
              </Button>
            )}
          </div>
        </div>

        {customerGroups.length > 0 && (
          <>
            <div className="before-table"></div>
            <div className="table-container" ref={tableContainerRef}>
              <Table className="table mb-0">
                <thead>
                  <tr>
                    {canDelete && (
                      <th style={{ width: "50px" }}>
                        <div onClick={handleCheckAll}>
                          <Input
                            type="checkbox"
                            checked={isAllChecked}
                            onChange={() => { }}
                          />
                        </div>
                      </th>
                    )}
                    <th >{i18n.t("name")}</th>
                    {canDelete && (
                      <th
                        style={{
                          width: "150px"
                        }}
                      >
                        {i18n.t("action")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {customerGroups.map((customerGroup, index) => (
                    <tr key={index} onClick={() => openCustomerGroupDetail(customerGroup)}>
                      {canDelete && (
                        <td style={{ width: "50px" }}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChangeGroup(customerGroup.id);
                            }}
                          >
                            <Input
                              type="checkbox"
                              checked={selectedCustomerGroups.includes(customerGroup.id)}
                              onChange={() => { }}
                            />
                          </div>
                        </td>
                      )}
                      <td style={{ wordBreak: "break-all" }}>
                        {customerGroup?.name}
                      </td>
                      {canDelete && (
                        <td style={{
                          display: "flex",
                          justifyContent: "left",
                          width: "150px"
                        }}>
                          <div className="d-flex gap-1 justify-content-center align-items-center">
                            <button
                              className="btn btn-delete-outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpenGroup(true);
                                setDeleteIdGroup(customerGroup.id);
                              }}
                            >
                              {i18n.t("delete")}
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={() => openCustomerGroupDetail(customerGroup)}
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

      <ModalCustomerGroup
        type={typeGroup}
        isOpen={isOpenCustomerGroupModal}
        onClose={() => setIsOpenCustomerGroupModal(false)}
        customerGroupInfo={customerGroupInfo}
      />

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

export default withRouter(CustomerGroup);
