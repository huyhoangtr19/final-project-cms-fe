// Function Name : Customer Page
// Created date :  30/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, Input, Row, TabContent, Table, TabPane, Collapse, Badge } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumb from "../../components/Common/Breadcrumb";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import IcPlus from "../../assets/icon/IcPlus";
import MyPagination from "../../components/Common/Mypagination";
import withRouter from "../../components/Common/withRouter";
import customerService from "../../services/customer.service";
import customerGroupService from "../../services/customer.group.service";
import { listLabelCustomer, labelTypeCustomer, listStatus } from "../../constants/app.const";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import PackageTabCustomer from "./PackageTabCustomer";
import CustomerKanban from "./CustomerKanban";
import { debounce, isArray } from "lodash";

const Customer = (props) => {
  document.title = "Customer | Actiwell System";
  const { permissionUser } = useAppSelector((state) => state.auth);
  //   const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const [customers, setCustomers] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [city, setCity] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [currentTabActive, setCurrentTabActive] = useState('contact_list')
  const [isOpenImport, setIsOpenImport] = useState(false);
  const [customerGroups, setCustomerGroups] = useState([])

  const handleResetFilter = () => {
    setSearchName("");
    setCity("");
  };

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
      setSelectedLocations(customers.map((item) => item.id));
    } else {
      setSelectedLocations([]);
    }
  };

  const handleDeleteALocation = async (id) => {
    try {
      const res = await customerService.deleteACustomer(id);
      if (res.success) {
        toast.success("Delete customer successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListCustomer();
      }
    } catch (e) {
      console.log(e);
      if (e.message === "customer_has_sale_order") {
        toast.error("Customer has Sale Orders", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      } else {
        toast.error("Delete customer fail", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } finally {
      setDeleteId("");
    }
  };
  const handleDeleteMulti = async () => {
    try {
      const res = await customerService.deleteMultiCustomer(selectedLocations);
      if (res.success) {
        toast.success("Delete Multiple Contact successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        setSelectedLocations([]);
        handleGetListCustomer();
      }
    } catch (e) {
      if (e.message === "customer_has_sale_order") {
        toast.error("Customer has Sale Orders", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      } else {
        toast.error("Customer Multiple Contact Fail", {
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
      handleDeleteALocation(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };
  const handleGetListCustomer = async () => {
    try {
      const payload = {
        keyword: searchName,
        stage: city,
        limit: 20,
        page: page,
      };

      const res = await customerService.getListCustomer(payload);
      setCustomers(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };
  const handleGetListCustomerGroup = async () => {
    try {
      const res = await customerGroupService.getListCustomerGroups();
      if (res.success) {
        setCustomerGroups(res.data);
      }
    } catch (e) {
      console.log("error: ", e);
    }
  }

  const getState = (status) => {
    switch (status) {
      case 0:
        return i18n.t("new");
      case 1:
        return i18n.t("open");
      case 2:
        return i18n.t("potential");
      case 3:
        return i18n.t("active_status");
    }
  };

  const getStateSeverity = (status) => {
    switch (status) {
      case 0:
        return "primary";
      case 1:
        return "success";
      case 2:
        return "warning";
      case 3:
        return "success";
    }
  }

  const getLabel = (label) => {
    if (!label && label !== 0) {
      return "-";
    }
    return listLabelCustomer.find(
      (item) => item.value.toString() === label.toString()
    ).label;
  };

  const getClassBadge = (label) => {
    if (!label && label !== 0) {
      return "-";
    }

    return labelTypeCustomer.find(
      (item) => item.value.toString() === label.toString()
    ).label;
  };

  const handleRedirect = (customer) => {
    props.router.navigate(
      `/customer/detail/${customer.id}/${customer.customer_id}`
    );
  };

  const handleSyncHanetData = async () => {
    try {
      const res = await customerService.syncCustomerFromHanet();
      if (res.success) {
        toast.success(i18n.t("sync_hanet_data_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        await handleGetListCustomer();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleImportCustomers = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length) {
        const formData = new FormData();
        formData.append("file", files[0]);

        const response = await toast.promise(
          customerService.importCustomerFromExcelFile(formData),
          {
            pending: i18n.t("import_loading"),
            success: i18n.t("customer_imported_successfully")
          },
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            theme: "light",
          }
        );

        if (response.success) {
          handleGetListCustomer();
        }

      }
    } catch (error) {
      console.log(error);
      if (!error.success) {
        const errorList = error.message;

        if (isArray(errorList)) {
          // Group errors by row
          const groupedErrors = {};
          errorList.forEach(({ row, error }) => {
            if (!groupedErrors[row]) {
              groupedErrors[row] = [];
            }
            groupedErrors[row].push(...error);
          });

          toast(
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => toast.dismiss()}
                className="btn btn-secondary"
                style={{ width: "80%" }}
              >
                {i18n.t("dismiss_all")}
              </button>
            </div>,
            { autoClose: false }
          );

          // Show toast for each row
          Object.entries(groupedErrors).forEach(([row, errors]) => {
            toast.error(
              `Row ${row}:\n- ${errors.join("\n- ")}`,
              {
                autoClose: false,
                style: { whiteSpace: 'pre-line', closeOnClick: true }
              }
            );
          });
        }
      }
    } finally {
      setIsOpenImport(false);
    }
  };

  const isAllChecked = useMemo(() => {
    return customers.length === selectedLocations.length;
  }, [selectedLocations, customers]);

  const titleModal = useMemo(() => {
    return deleteId
      ? "Are you sure you want to delete this contact?"
      : "Are you sure you want to delete selected contact?";
  }, [deleteId]);
  const canAddCustomer = useMemo(() => {
    return permissionUser.includes("customer:create");
  }, [permissionUser]);
  const canDelete = useMemo(() => {
    return permissionUser.includes("customer:delete");
  }, [permissionUser]);
  // const canUpdateStatus = useMemo(() => {
  //   return permissionUser.includes("customer:create");
  // }, [permissionUser]);

  useEffect(() => {
    handleGetListCustomer();
  }, [page, searchName, city]);

  useEffect(() => {
    handleGetListCustomerGroup();
  }, [])

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {
    if (customers.length === 0) return;

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
  }, [customers]);

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="tabs-container">
          <Breadcrumb title={i18n.t("customer")} />
          <div className="p-0">
            <div className="tabs-header">
              <div
                key={1}
                onClick={() => setCurrentTabActive('contact_list')}
                className={"text-center tab-item " + (currentTabActive === 'contact_list' ? "active" : "")}
              >
                {i18n.t("contact_list")}
              </div>
              <div
                key={2}
                onClick={() => setCurrentTabActive('contact_kanban')}
                className={"text-center tab-item " + (currentTabActive === 'contact_kanban' ? "active" : "")}
              >
                {i18n.t("contact_kanban")}
              </div>
              <div
                key={3}
                onClick={() => setCurrentTabActive('package')}
                className={"text-center tab-item " + (currentTabActive === 'package' ? "active" : "")}
              >
                {i18n.t("package")}
              </div>
            </div>
            <TabContent activeTab={currentTabActive}>
              <TabPane tabId="contact_list">
                <div className="filter-container">
                  <div className="filter-header">
                    <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
                      <button
                        className="filter-clear"
                      >
                        {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
                      </button>
                      <h5 className="filter-title">{i18n.t("contact_list")}</h5>
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
                      <label className="filter-label">{`${i18n.t("cus_id")}/${i18n.t("name")}/${i18n.t("phone")}/Email`}</label>
                      <InputSearch
                        value={searchName}
                        onChange={(e) => setSearchName(e)}
                        placeholder={`${i18n.t("cus_id")}/${i18n.t(
                          "name"
                        )}/${i18n.t("phone")}/Email`}
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
                <div className="mb-3">
                  <div className="action-buttons">
                    <Link
                      to="create"
                      style={{
                        display: canAddCustomer ? "block" : "none",
                      }}
                    >
                      <button className="btn btn-primary btn-block d-flex gap-1">
                        <IcPlus color="white" />
                        <div className="" style={{ lineHeight: "17px" }}>
                          {i18n.t("add_new_contact")}
                        </div>
                      </button>
                    </Link>
                    <Button
                      color="primary"
                      onClick={() => setIsOpenImport(true)}
                    >
                      <i className="fa fa-file-import" style={{ padding: "0 5px" }}></i>
                      {i18n.t("import_customers")}
                    </Button>
                    <div
                      onClick={handleSyncHanetData}
                      className="btn btn-primary btn-block d-flex gap-1">
                      <div className="" style={{ lineHeight: "17px" }}>
                        {i18n.t("sync_hanet_data")}
                      </div>
                    </div>
                    <Button
                      color="danger"
                      outline
                      style={{
                        display: canDelete ? "block" : "none",
                      }}
                      disabled={selectedLocations.length === 0}
                      onClick={() => {
                        if (selectedLocations.length > 0) {
                          setIsOpen(true);
                        }
                      }}
                    >
                      {i18n.t("delete_selected")}
                    </Button>
                  </div>
                </div>
                <MyModalTemplate
                  isOpen={isOpenImport}
                  onClose={() => setIsOpenImport(false)}
                  width={"unset"}

                >
                  <div className="d-flex flex-column ">
                    <div
                      className=""
                      style={{
                        border: "2px dashed #000",
                        borderRadius: "8px",
                        padding: "0",
                        textAlign: "center",
                        color: "#000",
                        background: "#fff",
                      }}
                    >
                      <div className="m-0">
                        <label className="m-0" htmlFor="import-customers"
                          style={{ padding: "28px 0", width: "100%", cursor: "pointer" }}
                        >
                          <div className="d-flex flex-column gap-1 align-items-center justify-content-center"
                          >
                            <IcPlus color="#000" />
                            <div className="" style={{ lineHeight: "17px" }}>
                              {i18n.t("import_customers_from_excel")}
                            </div>
                          </div>
                        </label>
                        <input
                          type="file"
                          id="import-customers"
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          style={{ display: "none" }}
                          onChange={handleImportCustomers}
                        />
                      </div>
                    </div>
                    <div className="d-flex items-start mt-3">
                      <a
                        className="btn btn-primary btn-block"
                        href={"/templates/" + i18n.t("current_language") + "/import_customers_template.xlsx"}
                      >
                        {i18n.t("download_template")}
                      </a>
                    </div>
                  </div>
                </MyModalTemplate>
                {customers.length > 0 ? (
                  <>
                    <div className="before-table" ref={beforeTableRef}></div>
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
                            <th>{i18n.t('no')}</th>
                            <th>{i18n.t("contact_id")}</th>
                            <th>{i18n.t("contact_name")}</th>
                            <th style={{ width: "18rem" }}>{i18n.t("customer_group")}</th>
                            <th style={{ width: "5rem" }}>{i18n.t("label")}</th>
                            <th>{i18n.t('email')}</th>
                            <th>{i18n.t("phone")}</th>
                            <th style={{ width: "5rem" }}>{i18n.t("status")}</th>
                            <th style={{ width: "120px" }}>{i18n.t("action")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.map((customer, index) => {
                            const customer_group = customerGroups.find((el) => Number(el.id) === Number(customer.customer_group_id));

                            return (
                              <tr
                                key={index} onClick={() => handleRedirect(customer)}
                              >
                                {canDelete && (
                                  <td>
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCheckboxChange(customer.id);
                                      }}
                                    >
                                      <Input
                                        type="checkbox"
                                        checked={selectedLocations.includes(
                                          customer.id
                                        )}
                                        onChange={() => { }}
                                      />
                                    </div>
                                  </td>
                                )}
                                <td>{(page - 1) * 20 + (index + 1)}</td>
                                <td>{customer.c_id}</td>
                                <td>
                                  {customer.last_name} {customer.first_name}
                                </td>
                                <td style={{ textAlign: customer_group ? "left" : "center" }}>
                                  {
                                    customer_group
                                      ? customer_group.name
                                      : "-"
                                  }
                                </td>
                                <td>
                                  <Badge
                                    color="none"
                                    className={"badge-" + getClassBadge(customer.label).toLowerCase()}
                                  >
                                    {getLabel(customer.label)}
                                  </Badge>
                                </td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td>
                                  <Badge
                                    className={"badge-" + getStateSeverity(customer.stage_id)}
                                    color="none"
                                  >
                                    {getState(customer.stage_id)}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="d-flex flex-row gap-2">
                                    {canDelete && (
                                      <button
                                        className="btn btn-delete-outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsOpen(true);
                                          setDeleteId(customer.id);
                                          // handleDeleteALocation(location.id);
                                        }}
                                      >
                                        {i18n.t("delete")}
                                      </button>
                                    )}
                                    <button
                                      className="btn btn-outline"
                                      onClick={() => handleRedirect(customer)}
                                    >
                                      {i18n.t("update")}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="d-flex justify-content-center align-items-center">
                    <div>{i18n.t('no_contact_exist')}</div>
                  </div>
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
                        <div className="">Delete</div>
                      </button>
                    </div>
                  </div>
                </MyModalTemplate>
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
              </TabPane>

              <TabPane tabId="contact_kanban">
                <CustomerKanban list={customers} isActive={currentTabActive === 'contact_kanban'} fetchData={handleGetListCustomer} />
              </TabPane>

              <TabPane tabId="package">
                <PackageTabCustomer isActive={currentTabActive === 'package'} />
              </TabPane>
            </TabContent>
          </div>
        </div>
      </div>
    </React.Fragment >
  );
};
Customer.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(Customer);
