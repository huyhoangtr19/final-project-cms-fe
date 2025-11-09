// Function Name : Dropdown Component
// Created date :  24/7/24             by :  VinhLQ
// Updated date :                      by :  VinhLQ

import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import IcSearch from "../../assets/icon/IcSearch";

const OptionItem = styled.div`
  display: flex;
  gap: 8px;
  cursor: pointer;
  height: 32px;
  padding-left: 4px;
  align-items: center;
  background-color: ${(props) => (props.selected ? "#556ee6" : "")};

  &:hover {
    background-color: #556ee6;
    color: #fff;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 8px;
  cursor: pointer;
  min-height: 32px;
  padding-left: 4px;
  align-items: center;
`;

const NoData = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  min-height: 32px;
  align-items: center;
  border-top: 1px solid #ced4da;
  color: #ced4da;
`;

const MyDropdownSearch = ({
  placeholder = "",
  options,
  optionsChoose = [],
  selected,
  setSelected,
  invalid,
  onSearch,
  onFocus,
  disabled,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [value, setValue] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setValue("");
    setIsDropdownOpen((prev) => {
      if (!prev) {
        onFocus && onFocus();
      }
      return !prev;
    });
  };

  const handleSelected = (e) => {
    setSelected(e);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setValue(value);
    onSearch && onSearch(value);
  };

  useEffect(() => {
    const selectedOption = options.find((option) => option.value == selected);
    if (selectedOption) {
      setSelectedLabel(selectedOption.label);
    }
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
        className="form-select form-input"
        onClick={toggleDropdown}
        style={{
          position: "relative",
          border: invalid ? "1px solid #f46a6a" : "",
          paddingRight: "20px",
          paddingLeft: "8px",
          background: disabled ? "#f8f8fb" : "",
        }}
      >
        <div
          style={{
            color: !selected ? "#74788D" : "#343a40",
          }}
        >
          {selected && selectedLabel ? selectedLabel : placeholder}
        </div>
        {!disabled && (
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
            <SearchContainer
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <IcSearch />
              <input
                type="text"
                style={{ border: "none", outline: "none", width: "100%" }}
                value={value}
                onChange={handleChange}
                placeholder={"Search"}
              />
            </SearchContainer>
            {options.length > 0 ? (
              optionsChoose.length > 0 ? (
                optionsChoose.map((option) => (
                  <div key={option.value}>
                    <OptionItem
                      selected={selected === option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelected(option.value);
                        toggleDropdown();
                      }}
                    >
                      <span className="d-block">{option.label}</span>
                    </OptionItem>
                  </div>
                ))
              ) : (
                options.map((option) => (
                  <div key={option.value}>
                    <OptionItem
                      selected={selected === option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelected(option.value);
                        toggleDropdown();
                      }}
                    >
                      <span className="d-block">{option.label}</span>
                    </OptionItem>
                  </div>
                ))
              )
            ) : (
              <NoData>No data</NoData>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDropdownSearch;
