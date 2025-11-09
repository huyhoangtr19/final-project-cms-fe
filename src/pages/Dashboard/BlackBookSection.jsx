import BlackBook from "./BlackBook";
import EndDayReport from "./EndDayReport";

const BlackBookSection = (props) => {
  return (
    <div 
      id={props.id ?? ""}  
      className="dasboard-black-book-section-container dashboard-scroll"
    >
      <BlackBook 
        location={props.location}
      />
      <EndDayReport 
        year={props.year}
        month={props.month}
        location={props.location}
      />
    </div>
  )
}

export default BlackBookSection;