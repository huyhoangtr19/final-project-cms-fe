const InlineSelector = ({ itemList, active }) => {
  /* itemList should be an array like follow:
   * [
   *   {
   *     id: 1,
   *     label: "Great name",
   *     onClick: () => {console.log("Super function!")},
   *     color: "success" // optional in [success, danger, info]
   *   },
   *   {
   *     id: 2,
   *     label: "Another great name",
   *     onClick: () => {return 1},
   *   }
   * ]
   */

  /* active must match one of the ids in itemList */

  return (
    <div className="inline-selector-container">
      {itemList.map((item) => (
        <div
          className={"inline-selector-item" + (item.color ? "-" + item.color : "") + " " + (item.id === active ? "active" : "")}
          onClick={item.onClick}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}

export default InlineSelector;