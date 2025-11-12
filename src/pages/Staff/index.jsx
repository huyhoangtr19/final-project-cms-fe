import PropTypes from "prop-types";
import StaffList from "./StaffList";
import withRouter from "../../components/Common/withRouter";

const Staff = (props) => {
  document.title = "Staff | Fitness CMS";
  return (
    <div className="">
      <div className="page-content">
        <div className="page-container">
          <StaffList
            type={props.type}
            history={props.history}
          />
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
