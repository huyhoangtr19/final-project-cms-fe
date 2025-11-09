// Function Name : Input Search Component
// Created date :  25/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import React, { useEffect, useMemo, useRef, useState } from "react";
import IcSearch from "../../assets/icon/IcSearch";
import _lodash from "lodash";

const InputSearch = ({
  value: initialValue,
  onChange,
  debounce = 500,
  placeholder,
}) => {
  const [value, setValue] = useState(initialValue);
  const debounceTimeout = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      onChange(newValue);
    }, debounce);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <div
      className="filter-select d-flex flex-row gap-1 align-items-center"
    >
      <IcSearch />
      <input
        type="text"
        style={{border: "none", outline: "none", width: "100%", padding: 0}}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
};
export default InputSearch;
