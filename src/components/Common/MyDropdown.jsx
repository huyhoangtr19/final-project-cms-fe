// Function Name : Dropdown Component
// Created date :  24/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import React from "react";

const MyDropdown = ({
  name = "",
  options = [],
  optionsChoose = [],
  placeholder,
  displayEmpty = false,
  selected,
  setSelected,
  disabled,
  invalid,
  onBlur,
  onFocus,
  isColor = false,
  isForm = false,
}) => {
  return (
    <select
      value={selected ?? ''}
      className={isForm ? "form-input" : "filter-select"}
      name={name}
      onChange={(e) => setSelected(e.target.value)}
      onBlur={onBlur}
      onFocus={onFocus}
      disabled={disabled}
      style={{
        border: invalid ? "1px solid #f46a6a" : "",
        color:
          (!selected || displayEmpty) && selected === ""
            ? "#74788D"
            : "#343a40",
      }}
    >
      <option
        style={{ display: !selected || displayEmpty ? "block" : "none" }}
        value=""
      >
        {placeholder}
      </option>
      { optionsChoose.length > 0 ? optionsChoose?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      )) :  options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default MyDropdown;
