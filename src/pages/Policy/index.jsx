import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Input, Table } from "reactstrap";
import { toast } from "react-toastify";
import { useAppSelector } from "../../hook/store.hook";
import i18n from "../../i18n";
import policyService from "../../services/policy.service";
import withRouter from "../../components/Common/withRouter"
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import { debounce } from "lodash";
import { listStatusPolicy, listKindPackage } from "../../constants/app.const";
import MyPagination from "../../components/Common/Mypagination";

const Policy = (props) => {
  const { permissionUser } = useAppSelector((state) => state.auth);

  const [policies, setPolicies] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const canAdd = useMemo(() => permissionUser.includes("policy:create"), [permissionUser]);
  const canDelete = useMemo(() => permissionUser.includes("policy:delete"), [permissionUser]);

  const handleGetPolicies = async () => {
    try {
      const payload = {
        limit: 20,
        page: page,
      };
      setSelectedPolicies([]);
      const policies = await policyService.getListPolicies(payload);
      if (policies.success) {
        console.log("policies", policies.data);
        setPolicies(policies.data);
        setTotalRecord(policies.meta.total);
        setTotalPage(policies.meta.last_page);
      } else {
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

  const handleDeletePolicy = async (id) => {
    try {
      const res = await policyService.deletePolicy(id);
      if (res.success) {
        toast.success("Deleted successfully", {
          position: "top-right",
          autoClose: 200,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetPolicies();
      }
    } catch (err) {
      toast.error("Delete failed", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        hideProgressBar: true,
      });
    }
    setDeleteId(null);
  };

  const handleDeleteMultiple = async () => {
    try {
      const res = await policyService.deleteMultiPolicies(selectedPolicies);
      if (res.success) {
        toast.success("Deleted selected segments", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        setSelectedPolicies([]);
        handleGetPolicies();
      }
    } catch (err) {
      console.log(err)
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
      handleDeletePolicy(deleteId);
    } else {
      handleDeleteMultiple();
    }
    setIsOpen(false);
  };

  const handleCheckboxChange = (policy) => {
    setSelectedPolicies((prevSelected) => {
      if (prevSelected.includes(policy)) {
        return prevSelected.filter((no) => no !== policy);
      } else {
        return [...prevSelected, policy];
      }
    });
  };

  const isAllChecked = useMemo(() => {
    return policies.length === selectedPolicies.length;
  }, [selectedPolicies, policies]);

  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedPolicies(policies.map((item) => item.id));
    } else {
      setSelectedPolicies([]);
    }
  };

  const getStatus = (status) => {
    return listStatusPolicy.find((item) => (item.value === status));
  };

  const getPackageKind = (kind) => {
    return listKindPackage.find((item) => (item.value === kind));
  }

  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t("delete_policy_message")
      : i18n.t("delete_policies_message");
  }, [deleteId]);

  useEffect(() => {
    handleGetPolicies();
  }, []);

  const handleRedirect = (policy) => {
    props.router.navigate(`/policy/detail/${policy.id}`);
  };

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (policies.length === 0) return;

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
  }, [policies]);

  return (
    <>
      <div className="action-buttons">
        <h5 className="mb-0 d-flex"
          style={{ alignItems: "center" }}
        >
          {i18n.t("policy")}
        </h5>
        <div className="action-buttons">
          {canAdd && (
            <Button
              color="primary"
              onClick={() => {props.router.navigate("/policy/create")}}
            >
              {i18n.t("add_policy")}
            </Button>
          )}
          {canDelete && (
            <Button
              color="danger"
              outline
              disabled={selectedPolicies.length === 0}
              onClick={() => {
                if (selectedPolicies.length > 0) {
                  setIsOpen(true);
                }
              }}
            >
              {i18n.t("delete_selected")}
            </Button>
          )}
        </div>
      </div>

      {policies && policies.length > 0 ? (
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
                  <th>{i18n.t("id")}</th>
                  <th>{i18n.t("name")}</th>
                  <th>{i18n.t("package_kind")}</th>
                  <th>{i18n.t("status")} </th>
                  {canDelete && (
                    <th
                      style={{
                        width: 130,
                      }}
                    >
                      {i18n.t("action")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {policies.map((policy, index) => (
                  <tr key={index} onClick={() => handleRedirect(policy)}>
                    {canDelete && (
                      <td>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(policy.id);
                          }}
                        >
                          <Input
                            type="checkbox"
                            checked={selectedPolicies.includes(policy.id)}
                            onChange={() => { }}
                          />
                        </div>
                      </td>
                    )}
                    <td>{policy.id}</td>
                    <td>{policy.name}</td>
                    <td>{getPackageKind(policy.package_kind)?.label}</td>
                    <td>
                      <Badge
                        className={"badge-" + getStatus(policy.status)?.badge}
                        color="none"
                      >
                        {getStatus(policy.status)?.label}
                      </Badge>
                    </td>
                    {canDelete && (
                      <td>
                        <div className="d-flex gap-1 justify-content-center align-items-center">
                          <button
                            className="btn btn-delete-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(true);
                              setDeleteId(policy.id);
                            }}
                          >
                            {i18n.t("delete")}
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleRedirect(policy)}
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
          <div>{i18n.t('there_are_no_data_exist')}</div>
        </div>
      )}

      <MyModalTemplate
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="sm"
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
    </>
  )
}

export default withRouter(Policy);