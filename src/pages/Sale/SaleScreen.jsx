import React, { useEffect, useMemo, useState, useRef } from "react";
import i18n from "../../i18n";
import { Button, Col, Row, TabContent, Table, TabPane } from "reactstrap";
import Breadcrumb from "../../components/Common/Breadcrumb";
import SaleDetail from "./SaleDetail";
import EContract from "./EContract";
import Payment from "./Payment";
import { useParams } from "react-router-dom";
import saleService from "../../services/sale.service";
import moment from "moment";
import operatorService from "../../services/operator.service";
import { debounce } from "lodash";
import EInvoice from "./EInvoice";

const SaleScreen = (props) => {
  const { id } = useParams();
  const titleHead = useMemo(() => {
    switch (props.type) {
      case "create":
        return i18n.t("add_new_sale_order");
      case "detail":
        return i18n.t("sales_detail");
      default:
        return i18n.t("sales_detail");
    }
  }, [props.type]);
  const [currentTabActive, setCurrentTabActive] = useState(0);
  const [dataSale, setDataSale] = useState(null);
  const [location, setLocation] = useState(null);
  const [isRetry, setIsRetry] = useState(false);

  const listSections = [
    { name: i18n.t("sales_detail"), id: 0 },
    { name: i18n.t("payment"), id: 1 },
    { name: i18n.t("create_contract"), id: 2 },
    { name: i18n.t("e_invoice"), id: 3 },
  ];

  const handleGetDetailSale = async (idSale) => {
    try {
      const response = await saleService.getDetailSale(idSale);
      if (response.success) {
        setDataSale(response.data);
      }
    } catch (e) { console.log('beee', e) }
  };

  const handleGetLocationForOperator = async () => {
    try {
      const response = await operatorService.getDetailLocation(dataSale.location.id);
      if (response.success) {
        return response.data;
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const fetchData = async () => {
    try {
      const locations = await handleGetLocationForOperator();

      setLocation(locations);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const currencyCode = useMemo(() => {
    if (!location) {
      return "";
    } else {
      return location.currency_code
    }
  }, [location]);

  const handleTabCLick = (id) => {
    if (dataSale) {
      setCurrentTabActive(id);
    }
  }

  useEffect(() => {
    if (id) {
      handleGetDetailSale(id);
    }
  }, [id]);

  useEffect(() => {
    if (dataSale) {
      fetchData();
    }
  }, [dataSale])


  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {

    if (!dataSale || !tableContainerRef) return;

    const scrollContainer = tableContainerRef.current;
    if (!scrollContainer) return
    const table = scrollContainer.querySelector('table');
    if (!table) return
    const theads = table.querySelectorAll('thead');
    if (!theads) return
    const beforeTable = beforeTableRef.current;
    if (!beforeTable) return

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
  }, [dataSale]);

  return (
    <React.Fragment>
      <div className="page-content tabs-container">
        <div>
          <div className="page-container">
            <div className="tabs-header">
              {listSections.map((tab) => {
                return (
                  <div className={"tab-item text-center " + (currentTabActive === tab.id ? "active " : " ")
                    + (!dataSale && tab.id > 0 ? "tab-disabled" : "")}
                    onClick={() => { handleTabCLick(tab.id) }}
                  >
                    {tab.name}
                  </div>)
              })}
            </div>
            <TabContent activeTab={currentTabActive} className="">
              <TabPane tabId={0}>
                <div >
                  <SaleDetail
                    type={props.type}

                    onData={(e) => setDataSale(e)}
                    onNext={() => { setCurrentTabActive(1) }}
                  />

                </div>
              </TabPane>

              <TabPane tabId={1}>
                {dataSale && (
                  <>
                    <Payment
                      dataSale={dataSale}
                      handleReload={handleGetDetailSale}
                    />

                    <Row className="mt-4">
                      <Col>
                        <h5>{i18n.t("payment_history")}</h5>
                        <div className="d-flex justify-content-between align-items-center">
                          <p style={{ margin: 0 }}>
                            {i18n.t("status")} :{" "}
                            <span
                              style={{
                                color:
                                  dataSale?.payment_histories &&
                                    dataSale?.payment_histories?.length > 0 ?
                                    (dataSale?.payment_status === 1
                                      ? "#1ead07"
                                      : "#dc3545") : 'black',
                              }}
                            >
                              {dataSale?.payment_histories &&
                                dataSale?.payment_histories?.length > 0 ?
                                (dataSale?.payment_status === 1
                                  ? i18n.t("payment_all")
                                  : i18n.t("payment_part")) : i18n.t("not_paid")}
                            </span>
                          </p>

                          {true && (
                            <Button
                              color="secondary"
                              outline

                              onClick={() => {
                                handleGetDetailSale(id);
                                setIsRetry(false);
                              }}
                            >
                              {i18n.t("reload")}
                            </Button>
                          )}
                        </div>

                        <div className="before-table" ref={beforeTableRef}></div>
                        {dataSale?.payment_histories &&
                          dataSale?.payment_histories?.length > 0 && (
                            <div className="table-container" ref={tableContainerRef}>
                              < Table className="table mb-0">
                                <thead>
                                  <tr>
                                    <th>{i18n.t("no")}</th>
                                    <th>{i18n.t("date_time")}</th>
                                    <th>{i18n.t("number")}</th>
                                    <th>{i18n.t("status")}</th>
                                    <th>{i18n.t("action")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(dataSale?.payment_histories?.length
                                    ? dataSale.payment_histories
                                    : []
                                  ).map((item, idx) => (
                                    <tr key={idx}>
                                      <td>{idx + 1}</td>
                                      <td>
                                        {item.paid_at
                                          ? moment(item.paid_at).format(
                                            "HH:mm:ss DD/MM/YYYY "
                                          )
                                          : ""}
                                      </td>
                                      <td>
                                        {item.amount.toLocaleString("vi-VN", { maximumFractionDigits: 2 }) +
                                          " " +
                                          currencyCode || ""}
                                      </td>
                                      <td
                                        style={{
                                          color:
                                            item.status === 1
                                              ? "#1ead07"
                                              : item.status === 0
                                                ? "#1D39C4"
                                                : "#dc3545",
                                        }}
                                      >
                                        {item.status === 1
                                          ? i18n.t("successfully")
                                          : item.status === 0
                                            ? i18n.t("pending")
                                            : i18n.t("fail")}
                                      </td>
                                      <td className="text-start">
                                        {item.status === 0 && !isRetry ? (
                                          <div className="d-flex gap-1">
                                            <Button
                                              color="secondary"
                                              outline
                                              className="p-1"
                                              onClick={() => handleRetry(item)}
                                            >
                                              {i18n.t("try_again")}
                                            </Button>
                                            <Button
                                              color="danger"
                                              outline
                                              className="p-1"
                                              onClick={() =>
                                                handleRemovePaymentRequest(item)
                                              }
                                            >
                                              {i18n.t("delete")}
                                            </Button>
                                          </div>
                                        ) : (
                                          <></>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                      </Col>
                    </Row>
                  </>
                )}

              </TabPane>

              <TabPane tabId={2}>
                <EContract
                  dataSale={dataSale}
                />
              </TabPane>

              <TabPane tabId={3}>
                <EInvoice
                  isActive={currentTabActive === 3}
                  dataSale={dataSale}
                />
              </TabPane>


            </TabContent>
          </div>
        </div>
      </div>
    </React.Fragment >
  );
};

export default SaleScreen;
