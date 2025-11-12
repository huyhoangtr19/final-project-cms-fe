// Function Name : Class Detail
// Created date :  2/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh

import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";

import { Col, Container, Row, TabContent, TabPane } from "reactstrap";
import withRouter from "../../../components/Common/withRouter";
import Breadcrumb from "../../../components/Common/Breadcrumb";
import FormClassDetail from "./FormClassDetail";
import ListScheduleClass from "./ListScheduleClass";
import i18n from "../../../i18n";
import { useAppSelector } from "../../../hook/store.hook";

const ClassDetail = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [newClass, setNewClass] = useState(null);
  const [nameClass, setNameClass] = useState("");
  const [serviceId, setServiceId] = useState(null);
  document.title = "Class | Fitness CMS";
  const listSection = [
    { name: i18n.t("general_info"), id: "1" },
    { name: i18n.t("schedule_list"), id: "2" },
  ];
  const [currentTabActive, setCurrentTabActive] = useState("1");
  const handleClick = (section) => {
    setCurrentTabActive(section.id);
    0;
  };

  const handleNewClass = (data) => {
    setNewClass(data);
    navigate(`/class-info/detail/${data}`);
  };
  const canSeeClass = useMemo(() => {
    return permissionUser.includes("class:view_list_schedule");
  }, [permissionUser]);
  const titleBread = useMemo(() => {
    id ? "Class Detail" : "Add new class";
  }, [id]);

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="tabs-container">
          <Breadcrumb
            title={i18n.t("class_list")}
            breadcrumbItem={titleBread}
          />
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
                <FormClassDetail
                  type={props.type}
                  id={id || newClass}
                  onAddNew={handleNewClass}
                  onClassName={(name, serviceId) => {
                    setNameClass(name);
                    setServiceId(serviceId);
                  }}
                />
              </TabPane>
              {canSeeClass && (
                <TabPane tabId="2">
                  <ListScheduleClass
                    id={id || newClass}
                    name={nameClass}
                    serviceId={serviceId}
                    isActive={currentTabActive === "2"}
                  />
                </TabPane>
              )}
            </TabContent>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
ClassDetail.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(ClassDetail);
