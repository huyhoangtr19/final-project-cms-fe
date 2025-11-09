// Function Name : Product Category List
// Created date :  12/8/24             by :  NgVinh
// Updated date :                      by :  NgVinh
import React, { useEffect, useRef, useState } from "react";
import { Collapse, Table } from "reactstrap";
import InputSearch from "../../components/Common/InputSearch";
import MyPagination from "../../components/Common/Mypagination";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import { debounce } from "lodash";
import notificationService from "../../services/notification.service";
import { convertHtmlToTextContent } from "../../utils/app";
import moment from "moment";
import ModalNotice from "./ModalNotice";

const ReadedNotice = (props) => {
  const [searchName, setSearchName] = React.useState("");
  const [products, setProducts] = React.useState([]);
  const [totalRecord, setTotalRecord] = React.useState(0);
  const [totalPage, setTotalPage] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [isShow, setIsShow] = React.useState(false);
  const [noticeInfo, setNoticeInfo] = React.useState(null);

  const handleResetFilter = () => {
    setSearchName("");
  };

  const handleRedirect = (item) => {
    setIsShow(true);
    setNoticeInfo(item);
  };

  const handleCloseModal = () => {
    setIsShow(false);
    setNoticeInfo(null);
  };

  const handleGetProductList = async () => {
    try {
      const payload = {
        limit: 20,
        page: page,
        seen:1
      };
      const res = await notificationService.getListUnreadNotice(payload);
      setProducts(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetProductList();
  }, [page]);
  useEffect(()=>{
    setPage(1);
    setTimeout(()=>{
      handleGetProductList()
    },100)
  },[props.refreshListReaded])

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {
    if (!props.isActive || products.length === 0) return;

    const scrollContainer = tableContainerRef.current;
    const table = scrollContainer.querySelector("table");
    const theads = table.querySelectorAll("thead");
    const beforeTable = beforeTableRef.current;

    if (!scrollContainer || !table) return;

    const updateOverflow = () => {
      const isOverflowing = table.scrollWidth > scrollContainer.clientWidth;
      scrollContainer.style.overflowX = isOverflowing ? "auto" : "unset";
      if (beforeTable) {
        beforeTable.style.position = isOverflowing ? "relative" : "sticky";
      }
      if (isOverflowing) {
        theads.forEach((el) => {
          el.style.top = 0;
        });
      } else {
        theads.forEach((el) => {
          el.style.top = "0.9375rem";
        });
      }
    };

    const debouncedUpdate = debounce(updateOverflow, 100); // 100ms debounce
    window.addEventListener("resize", updateOverflow);
    window.addEventListener("sidebar-toggled", debouncedUpdate);
    debouncedUpdate();

    return () => {
      window.removeEventListener("resize", updateOverflow);
      window.removeEventListener("sidebar-toggled", debouncedUpdate);
      debouncedUpdate.cancel();
    };
  }, [props.isActive, products]);

  return (
    <div className="d-flex flex-column flex-1">
      <div className="filter-container">
        <div className="filter-header">
          <div
            className="filter-title-group"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <button className="filter-clear">
              {filterOpen ? (
                <i className="fa fa-chevron-right" />
              ) : (
                <i className="fa fa-chevron-down" />
              )}
            </button>
            <h5 className="filter-title">{i18n.t("readed_notice")}</h5>
          </div>
          <button className="filter-reset" onClick={handleResetFilter}>
            {i18n.t("reset")}
          </button>
        </div>
        <Collapse isOpen={filterOpen} className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">{`ID, ${i18n.t("name")}`}</label>
            <InputSearch
              value={searchName}
              onChange={(e) => setSearchName(e)}
              placeholder={`ID,${i18n.t("name")}`}
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
                  <th>{i18n.t("create_date")}</th>
                  <th>{i18n.t("class_name")}</th>
                  <th>{i18n.t("location_name")}</th>
                  <th>{i18n.t("title")}</th>
                  <th>{i18n.t("content")}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => (
                  <tr key={index} onClick={() => handleRedirect(item)}>
                    <td>
                      {moment(item.created_at).format("DD/MM/yyyy HH:mm:ss")}
                    </td>
                    <td>{item.data.class_name}</td>
                    <td>{item.data.location_name}</td>
                    <td style={{ maxWidth: "20rem" }}>{item?.title}</td>
                    <td style={{ maxWidth: "20rem" }}>
                      {convertHtmlToTextContent(item?.body)}
                    </td>
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
          <div>{i18n.t("no_notification_exist")}</div>
        </div>
      )}
      <ModalNotice
        isOpen={isShow}
        onClose={handleCloseModal}
        isUnread={false}
        noticeInfo={noticeInfo}
      />
    </div>
  );
};
export default ReadedNotice;
