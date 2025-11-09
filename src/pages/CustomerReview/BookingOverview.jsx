// Function Name : Booking Overview
// Created date :  22/8/24            by :  VinhLQ
// Updated date :                     by :  VinhLQ

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Col, Collapse, Input, Row, Table } from "reactstrap";
import withRouter from "../../components/Common/withRouter";
import MyDropdown from "../../components/Common/MyDropdown";
import operatorService from "../../services/operator.service";
import customerReviewService from "../../services/customer.review.service";
import styled from "styled-components";
import moment from "moment";
import MyPagination from "../../components/Common/Mypagination";
import staffService from "../../services/staff.service";
import i18n from "../../i18n";

const ReviewItem = styled.div`
  display: flex;
  margin-bottom: 36px;
  .text-black {
    color: #000;
  }
  .text-blue {
    color: #1d39c4;
  }
`;

const listSort = [
  {
    label: i18n.t("newest_created"),
    value: JSON.stringify({
      key_sort: "created_at",
      order: "desc",
    }),
  },
  {
    label: i18n.t("oldest_created"),
    value: JSON.stringify({
      key_sort: "created_at",
      order: "asc",
    }),
  },
  {
    label: i18n.t("highest_score"),
    value: JSON.stringify({
      key_sort: "score",
      order: "desc",
    }),
  },
  {
    label: i18n.t("lowest_score"),
    value: JSON.stringify({
      key_sort: "score",
      order: "asc",
    }),
  },
];

const BookingOverview = (props) => {
  const [data, setData] = useState([]);
  const [masterData, setMasterData] = useState({
    locations: [],
    staffs: [],
  });
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [params, setParams] = useState({
    location: "",
    staff: "",
    start_date: "",
    end_date: "",
    limit: 20,
    page: page,
    key_sort: "created_at",
    order: "desc",
  });

  const handleResetFilter = () => {
    setParams({
      location: "",
      staff: "",
      start_date: "",
      end_date: "",
    });
  };

  const getLocationForUser = async () => {
    try {
      const response = await operatorService.getLocationsForUser();
      if (response.success) {
        const data = response.data.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        setMasterData((prev) => ({
          ...prev,
          locations: data,
        }));
      }
    } catch (e) { }
  };

  const handleSelectLocation = async (e) => {
    setParams((prev) => ({
      ...prev,
      staff: "",
      location: e,
    }));
    setMasterData((prev) => ({
      ...prev,
      staffs: [],
    }));
    await getStaffForLocation(e);
  };

  const getStaffForLocation = async (location) => {
    try {
      const response = await staffService.getListTrainerForOperator({
        location,
        trainer: 1,
      });
      if (response.success) {
        const data = response.data.map((item) => {
          return {
            value: item.id,
            label: `${item.last_name} ${item.first_name}`,
          };
        });
        setMasterData((prev) => ({
          ...prev,
          staffs: data,
        }));
      }
    } catch (e) { }
  };

  const handleSelectSortBy = (e) => {
    if (!e) return;
    const value = JSON.parse(e);
    setParams((prevParams) => ({
      ...prevParams,
      key_sort: value.key_sort,
      order: value.order,
    }));
  };

  const fetchData = async () => {
    try {
      const res = await customerReviewService.getListBookingReview(params);
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

  useEffect(() => {
    getLocationForUser();
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <div className="filter-container">
        <div className="filter-header">
          <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
            <button
              className="filter-clear"
            >
              {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
            </button>
            <h5 className="filter-title">{i18n.t("reviews")}</h5>
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
            <label className="filter-label">{i18n.t("location")}</label>
            <MyDropdown
              options={masterData.locations}
              selected={params.location}
              displayEmpty={true}
              setSelected={handleSelectLocation}
              placeholder={i18n.t("location")}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{i18n.t("trainer")}</label>
            <MyDropdown
              options={masterData.staffs}
              selected={params.staff}
              displayEmpty={true}
              disabled={!params.location}
              setSelected={(e) =>
                setParams((prevParams) => ({
                  ...prevParams,
                  staff: e,
                }))
              }
              placeholder={i18n.t("trainer")}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{i18n.t("start_date")}</label>
            <Input
              className="filter-select"
              type="date"
              placeholder={i18n.t("start_date")}
              value={params.start_date}
              onChange={(e) => {
                setParams((prevParams) => ({
                  ...prevParams,
                  start_date: e.target.value,
                }));
              }}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{i18n.t("end_date")}</label>
            <Input
              className="filter-select"
              type="date"
              placeholder={i18n.t("end_date")}
              value={params.end_date}
              onChange={(e) => {
                setParams((prevParams) => ({
                  ...prevParams,
                  end_date: e.target.value,
                }));
              }}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{i18n.t("sort_by")}</label>
            <MyDropdown
              options={listSort}
              selected={JSON.stringify({
                key_sort: params.key_sort,
                order: params.order,
              })}
              displayEmpty={false}
              setSelected={handleSelectSortBy}
              placeholder={"Sort"}
            />
          </div>
        </Collapse>
      </div>
      {data.length > 0 ? (
        data.map((item) => {
          return (
            <ReviewItem key={item.id}>
              <Row>
                <Col md={1} xs={12}>
                  <div className="font-size-24 fw-bold text-blue text-center">
                    {item.average_score}
                  </div>
                </Col>
                <Col md={11} xs={12}>
                  <div className="d-flex justify-content-between">
                    <h6 className="fw-bold text-black">{`${item.customer.last_name} ${item.customer.first_name}`}</h6>
                    <span>
                      {moment(item.location_rating.created_at).format(
                        "DD-MM-yyyy"
                      )}
                    </span>
                  </div>
                  <div className="mt-2 mb-3 text-black">
                    {i18n.t("booking_id")}:
                    <span className="fw-bold text-blue"> {item.id}</span> -{" "}
                    {item.class.name} - {i18n.t("trainer")}:{" "}
                    {`${item.trainer.last_name} ${item.trainer.first_name}`} -{" "}
                    {item.location.name}
                  </div>
                  <div className="mb-3">
                    <h6 className="fw-bold text-blue">
                      {i18n.t("location_rating")}: {item.location_rating.score}
                    </h6>
                    <div>
                      <h6 className="fw-bold mb-1">
                        {i18n.t("location_feedback")}:
                      </h6>
                      <div>{item.location_rating.review_content}</div>
                    </div>
                  </div>
                  <div>
                    <h6 className="fw-bold text-blue">
                      {i18n.t("trainer_rating")}: {item.trainer_rating.score}
                    </h6>
                    <div>
                      <h6 className="fw-bold mb-1">
                        {i18n.t("trainer_feedback")}:
                      </h6>
                      <div>{item.trainer_rating.review_content}</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </ReviewItem>
          );
        })

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
BookingOverview.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(BookingOverview);
