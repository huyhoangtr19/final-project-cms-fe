// Function Name : Retail Product
// Created date :  7/8/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";

import { Col, TabContent, TabPane } from "reactstrap";

import Breadcrumb from "../../components/Common/Breadcrumb";
import withRouter from "../../components/Common/withRouter";

import ProductCategory from "./ProductCategory";
import Product from "./Product";
import OptionList from "./OptionList";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";

const listSection = [
  { name: "product_category", id: "1" },
  { name: "product", id: "2" },
  { name: "option", id: "3" },
];
const RetailProduct = (props) => {
  document.title = "Retail Product | Actiwell System";
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [currentTabActive, setCurrentTabActive] = useState("1");
  const handleClick = (section) => {
    setCurrentTabActive(section.id);
  };

  const canSeeProduct = useMemo(() => {
    return permissionUser.includes("product:view_list");
  }, [permissionUser]);
  const canSeeCategory = useMemo(() => {
    return permissionUser.includes("product_category:view_list");
  }, [permissionUser]);

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
                className={"text-center tab-item " + (currentTabActive === section.id ? "active" : "")}
              >
                {i18n.t(section.name)}
              </Col>
            ))}
          </div>
          <div className="page-container">
            <TabContent activeTab={currentTabActive}>
              {canSeeCategory && (
                <TabPane tabId="1">
                  <ProductCategory isActive={currentTabActive === "1"} />
                </TabPane>
              )}
              {canSeeProduct && (
                <TabPane tabId="2">
                  <Product isActive={currentTabActive === "2"} />
                </TabPane>
              )}

              <TabPane tabId="3">
                <OptionList isActive={currentTabActive === "3"} />
              </TabPane>
            </TabContent>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
RetailProduct.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(RetailProduct);
