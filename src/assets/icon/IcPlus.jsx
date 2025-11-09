// Function Name : Icon
// Created date :  24/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

const IcPlus = ({ color = "#DFD4FF" }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect opacity="0.01" width="14" height="14" fill={color} />
      <rect
        opacity="0.01"
        x="1.33301"
        y="1.33325"
        width="13.3333"
        height="13.3333"
        fill={color}
      />
      <path
        d="M14.0462 7.36458H8.55954V1.95988C8.55954 1.6135 8.28219 1.33325 7.93938 1.33325C7.59657 1.33325 7.31923 1.6135 7.31923 1.95988V7.36458H1.95316C1.61035 7.36458 1.33301 7.64483 1.33301 7.99122C1.33301 8.3376 1.61035 8.61785 1.95316 8.61785H7.31923V14.04C7.31923 14.3863 7.59657 14.6666 7.93938 14.6666C8.28219 14.6666 8.55954 14.3863 8.55954 14.04V8.61785H14.0462C14.389 8.61785 14.6663 8.3376 14.6663 7.99122C14.6663 7.64483 14.389 7.36458 14.0462 7.36458Z"
        fill={color}
      />
    </svg>
  );
};
export default IcPlus;
