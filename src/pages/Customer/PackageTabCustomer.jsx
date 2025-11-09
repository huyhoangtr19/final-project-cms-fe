// Function Name : Product Category List
// Created date :  12/8/24             by :  NgVinh
// Updated date :                      by :  NgVinh
import React, { useEffect, useRef, useState } from "react";
import { Badge, Col, Collapse, Row, Table } from "reactstrap";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import { listStatusPackageExpired } from "../../constants/app.const";
import packageService from "../../services/package.service";

import MyPagination from "../../components/Common/Mypagination";

import i18n from "../../i18n";
import customerService from "../../services/customer.service";
import operatorService from "../../services/operator.service";
import ModalPackage from "../Package/ModalPackage";
import { debounce } from "lodash";

const PackageTabCustomer = ({ isActive }) => {
  const [products, setProducts] = React.useState([]);
  const [totalRecord, setTotalRecord] = React.useState(0);
  const [totalPage, setTotalPage] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [params, setParams] = React.useState({
    keyword: "",
    location_id: "",
    status: "",
    package_id: "",
  });
  const [data, setData] = React.useState({
    location: [],
    package: [],
  });
  const [isShowPackage, setIsShowPackage] = React.useState(false);
  const [selectedPackageDetail, setSelectedPackageDetail] =
    React.useState(null);

  function formatDate(dateTimeString) {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const getColor = (value) => {
    return listStatusPackageExpired.find((item) => item.value === value);
  };

  const handleGetProductList = async () => {
    try {
      const payload = {
        ...params,
        limit: 20,
        page: page,
      };

      const res = await customerService.getListPackageCustomer(payload);
      setProducts(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };
  const handleResetFilter = () => {
    setParams({
      keyword: "",
      location_id: "",
      status: "",
      package_id: "",
    });
  };
  const handleGetPackageForOperator = async () => {
    try {
      console.log(1);
      const response = await packageService.getListPackageForOperator();
      console.log({ response });
      if (response.success) {
        setData((prev) => ({
          ...prev,
          package: response.data.map((item) => {
            return {
              value: item.id,
              label: item?.name,
            };
          }),
        }));
      }
    } catch (e) { }
  };
  const handleGetLocationForOperator = async () => {
    try {
      const response = await operatorService.getListLocationForOperator();
      if (response.success) {
        setData((prev) => ({
          ...prev,
          location: response.data.map((item) => {
            return {
              value: item.id,
              label: item?.name,
            };
          }),
        }));
      }
    } catch (e) { }
  };
  useEffect(() => {
    handleGetLocationForOperator();
    handleGetPackageForOperator();
  }, []);

  useEffect(() => {
    handleGetProductList();
  }, [page, params]);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {
    if (!isActive || products.length === 0) return;

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
  }, [isActive, products]);

  return (
    <div className="d-flex flex-column flex-1">
      <div className="filter-container">
        <div className="filter-header">
          <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
            <button
              className="filter-clear"
            >
              {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
            </button>
            <h5 className="filter-title">{i18n.t("package")}</h5>
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
            <label className="filter-label">{i18n.t("customer_id")}</label>
            <InputSearch
              value={params.keyword}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  keyword: e,
                }))
              }
              placeholder={i18n.t('customer_id')}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{i18n.t("location")}</label>
            <MyDropdown
              options={data.location}
              selected={params.location_id}
              displayEmpty={true}
              setSelected={(e) =>
                setParams((prevParams) => ({
                  ...prevParams,
                  location_id: e,
                }))
              }
              placeholder={i18n.t("location")}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{i18n.t("status")}</label>
            <MyDropdown
              options={listStatusPackageExpired}
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
            <label className="filter-label">{i18n.t("package")}</label>
            <MyDropdown
              options={data.package}
              selected={params.package_id}
              displayEmpty={true}
              setSelected={(e) =>
                setParams((prevParams) => ({
                  ...prevParams,
                  package_id: e,
                }))
              }
              placeholder={i18n.t("package")}
            />
          </div>
        </Collapse>
      </div>

      {products.length > 0 ? (
        <>
          <div className="before-table" ref={beforeTableRef}></div>
          <div className="table-container" ref={tableContainerRef}>
            <Table className="table mb-0">
              <thead>
                <tr>
                  <th>{i18n.t("cus_id")}</th>
                  <th>{i18n.t("status")}</th>
                  <th>{i18n.t("name")}</th>
                  <th>{i18n.t("phone")}</th>
                  <th>{i18n.t("package_name")}</th>
                  <th>{i18n.t("start_date")}</th>
                  <th>{i18n.t("Date Expired")}</th>
                  <th>{i18n.t("email")}</th>
                  <th>{i18n.t("location")}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => {
                      setSelectedPackageDetail({ id: item.package.id });
                    }}
                  >
                    <td>{item?.customer?.id}</td>
                    <td>
                      <Badge
                        color="none"
                        className={"badge-" + getColor(item?.status).badge}
                      >
                        {getColor(item?.status)?.label}
                      </Badge>
                    </td>
                    <td>
                      {item?.customer?.last_name +
                        " " +
                        item?.customer?.first_name}
                    </td>
                    <td>{item?.customer?.phone}</td>
                    <td>{item.package.package_name}</td>
                    <td>{formatDate(item.start_date)}</td>
                    <td>{formatDate(item.end_date)}</td>
                    <td>{item?.customer?.email}</td>
                    <td>{item?.location?.name}</td>
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
        <div className="d-flex justify-content-center d-flex align-items-center h-100 mt-4">
          <div>{i18n.t("no_packages_exist")}</div>
        </div>
      )
      }
      {
        isShowPackage && (
          <ModalPackage
            isOpen={isShowPackage}
            onClose={() => setIsShowPackage(false)}
            onAdd={() => { handleGetProductList() }}
            isAdd={false}
            serviceInfo={selectedPackageDetail}
          />
        )
      }
    </div >
  );
};
export default PackageTabCustomer;
