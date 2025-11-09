import i18n from "../../i18n";
import moment from "moment/moment";

const PackageItem = ({
  item,
  packageIndex,
  deleteItem,
  currencyCode,

  // Necessary for PackageModal
  onOpenModal,
}) => {

  const calcExpiryDate = () => {
    const startDate =
      item.original_end_date;
    const bonusDays =
      Number(
        item.bonus_days
      ) || 0;
    if (!startDate) return "";
    const newDate = moment(startDate).add(
      bonusDays,
      "days"
    );
    return newDate.format("YYYY-MM-DD");
  }

  const calcAfterDiscount = () => {
    const sessions = item.package_kind !== 0 ? item.original_sessions || 1 : 1;
    if (item.discount_value === 0) {
      return (item.unit_price || 0) * sessions;
    }
    const amount =
      (item.unit_price || 0) * sessions * (1 - item.discount_value / 100);
    return amount;
  };

  return (
    <div className="package-item-container">
      <div 
        className="package-item-infos-container"
        onClick={onOpenModal}  
      >
        <div className="package-item-infos">
          <h6 className="package-item-title">
            {`${item.package_name} ${item.months ? `(${item.months} ${i18n.t("months")})` : ""}`}
          </h6>
          <p className="package-item-info">
            {`${i18n.t("sessions")}: ${item.original_sessions} ${item.bonus_sessions ? ` + ${item.bonus_sessions}` : ""}`}
          </p>
          <p className="package-item-info">
            {`${i18n.t("expires")}: ${calcExpiryDate()}`}
          </p>
        </div>

        <p className="package-item-price">
          {calcAfterDiscount().toLocaleString("vi-VN", {maximumFractionDigits: 2}) +
            " " +
            currencyCode || ""
          }
        </p>
      </div>
      <i
        onClick={() => deleteItem(packageIndex, "packages")}
        className="fa fa-times package-item-close"
      ></i>
    </div>
  )
}

export default PackageItem;