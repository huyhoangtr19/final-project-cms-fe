import { useState, useEffect } from "react"
import withRouter from "../../components/Common/withRouter"
import i18n from "../../i18n";
import { TabContent, TabPane } from "reactstrap";
import BookingPTDetail from "./BookingPTDetail";
import BookingDetail from "./BookingDetail";

const CreateBooking = (props) => {
  document.title = "Create booking | Actiwell System";

  const [currentTabActive, setCurrentTabActive] = useState("0");

  const tabHeaderList = [
    { name: i18n.t("new_booking"), id: "0" },
    { name: i18n.t("new_private_booking"), id: "1" },
  ];

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
            }
            )}
          </div>

          <div className="page-container">
            <TabContent activeTab={currentTabActive}>
              <TabPane tabId="0">
                <BookingDetail type="create" />
              </TabPane>

              <TabPane tabId="1">
                <BookingPTDetail type="create" />
              </TabPane>

            </TabContent>

          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(CreateBooking)