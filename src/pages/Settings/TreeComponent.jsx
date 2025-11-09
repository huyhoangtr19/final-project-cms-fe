import React, { useEffect } from "react";
import i18n from "../../i18n";

const TreeComponentItem = React.memo(({ item, selectedItems, handleCheckboxChange, canDelete, openItemDetail, setDeleteId, setIsOpen, isDepartment, setSelectedDepartment, isListDisplay, selectedItem }) => {
  return (
    <li key={item.id} className={"tree-list-item"}>
      <div className={"d-flex flex-row gap-2 justify-content-between " + (isListDisplay ? "tree-item-hover " : "tree-item ") + (item.id === selectedItem ? "tree-item-selected" : "")}
        onClick={() => {
          if (isListDisplay)
            setSelectedDepartment(item.id)
        }}
      >
        <div className="d-flex flex-row gap-2 align-items-center">
          {(item.name !== "Uncategorized" && !isListDisplay) && (<input
            type="checkbox"
            checked={selectedItems.includes(Number(item.id))}
            onChange={() => handleCheckboxChange(item.id)}
          />
          )}
          <div>{isDepartment && item.name !== "Uncategorized" ? item.id + " - " + item.name : item.name}</div>

          {item.customer_groups && item.customer_groups.length > 0 && (
            <div style={{ display: "flex" }}>
              <div> - </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  height: "fit-content",
                  marginLeft: "8px",
                  gap: 8,
                }}
              >
                {item.customer_groups.map((group, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "2px 5px",
                      backgroundColor: group.is_default ? "#3a3b5cce" : "#F5F5F5",
                      color: group.is_default ? "#F4F1ED" : "#000",
                      borderRadius: "3px",
                      fontSize: "10px",
                    }}
                  >
                    {group.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {canDelete && item.name !== "Uncategorized" && !isListDisplay && (
          <div className="d-flex flex-row gap-2">
            <button
              className="btn btn-sm btn-delete-outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setDeleteId(item.id);
              }}
            >
              {i18n.t("delete")}
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => openItemDetail(item)}
            >
              {i18n.t("update")}
            </button>
          </div>
        )}
      </div>
      {item.children.length > 0 && (
        <ul>
          {item.children.map((child) => (
            <TreeComponentItem
              key={child.id}
              item={child}
              selectedItems={selectedItems}
              handleCheckboxChange={handleCheckboxChange}
              canDelete={canDelete}
              openItemDetail={openItemDetail}
              setDeleteId={setDeleteId}
              setIsOpen={setIsOpen}
              isDepartment={isDepartment}
              isListDisplay={isListDisplay}
              setSelectedDepartment={setSelectedDepartment}
              selectedItem={selectedItem}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

const TreeComponent = React.memo(({ items, selectedItems, handleCheckboxChange, canDelete, openItemDetail, setDeleteId, setIsOpen, isDepartment, isListDisplay = false, setSelectedDepartment = null, selectedItem = null }) => {
  return (
    <ul className="tree">
      {items.map((item) => (
        <TreeComponentItem
          key={item.id}
          item={item}
          selectedItems={selectedItems}
          handleCheckboxChange={handleCheckboxChange}
          canDelete={canDelete}
          openItemDetail={openItemDetail}
          setDeleteId={setDeleteId}
          setIsOpen={setIsOpen}
          isDepartment={isDepartment}
          isListDisplay={isListDisplay}
          setSelectedDepartment={setSelectedDepartment}
          selectedItem={selectedItem}
        />
      ))}
    </ul>
  );
});

export default TreeComponent;