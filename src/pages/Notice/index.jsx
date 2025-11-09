import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";

import { Col, TabContent, TabPane } from "reactstrap";

import Breadcrumb from "../../components/Common/Breadcrumb";
import withRouter from "../../components/Common/withRouter";

import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import UnreadNotice from "./UnreadNotice";
import ReadedNotice from "./ReadedNotice";

const listSection = [
  { name: "unread_notice", id: "1" },
  { name: "readed_notice", id: "2" },
];
const Notice = (props) => {
  document.title = "Notice | Actiwell System";
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [currentTabActive, setCurrentTabActive] = useState("1");
  const [refreshListReaded, setRefreshListReaded] = useState(0);
  const handleClick = (section) => {
    setCurrentTabActive(section.id);
  };

  const canSeeProduct = useMemo(() => {
    return permissionUser.includes("product:view_list");
  }, [permissionUser]);
  const canSeeCategory = useMemo(() => {
    return permissionUser.includes("product_category:view_list");
  }, [permissionUser]);

  const handleReadNotice = () => {
    setRefreshListReaded((prev) => prev + 1);
  };

  return (
    <React.Fragment>
      <div className="page-content ">
        <div className="tabs-container">
          <Breadcrumb title={i18n.t("retail_product")} />
          <div className="tabs-header">
            {listSection.map((section) => (
              <Col
                md={2}
                key={section.id}
                onClick={() => handleClick(section)}
                className={
                  "text-center tab-item " +
                  (currentTabActive === section.id ? "active" : "")
                }
              >
                {i18n.t(section.name)}
              </Col>
            ))}
          </div>
          <div className="page-container">
            <TabContent activeTab={currentTabActive}>
              <TabPane tabId="1">
                <UnreadNotice
                  isActive={currentTabActive === "1"}
                  readNotice={handleReadNotice}
                />
              </TabPane>

              <TabPane tabId="2">
                <ReadedNotice isActive={currentTabActive === "2"} refreshListReaded={refreshListReaded} />
              </TabPane>
            </TabContent>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
Notice.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(Notice);
