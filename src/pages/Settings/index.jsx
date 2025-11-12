import { useState, useEffect, useMemo } from "react"
import withRouter from "../../components/Common/withRouter"
import { useLocation } from "react-router-dom";
import i18n from "../../i18n";
import { TabContent, TabPane } from "reactstrap";
import MarketSegment from "./MarketSegment/index";
import { useAppSelector } from "../../hook/store.hook";
import Location from "../BussinessInfo/Location";
import Users from "../Users";
import OperatorInfo from "../BussinessInfo/OperatorInfo";
import Department from "./Department/index";
import Policy from "../Policy";
import CustomerGroup from "../CustomerGroup";

const Settings = (props) => {
  document.title = "Settings | Fitness CMS";

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab");


  const hasOperator = useAppSelector((state) => state.operator.hasOperator);

  if (!hasOperator) {
    // No operator created yet
  }

  const { permissionUser } = useAppSelector((state) => state.auth);
  const canSeeUsers = useMemo(() => {
    return permissionUser.includes("user:view_list");
  }, [permissionUser]);
  const canSeeOperator = true;
  const canSeeLocations = useMemo(() => {
    return permissionUser.includes("location:view_list");
  }, [permissionUser]);
  const canSeeMarketSegments = useMemo(() => {
    return permissionUser.includes("market_segment:view_list");
  }, [permissionUser]);
  const canSeeDepartment = useMemo(() => {
    return permissionUser.includes("department:view_list");
  }, [permissionUser]);
  const canSeePolicies = useMemo(() => {
    return permissionUser.includes("policy:view_list");
  }, [permissionUser]);
  const canSeeCustomerGroups = useMemo(() => {
    return permissionUser.includes("customer_group:view_list");
  }, [permissionUser]);

  const [currentTabActive, setCurrentTabActive] = useState(canSeeUsers ? (tabParam || "0") : (tabParam || "1"));

  useEffect(() => {
    if (tabParam && tabParam !== currentTabActive) {
      setCurrentTabActive(tabParam);
    }
  }, [tabParam]);

  const tabHeaderList = [
    { name: i18n.t("user"), id: "0", perms: canSeeUsers },
    { name: i18n.t("location"), id: "1", perms: canSeeLocations },
    { name: i18n.t("market_segment"), id: "2", perms: canSeeMarketSegments },
    { name: i18n.t("department"), id: "3", perms: canSeeDepartment },
    { name: i18n.t("customer_group"), id: "6", perms: canSeeCustomerGroups },
    { name: i18n.t("operator"), id: "4", perms: canSeeOperator },
    { name: i18n.t("policy"), id: "5", perms: canSeePolicies },
  ];

  const handleClick = (section) => {
    setCurrentTabActive(section.id);
    props.router.navigate(`/settings?tab=${section.id}`);
  };

  return (
    <div className="">
      <div className="page-content">
        <div className="tabs-container">
          <div className="tabs-header">
            {tabHeaderList.map((section) => {
              if (section.perms) {
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
              else {
                return (<></>)
              }
            })}
          </div>

          <div className="page-container">
            <TabContent activeTab={currentTabActive}>
              {canSeeOperator && (
                <TabPane tabId="4">
                  <OperatorInfo type={hasOperator ? "" : "create"} />
                </TabPane>
              )}

              {canSeeUsers && currentTabActive === "0" && (
                <TabPane tabId="0">
                  <Users />
                </TabPane>
              )}

              {canSeeLocations && currentTabActive === "1" && (
                <TabPane tabId="1">
                  <Location />
                </TabPane>
              )}

              {canSeeMarketSegments && currentTabActive === "2" && (
                <TabPane tabId="2">
                  <MarketSegment />
                </TabPane>
              )}

              {canSeeDepartment && (
                <TabPane tabId="3">
                  <Department isActive={currentTabActive === "3"} />
                </TabPane>
              )}

              {canSeeCustomerGroups && (
                <TabPane tabId="6">
                  <CustomerGroup />
                </TabPane>
              )}
              {canSeePolicies && currentTabActive === "5" && (
                <TabPane tabId="5">
                  <Policy />
                </TabPane>
              )}

            </TabContent>

          </div>

        </div>
      </div>
    </div>
  );
};

export default withRouter(Settings)