import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "../../hook/store.hook";
import { debounce } from "lodash";
import withRouter from "../../components/Common/withRouter";
import i18n from "../../i18n";
import saleService from "../../services/sale.service";
import DashboardCard from "./dashboardCard";
import MyPagination from "../../components/Common/Mypagination";
import { formatNumberAsCurrency } from "../../utils/app";
import { Badge } from "reactstrap";
import { listStatusContract, listStatusSaleOrder } from "../../constants/app.const";

const BlackBook = (props) => {
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    try {
      const payload = {
        limit: 6,
        page: page,
        date: new Date().toISOString().slice(0, 10),
      };
      if (props.location_id) {
        payload.location_id = props.location_id;
      }
      const res = await saleService.getListSale(payload);
      setData(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  const viewDetail = useMemo(() => {
    return permissionUser.includes("sale_order:view_detail");
  }, [permissionUser]);

  const handleRedirect = (sale) => {
    if (viewDetail) {
      props.router.navigate(`/sale/detail/${sale.id}`);
    }
  };

  const getSaleOrderStatus = (status) => {
    return listStatusSaleOrder.find((item) => (item.value === status));
  };

  const getContractStatus = (status) => {
    return listStatusContract.find((item) => (item.value === status));
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (data.length === 0) return;

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
  }, [data]);

  return (
    <DashboardCard
      title={i18n.t("black_book")}
    >
      {data.length > 0 ? (
        <>
          <div className="table-container" ref={tableContainerRef}>
            <table className="table table-dashboard mb-0">
              <thead>
                <tr>
                  <th>{i18n.t("time")}</th>
                  <th>{i18n.t("transaction_type")}</th>
                  <th>{i18n.t("member")}</th>
                  <th>{i18n.t("contract")}</th>
                  <th>{i18n.t("staff")}</th>
                  <th style={{ textAlign: "end" }}>{i18n.t("total_amount")}</th>
                  <th>{i18n.t("status")}</th>
                  <th>{i18n.t("amount_paid")}</th>
                  <th>{i18n.t("customer_source")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((sale, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRedirect(sale)}
                  >
                    <td>
                      {new Date(sale.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td>
                      <Badge
                        className={"badge-" + getContractStatus(0)?.badge}
                        color="none"
                      >
                        {getContractStatus(0)?.label}
                      </Badge>
                    </td>
                    <td>
                      {`${sale.customer.last_name} ${sale.customer.first_name}`} <br />
                      <span className="indication">{sale.customer.phone || "-"}</span>
                    </td>
                    <td>
                      {sale.packages.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "2px 5px",
                            backgroundColor: "#F5F5F5",
                            color: "#000",
                            fontSize: "10px",
                            width: 'fit-content'
                          }}
                        >
                          {item.package_name}
                        </div>
                      ))}
                      {sale.contracts.map((item, index) => (
                        <div key={index}>
                          {item.name}
                        </div>
                      ))}
                    </td>
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
                    <td style={{ textAlign: "end" }}>
                      {formatNumberAsCurrency(sale.total_amount)}
                    </td>
                    <td>
                      <Badge
                        className={"badge-" + getSaleOrderStatus(sale.status)?.badge}
                        color="none"
                      >
                        {getSaleOrderStatus(sale.status)?.label}
                      </Badge>
                    </td>
                    <td>
                      <span className={"indication-" + (getSaleOrderStatus(sale.status)?.badge)}>
                        {formatNumberAsCurrency(sale.paid_amount)}
                      </span>
                    </td>
                    <td>{sale.customer.market_segment_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <MyPagination
            page={page}
            totalRecord={totalRecord}
            rowPerPage={5}
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
        <p style={{ width: "max-content", margin: "auto" }}>{i18n.t("there_are_no_data_exist")}</p>
      )}
    </DashboardCard>
  )
}

export default withRouter(BlackBook);