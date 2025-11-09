import React, { useState } from "react";
import {
  ListGroup,
  ListGroupItem,
  Badge,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

const MyDropdownColor = ({
  options,
  placeholder,
  displayEmpty = false,
  selected,
  setSelected,
  disabled,
  invalid,
  onBlur,
  onFocus,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  return (
    <Dropdown
      isOpen={dropdownOpen}
      toggle={toggle}
      onBlur={onBlur}
      onFocus={onFocus}
      disabled={disabled}
    >
      <DropdownToggle
        tag='div'
        color='white'
        caret
        style={invalid ? { border: "1px solid #f46a6a" } : {}}
        className="filter-select"
      >
        <div className="d-flex flex-row justify-content-between align-items-center">
          {selected || selected === 0 ? (
            <div className="d-flex align-items-center gap-2 text-left">
              <div
                style={{
                  // display: isList === "month" ? "flex" : "none",
                  width: "8px",
                  height: "8px",
                  borderRadius: "16px",
                  backgroundColor: options.find(
                    (item) => item.value === selected
                  ).color,
                }}
              ></div>
              {options.find((item) => item.value === selected).label}
            </div>
          ) : (
            <div className="d-flex text-left">{placeholder}</div>
          )}
          <i className="fa fa-chevron-down" />
        </div>
      </DropdownToggle>
      <DropdownMenu>
        <ListGroup>
          <ListGroupItem
            key={""}
            className="text-left"
            onClick={() => {
              setSelected("");
              setDropdownOpen(false)
            }}
          >
            {placeholder}
          </ListGroupItem>
          {options.map((status) => (
            <ListGroupItem
              key={status.label}
              onClick={() => {
                setSelected(status.value);
                setDropdownOpen(false)
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    // display: isList === "month" ? "flex" : "none",
                    width: "8px",
                    height: "8px",
                    borderRadius: "16px",
                    backgroundColor: status?.color,
                  }}
                ></div>
                {status.label}
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </DropdownMenu>
    </Dropdown>
  );
};

export default MyDropdownColor;
