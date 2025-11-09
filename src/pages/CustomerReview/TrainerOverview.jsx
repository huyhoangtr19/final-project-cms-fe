// Function Name : Trainer Overview
// Created date :  22/8/24            by :  VinhLQ
// Updated date :                     by :  VinhLQ

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { Table } from "reactstrap";
import withRouter from "../../components/Common/withRouter";
import customerReviewService from "../../services/customer.review.service";
import MyPagination from "../../components/Common/Mypagination";
import i18n from "../../i18n";
import { debounce } from "lodash";

const TrainerOverview = (props) => {
  const [data, setData] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [params, setParams] = useState({
    limit: 20,
    page: page,
  });

  const fetchData = async () => {
    try {
      const res = await customerReviewService.getListTrainerReview(params);
      setData(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

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
    <>
      {data.length > 0 ? (
        <>
          <div className="before-table" ref={beforeTableRef}></div>
          <div className="table-container table-CR" ref={tableContainerRef}>
            <Table className="table mb-0">
              <thead>
                <tr>
                  <th>{i18n.t("no")}</th>
                  <th>{i18n.t("staff_name")}</th>
                  <th>{i18n.t("total_reviews")}</th>
                  <th>{i18n.t("great_reviews")}</th>
                  <th>{i18n.t("good_reviews")}</th>
                  <th>{i18n.t("neutral_reviews")}</th>
                  <th>{i18n.t("unhappy_reviews")}</th>
                  <th>{i18n.t("bad_reviews")}</th>
                  <th>{i18n.t("average_points")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  return (
                    <tr key={item.id}>
                      <td>{index}</td>
                      <td>{`${item.last_name} ${item.first_name}`}</td>
                      <td>{item.total_reviews}</td>
                      <td>{item.great_review}</td>
                      <td>{item.good_review}</td>
                      <td>{item.neutral_review}</td>
                      <td>{item.unhappy_review}</td>
                      <td>{item.bad_review}</td>
                      <td>{`${item.average_score}/5.0`}</td>
                    </tr>
                  );
                })}
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
    </>
  );
};
TrainerOverview.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(TrainerOverview);
