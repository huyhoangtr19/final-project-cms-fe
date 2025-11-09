import i18n from "../../i18n";

const ProductItem = ({
  item,
  productIndex,
  deleteItem,
  currencyCode,

  // Necessary for PackageModal
  onOpenModal,
}) => {
  return (
    <div className="package-item-container">
      <div
        className="package-item-infos-container"
        onClick={onOpenModal}
      >
        <div className="package-item-infos">
          <h6 className="package-item-title">
            {`${item.product_name}`}
          </h6>
          <p className="package-item-info">
            {`${i18n.t("quantity")}: ${item.quantity}`}
          </p>
        </div>

        <p className="package-item-price">
          {item.amount +
            " " +
            currencyCode || ""
          }
        </p>
      </div>
      <i
        onClick={() => deleteItem(productIndex, "products")}
        className="fa fa-times package-item-close"
      ></i>
    </div>
  )
}

export default ProductItem;