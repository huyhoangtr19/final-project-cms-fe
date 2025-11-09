// Function Name : Login Page
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
  TabContent,
  TabPane,
} from "reactstrap";
import Cookies from "js-cookie";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

import withRouter from "../../components/Common/withRouter";

//Import Breadcrumb
import Breadcrumb from "../../components/Common/Breadcrumb";
import ProfileDetail from "../../pages/Authentication/ProfileDetail.jsx";
import ChangePasswordCustom from "../../pages/Authentication/ChangePasswordCustom.jsx";
import i18n from "../../i18n.jsx";

// actions

const UserProfile = (props) => {
  //meta title
  document.title = "Profile | Actiwell System";
  const listSection = [
    { name: i18n.t("user_info"), id: "1" },
    { name: i18n.t("change_password"), id: "2" },
  ];
  const dispatch = useDispatch();
  const [currentTabActive, setCurrentTabActive] = useState("1");
  const handleClick = (section) => {
    setCurrentTabActive(section.id);
  };

  return (
    <React.Fragment>
      <div className="page-content tabs-container">
        <Breadcrumb title={i18n.t("account_information")} />
        <div className="tabs-header">
          {listSection.map((section) => (
            <div
              key={section.id}
              onClick={() => handleClick(section)}
              className={"text-center tab-item " + (currentTabActive === section.id ? "active" : "")}
            >
              {section.name}
            </div>
          ))}
        </div>

        <Card className="page-container">
          <CardBody>
            <TabContent activeTab={currentTabActive}>
              <TabPane tabId="1">
                <ProfileDetail />
              </TabPane>
              <TabPane tabId="2">
                <ChangePasswordCustom />
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </div>
    </React.Fragment>
  );
};

export default withRouter(UserProfile);
