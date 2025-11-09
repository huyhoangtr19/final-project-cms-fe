import CustomerSourceAnalysis from "./CustomerSourceAnalysis";
import SalePipeline from "./SalePipeline";
import SalesAnalysis from "./SalesAnalysis";
import SalesYearTotalRevenue from "./SalesYearTotalRevenue";
import ServiceBreakdown from "./ServiceBreakdown";

const SalesSection = (props) => {
  return (
    <div 
      id={props.id ?? ""}
      className="dashboard-sales-section-container dashboard-scroll"
    >
      <div className="dashboard-sales-section-1">
        <SalePipeline
          year={props.year}
          month={props.month}
        />
        <CustomerSourceAnalysis
          year={props.year}
          month={props.month}
        />
        <SalesAnalysis
          year={props.year}
          month={props.month}
          location={props.location}
        />
      </div>
      <SalesYearTotalRevenue 
        year={props.year}
        location={props.location}
      />
      <ServiceBreakdown
        year={props.year}
        month={props.month}
        location={props.location}
      />
    </div>
  )
}

export default SalesSection;