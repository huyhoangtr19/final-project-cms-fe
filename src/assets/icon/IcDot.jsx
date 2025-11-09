// Function Name : Icon
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

const IcDot = ({ color = "#FF0000" }) => {
  return (
    <svg
      width="9"
      height="8"
      viewBox="0 0 9 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 8C5.56087 8 6.57828 7.57857 7.32843 6.82843C8.07857 6.07828 8.5 5.06087 8.5 4C8.5 2.93913 8.07857 1.92172 7.32843 1.17157C6.57828 0.421427 5.56087 0 4.5 0C3.43913 0 2.42172 0.421427 1.67157 1.17157C0.921427 1.92172 0.5 2.93913 0.5 4C0.5 5.06087 0.921427 6.07828 1.67157 6.82843C2.42172 7.57857 3.43913 8 4.5 8Z"
        fill={color}
      />
    </svg>
  );
};
export default IcDot;
