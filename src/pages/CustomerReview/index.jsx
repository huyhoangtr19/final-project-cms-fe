// Function Name : Booking today
// Created date :  22/8/24            by :  VinhLQ
// Updated date :                     by :  VinhLQ

import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";

import withRouter from "../../components/Common/withRouter";
import Breadcrumb from "../../components/Common/Breadcrumb";
import LocationOverview from "./LocationOverview";
import TrainerOverview from "./TrainerOverview";
import BookingOverview from "./BookingOverview";
import i18n from "../../i18n";
import { TabContent, TabPane } from "reactstrap";

const CustomerReview = () => {
  document.title = "Booking Today | Actiwell System";
  const [currentTabActive, setCurrentTabActive] = useState("1");
  const listSection = [
    { name: i18n.t("location_overview"), id: "1" },
    { name: i18n.t("trainer_overview"), id: "2" },
    { name: i18n.t("reviews"), id: "3" },
  ];
  const handleClick = (section) => {
    setCurrentTabActive(section.id);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="tabs-container">
          <Breadcrumb title={i18n.t('customer_review')} />
          <div className="tabs-header">
            {listSection.map((section) => (
              <div
                key={section.type}
                onClick={() => handleClick(section)}
                className={"text-center tab-item " + (currentTabActive === section.id ? "active" : "")}
              >
                {section.name}
              </div>
            ))}
          </div>
          <div className="page-container">
            <TabContent activeTab={currentTabActive}>
              <TabPane tabId="1">
                <LocationOverview isActive={currentTabActive === "1"} />
              </TabPane>
              <TabPane tabId="2">
                <TrainerOverview isActive={currentTabActive === "2"} />
              </TabPane>
              <TabPane tabId="3">
                <BookingOverview isActive={currentTabActive === "3"} />
              </TabPane>
            </TabContent>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
CustomerReview.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(CustomerReview);
