import React, { useRef, useState } from "react";
import { Input } from "reactstrap";

//value, setValue
const MyTextarea = ({}) => {
  const textareaRef = useRef(null);
  const [value, setValue] = useState("");

  const onChange = (event) => {
    setValue(event.target.value);
  };
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "inherit"; // Reset height first
    textarea.style.height = `${Math.max(textarea.scrollHeight, 32)}px`; // Set new height
  };

  React.useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <Input
      type="textarea"
      id="autoResizeTextarea"
      ref={textareaRef}
      value={value}
      onChange={onChange}
      style={{ resize: "none", minHeight: "32px" }} // Set initial styles
    />
  );
};
export default MyTextarea;
