// Function Name : Class Info
// Created date :  2/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Col, TabContent, TabPane } from "reactstrap";
import withRouter from "../../../components/Common/withRouter";
import Breadcrumb from "../../../components/Common/Breadcrumb";
import ListClass from "./ListClass";
import ListScheduleInfo from "./ListScheduleInfo";
import i18n from "../../../i18n";

const ClassInfo = (props) => {
  document.title = "Class | Actiwell System";
  const [currentTabActive, setCurrentTabActive] = useState("1");
  const listSection = [
    { name: i18n.t("class_schedule"), id: "1" },
    { name: i18n.t("class_list"), id: "2" },
  ];
  const handleClick = (section) => {
    setCurrentTabActive(section.id);
  };
  useEffect(() => {
    if (props.router.location.state === "schedule") {
      setCurrentTabActive("1");
    } else if (props.router.location.state === "class") {
      setCurrentTabActive("2");
    }
  }, [props.type]);

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="tabs-container">
          <Breadcrumb title={i18n.t("class")} />
          <div className="tabs-header">
            {listSection.map((section) => (
              <Col
                md={2}
                key={section.id}
                onClick={() => handleClick(section)}
                className={"text-center tab-item " + (currentTabActive === section.id ? "active" : "")}
              >
                {section.name}
              </Col>
            ))}
          </div>
          <div className="page-container">
            <TabContent activeTab={currentTabActive}>
              <TabPane tabId="1">
                <ListScheduleInfo />
              </TabPane>
              <TabPane tabId="2">
                <ListClass isActive={currentTabActive === "2"} />
              </TabPane>
            </TabContent>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
ClassInfo.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(ClassInfo);
