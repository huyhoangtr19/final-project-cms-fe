// Function Name : Customer Detail
// Created date :  30/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";

import { Col, TabContent, TabPane } from "reactstrap";

import Breadcrumb from "../../components/Common/Breadcrumb";
import withRouter from "../../components/Common/withRouter";
import StaffAvailability from "./StaffAvailability";
import StaffProfile from "./StaffProfile";
import staffService from "../../services/staff.service";
import moment from "moment/moment";
import i18n from "../../i18n";
import StaffPerformance from "./StaffPerformance";
import StaffActivities from "./StaffActivities";

const listSection = [
  { name: "staff_performance", id: "3" },
  { name: "staff_availability", id: "2" },
  { name: "staff_profile", id: "1" },
  { name: "staff_activities", id: "4" },
];
const StaffDetail = (props) => {
  const { id } = useParams();
  document.title = "Staff | Fitness CMS";
  const [currentTabActive, setCurrentTabActive] = useState(
    props.type === "create" ? "1" : "3"
  );
  const [idAdd, setIdAdd] = useState(null);
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState(null);
  const handleClick = (section) => {
    setCurrentTabActive(section.id);
  };
  const handleGetDetailProfile = async (idCus) => {
    try {
      const response = await staffService.getDetailStaffProfile(idCus);
      if (response.success) {
        const resData = {
          ...response.data,
          avatar: null,
        };
        setProfile(resData);
      }
    } catch (e) {
      console.log("er detail ", e);
    }
  };
  const handleGetDetailAvailability = async (idCus) => {
    try {
      const response = await staffService.getDetailStaffAvailability(idCus);
      if (response.success) {
        const resData = {
          ...response.data,
          specific_time_available: response.data.specific_time_available.map(
            (item) => {
              return {
                ...item,
                date: moment(item.date).format("yyyy-MM-DD"),
              };
            }
          ),
        };
        setAvailability(resData);
      }
    } catch (e) {
      console.log("er detail ", e);
    }
  };
  useEffect(() => {
    if (id) {
      handleGetDetailProfile(id);
      handleGetDetailAvailability(id);
    }
  }, [id]);

  return (
    <React.Fragment>
      <div className="page-content ">
        <div className="tabs-container">
          <Breadcrumb
            title={i18n.t("contact_list")}
            breadcrumbItem={
              props.type !== "create"
                ? i18n.t("staff_detail")
                : i18n.t("add_new_staff")
            }
          />
          <div className="tabs-header">
            {listSection.map((section) => {
              return (props.type === "create" && section.id !== "3") || (props.type !== "create") ? (
                <Col
                  md={2}
                  key={section.id}
                  onClick={() => handleClick(section)}
                  className={"text-center tab-item " + (currentTabActive === section.id ? "active" : "")}
                >
                  {i18n.t(section.name)}
                </Col>
              ) : (
                <></>
              )
            })}
          </div>
          <div className="page-container">
            <TabContent activeTab={currentTabActive}>
              <TabPane tabId="1">
                <StaffProfile
                  type={props.type}
                  activeTab={currentTabActive === "1"}
                  onChangeTab={(idNew) => {
                    setCurrentTabActive("2");
                    setIdAdd(idNew);
                  }}
                  isAddProfile={(idNew) => {
                    setIdAdd(idNew);
                  }}
                  profile={profile}
                />
              </TabPane>
              <TabPane tabId="2">
                <StaffAvailability
                  activeTab={currentTabActive === "2"}
                  id={Number(id || idAdd)}
                  profile={availability}
                />
              </TabPane>
              {props.type !== "create" && (
                <>
                  <TabPane tabId="3">
                    <StaffPerformance
                      activeTab={currentTabActive === "3"}
                      staff={profile}
                    />
                  </TabPane>
                  <TabPane tabId="4">
                    <StaffActivities 
                      activeTab={currentTabActive === "4"}
                      staff={profile}
                    />
                  </TabPane>
                </>
              )}
            </TabContent>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
StaffDetail.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(StaffDetail);
