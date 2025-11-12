// Function Name : Customer Tab
// Created date :  30/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Col, Container, Row, TabContent, TabPane } from "reactstrap";

import CustomerDetail from "./CustomerDetail";
import withRouter from "../../components/Common/withRouter";
import Breadcrumb from "../../components/Common/Breadcrumb";
import PurchaseHistory from "./PurchaseHistory";
import BookingHistory from "./BookingHistory";
import i18n from "../../i18n";

const listSection = [
  { name: "general_information", id: "1" },
  { name: "purchase_history", id: "2" },
  { name: "booking_history", id: "3" },
];
const CustomerTab = (props) => {
  document.title = "Customer Detail | Fitness CMS";
  const [currentTabActive, setCurrentTabActive] = useState("1");
  const handleClick = (section) => {
    setCurrentTabActive(section.id);
  };

  return (
    <React.Fragment>
      <div className="page-content ">
        <div className="tabs-container">
          <Breadcrumb
            title={i18n.t("customer")}
            breadcrumbItem={i18n.t("contact_detail")}
          />
          <div className="tabs-header">
            {listSection.map((section) => (
              <Col
                md={2}
                key={section.id}
                onClick={() => handleClick(section)}
                className={"text-center tab-item " + (currentTabActive === section.id ? "active" : "")}
              >
                {i18n.t(section.name)}
              </Col>
            ))}
          </div>
          <div className="page-container">
            <TabContent activeTab={currentTabActive}>
              <TabPane tabId="1">
                <CustomerDetail type={props.type} isActive={currentTabActive === "1"} />
              </TabPane>
              <TabPane tabId="2">
                <PurchaseHistory isActive={currentTabActive === "2"} />
              </TabPane>
              <TabPane tabId="3">
                <BookingHistory isActive={currentTabActive === "3"} />
              </TabPane>
            </TabContent>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
CustomerTab.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(CustomerTab);
