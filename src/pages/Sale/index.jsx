// Function Name : Sale Page
// Created date :  6/8/24             by :  VinhLQ
// Updated date :                     by :  VinhLQ

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, Input, Table, Collapse, Badge } from "reactstrap";
import moment from "moment/moment";

import Breadcrumb from "../../components/Common/Breadcrumb";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import IcPlus from "../../assets/icon/IcPlus";
import MyPagination from "../../components/Common/Mypagination";
import withRouter from "../../components/Common/withRouter";
import saleService from "../../services/sale.service";
import operatorService from "../../services/operator.service";
import staffService from "../../services/staff.service";
import { listStatusSaleOrder } from "../../constants/app.const";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import MyDropdownMultiple from "../../components/Common/MyDropdownMultiple";
import { toast } from "react-toastify";
import i18n from "../../i18n";
import { formatNumberAsCurrency } from "../../utils/app";
import { useAppSelector } from "../../hook/store.hook";
import { debounce } from "lodash";

const Sale = (props) => {
  document.title = "Sale | Actiwell System";
  const [sales, setSales] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedSales, setSelectedSales] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [data, setData] = useState({
    salespersons: [],
    locations: [],
  });
  const [params, setParams] = useState({
    keyword: "",
    staffs: [],
    status: "",
    locations: [],
  });
  const { permissionUser } = useAppSelector((state) => state.auth);

  const createSale = useMemo(() => {
    return permissionUser.includes("sale_order:create");
  }, [permissionUser]);

  const viewDetail = useMemo(() => {
    return permissionUser.includes("sale_order:view_detail");
  }, [permissionUser]);
  const deleteProduct = useMemo(() => {
    return permissionUser.includes("sale_order:delete");
  }, [permissionUser]);

  const handleGetListSale = async () => {
    try {
      const payload = {
        ...params,
        limit: 20,
        page: page,
      };
      setSelectedSales([]);
      const res = await saleService.getListSale(payload);
      setSales(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatus = (status) => {
    return listStatusSaleOrder.find((item) => (item.value === status));
  };

  const handleRedirect = (sale) => {
    if (viewDetail) {
      props.router.navigate(`/sale/detail/${sale.id}`);
    }
  };

  const handleCheckboxChange = (sale) => {
    setSelectedSales((prevSelected) => {
      if (prevSelected.includes(sale)) {
        return prevSelected.filter((no) => no !== sale);
      } else {
        return [...prevSelected, sale];
      }
    });
  };

  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedSales(sales.map((item) => item.id));
    } else {
      setSelectedSales([]);
    }
  };

  const handleDeleteASale = async (id) => {
    try {
      const res = await saleService.deleteASale(id);
      if (res.success) {
        toast.success("Delete Sale successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        await handleGetListSale();
      }
    } catch (e) {
      console.log(e);
      if (e.message == "customer_has_made_booking") {
        toast.error("Customer has made booking", {
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
      const res = await saleService.deleteMultiSale(selectedSales);
      if (res.success) {
        toast.success("Delete Sale successfully", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        await handleGetListSale();
      }
    } catch (e) {
      console.log(e);
      if (e.message == "customer_has_made_booking") {
        toast.error("Customer has made booking", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    }
  };
  const handleDeleteModal = async () => {
    if (deleteId) {
      await handleDeleteASale(deleteId);
    } else {
      await handleDeleteMulti();
    }
    setIsOpen(false);
  };

  const handleResetFilter = () => {
    setParams({
      sale_order_id: "",
      status: "",
      staffs: [],
      locations: [],
    });
  };

  const handleGetLocationForOperator = async () => {
    try {
      const response = await operatorService.getListLocationForOperator();
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
      }
    } catch (e) { }
  };

  const handleGetSalespersonForOperator = async () => {
    try {
      const response = await staffService.getListTrainerForOperator();
      if (response.success) {
        return response.data.map((item) => {
          return {
            value: item.id,
            label: `${item.last_name} ${item.first_name}`,
          };
        });
      }
    } catch (e) { }
  };

  const isAllChecked = useMemo(() => {
    return sales.length === selectedSales.length;
  }, [selectedSales, sales]);

  const titleModal = useMemo(() => {
    return deleteId
      ? "Are you sure you want to delete this sales order?"
      : "Are you sure you want to delete the selected sales orders?";
  }, [deleteId]);

  const fetchData = async () => {
    try {
      const [salespersons, locations] = await Promise.all([
        handleGetSalespersonForOperator(),
        handleGetLocationForOperator(),
      ]);

      setData({
        salespersons: salespersons,
        locations: locations,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    handleGetListSale();
  }, [params, page]);

  useEffect(() => {
    fetchData();
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (sales.length === 0) return;

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
  }, [sales]);

  return (
    <React.Fragment>
      <div className="page-content ">
        <div className="content-container">
          <Breadcrumb title={i18n.t("sales")} />
          <div className="page-container">
            <div className="filter-container">
              <div className="filter-header">
                <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
                  <button className="filter-clear">
                    {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
                  </button>
                  <h5 className="filter-title">{i18n.t("sales_order_list")}</h5>
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
                  <label className="filter-label">{`${i18n.t("name")}/${i18n.t('phone')}`}</label>
                  <InputSearch
                    value={params.id}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        keyword: e,
                      }))
                    }
                    placeholder={`${i18n.t("name")}/${i18n.t('phone')}`}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">{i18n.t("status")}</label>
                  <MyDropdown
                    options={listStatusSaleOrder}
                    selected={params.status}
                    displayEmpty={true}
                    setSelected={(e) =>
                      setParams((prevParams) => ({
                        ...prevParams,
                        status: e,
                      }))
                    }
                    placeholder={i18n.t("status")}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">{i18n.t("location")}</label>
                  <MyDropdownMultiple
                    options={data.locations}
                    placeholder={i18n.t('locations')}
                    selected={params.locations}
                    setSelected={(selected) =>
                      setParams((prev) => ({
                        ...prev,
                        locations: selected,
                      }))
                    }
                    displayEmpty={true}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">{i18n.t("salesperson")}</label>
                  <MyDropdownMultiple
                    options={data.salespersons}
                    placeholder={i18n.t("salesperson")}
                    selected={params.staffs}
                    setSelected={(selected) =>
                      setParams((prev) => ({
                        ...prev,
                        staffs: selected,
                      }))
                    }
                    displayEmpty={true}
                  />
                </div>
              </Collapse>
            </div>
            <div className="action-buttons">
              <Link
                to="create"
                style={{ display: createSale ? "block" : "none" }}
              >
                <button className="btn btn-primary btn-block d-flex gap-1">
                  <IcPlus />
                  <div className="" style={{ lineHeight: "17px" }}>
                    {i18n.t("add_new_sale_order")}
                  </div>
                </button>
              </Link>
              <Button
                color="danger"
                outline={true}
                disabled={selectedSales.length === 0}
                onClick={() => {
                  if (selectedSales.length > 0) {
                    setIsOpen(true);
                  }
                }}
                style={{ display: deleteProduct ? "block" : "none" }}
              >
                {i18n.t("delete_selected")}
              </Button>
            </div>

            {sales.length > 0 ? (
              <>
                <div className="before-table"></div>
                <div className="table-container" ref={tableContainerRef}>
                  <Table className="table mb-0">
                    <thead>
                      <tr>
                        {deleteProduct && (
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
                        <th>{i18n.t("sales_order_id")}</th>
                        <th>{i18n.t("create_date")}</th>
                        <th>{i18n.t("contact_name")}</th>
                        <th>{i18n.t("phone")}</th>
                        <th style={{ maxWidth: '13rem' }}>{i18n.t("salesperson")}</th>
                        <th style={{ textAlign: 'right' }}>{i18n.t("amount_due")}</th>
                        <th style={{ textAlign: 'right' }}>{i18n.t("amount_paid")}</th>
                        <th style={{ textAlign: 'right' }}>{i18n.t("total")}</th>
                        <th>{i18n.t("location")}</th>
                        <th>{i18n.t("status")} </th>
                        {deleteProduct && (
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
                      {sales.map((sale, index) => (
                        <tr key={index} onClick={() => handleRedirect(sale)}>
                          {deleteProduct && (
                            <td>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange(sale.id);
                                }}
                              >
                                <Input
                                  type="checkbox"
                                  checked={selectedSales.includes(sale.id)}
                                  onChange={() => { }}
                                />
                              </div>
                            </td>
                          )}

                          <td>{sale.sale_order_number}</td>
                          <td>
                            {moment(sale.created_at).format("DD-MM-yyyy")}
                          </td>
                          <td>
                            {sale?.customer?.last_name}{" "}
                            {sale?.customer?.first_name}
                          </td>
                          <td>{sale?.customer?.phone}</td>
                          <td style={{ maxWidth: '13rem' }}>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                              }}
                            >
                              {sale.sale_persons.map((location, index) => (
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
                                  {location.last_name} {location.first_name}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={{ textAlign: "end" }}>{formatNumberAsCurrency(sale.total_amount - sale.paid_amount)}</td>
                          <td style={{ textAlign: "end" }}>{formatNumberAsCurrency(sale.paid_amount)}</td>
                          <td style={{ textAlign: "end" }}>{formatNumberAsCurrency(sale.total_amount)}</td>
                          <td>{sale.location.name}</td>
                          <td>
                            <Badge
                              className={"badge-" + getStatus(sale.status)?.badge}
                              color="none"
                            >
                              {getStatus(sale.status)?.label}
                            </Badge>
                          </td>
                          {deleteProduct && (
                            <td>
                              <div className="d-flex gap-1 justify-content-center align-items-center">
                                <button
                                  className="btn btn-delete-outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(true);
                                    setDeleteId(sale.id);
                                  }}
                                >
                                  {i18n.t("delete")}
                                </button>
                                <button
                                  className="btn btn-outline"
                                  onClick={() => handleRedirect(sale)}
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
            ) : (
              <div className="d-flex justify-content-center d-flex align-items-center h-100">
                <div>{i18n.t('there_are_no_data_exist')}</div>
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
      </div>
    </React.Fragment>
  );
};
Sale.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(Sale);
