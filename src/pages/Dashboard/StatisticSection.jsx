import { useEffect, useMemo, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { MONTH_CHART } from "../../constants/app.const";
import MyDropdown from "../../components/Common/MyDropdown";
import i18n from "../../i18n";
import dashboardService from "../../services/dashboard.service";
import { formatNumberAsCurrency } from "../../utils/app";

const SectionDiv = styled.div`
  display: flex;
  border-radius: 5px;
  border: 1px solid #f5f5f5;
  padding: 10px 20px;
  box-shadow: 2px 2px 5px #d9d9d9;
  // background-color:;
  margin-bottom: 8px;
`;
const SectionName = styled.div`
  font-size: 25px;
  color: #35a0ff;
`;

const memberTypeList = [
  {
    value: "total",
    label: i18n.t('total'),
  },
  {
    value: "active",
    label: i18n.t('active_member'),
  },
  {
    value: "inactive",
    label: i18n.t('inactive'),
  },
];


const StatisticSection = ({ locationList }) => {
  const [yearChart, setYearChart] = useState(new Date().getUTCFullYear());
  const [monthChart, setMonthChart] = useState("");
  const [location, setLocation] = useState("");
  const [monthCheck, setMonthCheck] = useState(false);
  const [memberType, setMemberType] = useState("total");


  const [data, setData] = useState({
    revenue: {
      current: 0,
      previous: 0,
    },
    member: {
      current: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      previous: {
        total: 0,
        active: 0,
        inactive: 0,
      },
    },
    package: {
      current: 0,
      previous: 0,
    },
    product: {
      current: 0,
      previous: 0,
    },
  });

  const listYear = () => {
    return Array.from(
      { length: 6 },
      (_, index) => new Date().getUTCFullYear() - 5 + index
    ).map((item) => {
      return { value: item, label: item };
    });
  };

  const getMonthsToCurrent = useMemo(() => {
    if (yearChart === new Date().getUTCFullYear()) {
      const currentMonth = new Date().getMonth(); // 0-indexed (January is 0)
      const months = [];
      for (let i = 0; i <= currentMonth; i++) {
        months.push(i + 1); // Add 1 to make it 1-indexed
      }
      return MONTH_CHART.slice(0, months.length);
    } else {
      return MONTH_CHART;
    }
  }, [yearChart]);

  const getValueWithPrevious = (current, previous) => {
    if (!current) {
      return `+ 0% ${monthChart ? i18n.t('from_previous_month') : i18n.t('from_previous_year')}`;
    } else if (!previous) {
      return " ";
    } else {
      const percentageChange = ((current - previous) / previous) * 100;
      // Format percentage change
      return percentageChange <= 0
        ? `+ 0% ${monthChart ? i18n.t('from_previous_month') : i18n.t('from_previous_year')}`
        : percentageChange.toFixed(0) +
        "%" +
        ` ${monthChart ? i18n.t('from_previous_month') : i18n.t('from_previous_year')}`;
    }
  };

  const getListStatisticData = async () => {
    let payload = {
      year: yearChart,
      location_id: location,
    };

    if (monthCheck && monthChart) {
      payload = {
        ...payload,
        month: monthChart,
      };
    }

    const res = await dashboardService.getListDataStatistic(payload);
    if (res.success) {
      setData(res.data);
    }
  };

  useEffect(() => {
    if (monthCheck) {
      // setYearChart(new Date().getFullYear());
    } else {
      setMonthChart("");
    }
  }, [monthCheck]);

  useEffect(() => {
    getListStatisticData();
  }, [yearChart, monthChart, location]);

  return (
    <div>
      <div className="action-buttons">
        <SectionName>{i18n.t('statistics')}</SectionName>
        <div className="action-buttons">
          <div className="d-flex gap-2 align-items-center form-check form-radio-outline form-radio-primary">
            <input
              type="radio"
              id="customRadiooutlinecolor1"
              name="customRadiooutlinecolor1"
              className="form-check-input"
              checked={true}
              readOnly
            />

            {/* <label
              className="form-check-label"
              htmlFor="customRadiooutlinecolor1"
            >
              Radio Outline Primary
            </label> */}
            <MyDropdown
              options={listYear()}
              selected={yearChart}
              displayEmpty={false}
              setSelected={(e) => setYearChart(e)}
              placeholder={i18n.t("location")}
              disabled={!yearChart}
            />
          </div>
          <div>
            <div className="d-flex gap-2 align-items-center form-check form-radio-outline form-radio-primary">
              <div
                onClick={() => {
                  setMonthCheck((prev) => !prev);
                }}
              >
                <input
                  type="radio"
                  id="customRadiooutlinecolor2"
                  name="customRadiooutlinecolor2"
                  className="form-check-input"
                  checked={monthCheck}
                  readOnly
                />
              </div>
              <MyDropdown
                options={getMonthsToCurrent}
                selected={monthChart}
                displayEmpty={true}
                setSelected={(e) => setMonthChart(e)}
                placeholder={i18n.t("months")}
                disabled={!monthCheck}
              />
            </div>
          </div>
          <MyDropdown
            options={locationList}
            selected={location}
            displayEmpty={true}
            setSelected={(e) => setLocation(e)}
            placeholder={i18n.t("all")}
          />
        </div>
      </div>
      <Row>
        <Col md={5}>
          <SectionDiv>
            <div className="d-flex flex-column">
              <div style={{ fontSize: 18, color: "#000000" }}>{i18n.t('revenue')}</div>
              <div style={{ fontSize: 25, color: "#000000" }}>
                $ {formatNumberAsCurrency(data.revenue.current)}
              </div>
              <div style={{ fontSize: 11, color: "#4CAAFF", minHeight: 16.5 }}>
                {getValueWithPrevious(
                  data.revenue.current,
                  data.revenue.previous
                )}
              </div>
            </div>
          </SectionDiv>
        </Col>
        <Col md={2}></Col>
        <Col md={5}>
          <SectionDiv>
            <div className="d-flex flex-column w-100">
              <div className="d-flex justify-content-between w-100">
                <div style={{ fontSize: 18, color: "#000000" }}>
                  {memberTypeList.find((item) => item.value === memberType)?.label}{' '}
                  {i18n.t('member')}
                </div>
                <div className="d-flex gap-1">
                  {memberTypeList.map((item) => (
                    <div
                      key={item.value}
                      style={{
                        padding: "4px 6px",
                        color: memberType === item.value ? "#fff" : "#000",
                        backgroundColor:
                          memberType === item.value ? "#63B5FF" : "#D9D9D9",
                      }}
                      onClick={() => {
                        if (memberType !== item.value) {
                          setMemberType(item.value);
                        }
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 25, color: "#000000" }}>
                {data.member.current[memberType]}
              </div>
              <div style={{ fontSize: 11, color: "#4CAAFF", minHeight: 16.5 }}>
                {getValueWithPrevious(
                  data.member.current[memberType],
                  data.member.previous[memberType]
                )}
              </div>
            </div>
          </SectionDiv>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={5}>
          <SectionDiv>
            <div className="d-flex flex-column">
              <div style={{ fontSize: 18, color: "#000000" }}>{i18n.t('package')}</div>
              <div style={{ fontSize: 25, color: "#000000" }}>
                {data.package.current}
              </div>
              <div style={{ fontSize: 11, color: "#4CAAFF", minHeight: 16.5 }}>
                {getValueWithPrevious(
                  data.package.current,
                  data.package.previous
                )}
              </div>
            </div>
          </SectionDiv>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticSection;
