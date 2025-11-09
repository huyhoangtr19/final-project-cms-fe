import { useState } from "react";
import i18n from "../../i18n";
import PropTypes from "prop-types";
import StaffList from "./StaffList";
import withRouter from "../../components/Common/withRouter";
import { TabContent, TabPane } from "reactstrap";
import StaffSchedule from "./StaffSchedule";

const tabHeaderList = [
  { name: i18n.t('staff_list'), id: "1" },
  { name: i18n.t('staff_schedule'), id: "2" },
  {}
]

const Staff = (props) => {
  document.title = "Staff | Actiwell System";
  const [currentTabActive, setCurrentTabActive] = useState("1");

  const handleClick = (section) => {
    setCurrentTabActive(section.id);
  };

  return (
    <div className="">
      <div className="page-content">
        <div className="tabs-container">
          <div className="tabs-header">
            {tabHeaderList.map((section) => {
              return (
                <div
                  key={section.id}
                  onClick={() => handleClick(section)}
                  className={"text-center tab-item " + (currentTabActive === section.id ? "active" : "")}
                >
                  {section.name}
                </div>
              )
            })}
          </div>

          <div className="page-container">
            <TabContent activeTab={currentTabActive}>
              <TabPane tabId="1">
                <StaffList
                  type={props.type}
                  history={props.history}
                />
              </TabPane>

              <TabPane tabId="2">
                <StaffSchedule />
              </TabPane>

            </TabContent>

          </div>

        </div>
      </div>
    </div>
  );
}
Staff.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};

export default withRouter(Staff);
