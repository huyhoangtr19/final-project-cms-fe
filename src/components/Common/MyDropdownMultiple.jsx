// Function Name : Dropdown Component
// Created date :  24/7/24             by :  VinhLQ
// Updated date :                      by :  VinhLQ

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "reactstrap";
import styled from "styled-components";
import i18n from "../../i18n";

const OptionItem = styled.div`
  display: flex;
  gap: 8px;
  cursor: pointer;
  height: 32px;
  padding-left: 4px;
  align-items: center;

  &:hover {
    background-color: #556ee6;
  }
`;

const MyDropdownMultiple = ({
  placeholder = "",
  options,
  selected,
  setSelected,
  invalid,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleCheckboxChange = (e) => {
    let listSelected = [];
    if (selected.includes(e)) {
      listSelected = selected.filter((no) => no !== e);
    } else {
      listSelected = [...selected, e];
    }
    setSelected(listSelected);
  };

  const handleCheckAll = (e) => {
    e.stopPropagation();
    if (!isAllChecked) {
      setSelected(options.map((item) => item.value));
    } else {
      setSelected([]);
    }
  };
  const isAllChecked = useMemo(() => {
    return options?.length === selected.length;
  }, [selected, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <div
        className="d-flex flex-row align-items-center justify-content-between filter-select"
        onClick={toggleDropdown}
        style={{
          border: invalid ? "1px solid #f46a6a" : "",
        }}
      >
        <div
          style={{
            color:
              !selected.length && selected.length === 0 ? "#74788D" : "#343a40",
          }}
        >
        {i18n.t("selected",{number:selected.length})} {placeholder}
        </div>
        <i className="fa fa-chevron-down" />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "105%",
            width: "100%",
            background: "#fff",
            zIndex: 100,
            border: "1px solid #ced4da",
            borderRadius: "4px",
            display: isDropdownOpen ? "block" : "none",
          }}
        >
          <OptionItem onClick={handleCheckAll}>
            <Input type="checkbox" checked={isAllChecked} onChange={() => {}} />
            <span className="d-block">
              {i18n.t("all")} {placeholder}
            </span>
          </OptionItem>
          {options.map((option) => (
            <div key={option.value}>
              <OptionItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckboxChange(option.value);
                }}
              >
                <Input
                  style={{
                    margin: 0,
                  }}
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => {}}
                />
                <span className="d-block">{option.label}</span>
              </OptionItem>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyDropdownMultiple;
