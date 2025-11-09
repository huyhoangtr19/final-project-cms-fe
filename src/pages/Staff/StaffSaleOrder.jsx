import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "../../hook/store.hook";
import { formatNumberAsCurrency } from "../../utils/app";
import { Table, Badge } from "reactstrap";
import { debounce } from "lodash";
import { listStatusSaleOrder } from "../../constants/app.const";
import saleService from "../../services/sale.service"
import i18n from "../../i18n";
import moment from "moment";
import withRouter from "../../components/Common/withRouter";
import MyPagination from "../../components/Common/Mypagination";

const StaffSaleOrder = (props) => {
  const { permissionUser } = useAppSelector((state) => state.auth);
  const viewDetail = useMemo(() => {
    return permissionUser.includes("sale_order:view_detail");
  }, [permissionUser]);

  const [data, setData] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);

  const handleFetchSaleOrderData = async () => {
    const payload = {
      staff_ids: [props.staffId],
      limit: 10,
      page: page,
    };
    try {
      const response = await saleService.getListSale(payload);
      if (response.success) {
        setData(response.data);
        setTotalRecord(response.meta.total);
        setTotalPage(response.meta.last_page);

        // Forward data to the parent component
        props.onDataLoaded?.(response.data);
      }
    } catch (e) {
      console.error("Error: ", e);
    }
  }

  const getStatus = (status) => {
    return listStatusSaleOrder.find((item) => (item.value === status));
  };

  const handleRedirect = (sale) => {
    if (viewDetail) {
      props.router.navigate(`/sale/detail/${sale.id}?callback=${window.location.pathname}`);
    }
  };

  useEffect(() => {
    handleFetchSaleOrderData();
  }, [props.staffId, page]);

  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {
    if (!props.isActive || data.length === 0) return;

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
  }, [props.isActive, data]);

  return (
    <div className="mb-4">
      <h5 className="staff-name">{i18n.t("sale_order")}</h5>
      {data.length > 0 ? (
        <>
          <div className="before-table" ref={beforeTableRef}></div>
          <div className="table-container" ref={tableContainerRef}>
            <Table className="table mb-0">
              <thead>
                <tr>
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
                </tr>
              </thead>
              <tbody>
                {data.map((sale, index) => (
                  <tr key={index} onClick={() => handleRedirect(sale)}>
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
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <MyPagination
            page={page}
            totalRecord={totalRecord}
            rowPerPage={10}
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
    </div>
  )
}

export default withRouter(StaffSaleOrder);