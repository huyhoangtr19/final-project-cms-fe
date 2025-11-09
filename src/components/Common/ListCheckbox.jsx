// Function Name : App Service
// Created date :  8/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh

import React from "react";
import { Input } from "reactstrap";

const ListCheckbox = ({ list, selectedList, setSelectedList }) => {
  const handleCheckboxChange = (choose) => {
    if (selectedList.includes(choose)) {
      setSelectedList(selectedList.filter((no) => no !== choose));
    } else {
      setSelectedList([...selectedList, choose]);
    }
  };

  return (
    <div className="d-flex flex-row gap-4">
      {list.map((item) => (
        <div key={item.id} className="d-flex flex-row gap-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleCheckboxChange(item?.id);
            }}
          >
            <Input
              type="checkbox"
              checked={selectedList.includes(item?.id)}
              onChange={() => {}}
            />
          </div>
          <div>{item.name}</div>
        </div>
      ))}
    </div>
  );
};
export default ListCheckbox;
