// Function Name : Icon
// Created date :  02/10/24             by :  VinhLQ
// Updated date :                      by :  VinhLQ

const IcQR = ({ color = "#DFD4FF" }) => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 0H0V4H1.33333V1.33333H4V0ZM0 12V8H1.33333V10.6667H4V12H0ZM8 0V1.33333H10.6667V4H12V0H8ZM10.6667 8H12V12H8V10.6667H10.6667V8ZM2.66667 2.66667H5.33333V5.33333H2.66667V2.66667ZM2.66667 6.66667H5.33333V9.33333H2.66667V6.66667ZM9.33333 2.66667H6.66667V5.33333H9.33333V2.66667ZM6.66667 6.66667H9.33333V9.33333H6.66667V6.66667Z"
        fill={color}
      />
    </svg>
  );
};
export default IcQR;
