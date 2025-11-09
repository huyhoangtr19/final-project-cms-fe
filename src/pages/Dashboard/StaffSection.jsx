import SaleCommissionPerformance from "./SaleCommissionPerformance";
import BurntSessionTrainer from "./BurntSessionTrainer";
import TrainerCommissionPerformance from "./TrainerCommissionPerformance";

const StaffSection = (props) => {
  return (
    <div 
      id={props.id ?? ""}
      className="dashboard-staff-section-container dashboard-scroll"
    >
      <BurntSessionTrainer
        year={props.year}
        month={props.month}
        location={props.location}
      />
      <TrainerCommissionPerformance 
        year={props.year}
        month={props.month}
        location={props.location}
      />
      <SaleCommissionPerformance
        year={props.year}
        month={props.month}
        location={props.location}
      />
    </div>
  );
};

export default StaffSection;
