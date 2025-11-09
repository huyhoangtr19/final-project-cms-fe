import i18n from "../../i18n"

const DashboardCard = (props) => {
  return (
    <div className="dashboard-card-container" style={props.style}>
      <div className="dashboard-card-header">
        <h5 className="dashboard-card-title">{props.title}</h5>
        <div className="dashboard-card-details-section">
          {props.additionalElement}
          {props.onDetailsClick && (
            <button
              className="btn btn-ghost dashboard-card-details"
              onClick={props.onDetailsClick}
            >
              {i18n.t("view_details")}
            </button>
          )}
        </div>
      </div>
      <div className="dashboard-card-body">
        {props.children}
      </div>
    </div>
  )
}

export default DashboardCard;