// Function Name : Operator store
// Created date :  21/7/24           by :  NgVinh
// Updated date :                    by :  NgVinh

import moment from "moment";
import operatorService from "../services/operator.service";
import store from "../store";
import { setHasOperator, setLocationOperator, setOperator } from "../store/reducers/operator";
import userService from "../services/user.service";
import { setPermissionUser, setUserInfo } from "../store/reducers/auth";
import {
  lIST_SIDEBAR_CONTENT,
  listStatusBooking,
} from "../constants/app.const";
import Cookies from "js-cookie";

export const handleGetOperatorForAdmin = async () => {
  try {
    const response = await operatorService.getOperatorForAdmin();

    if (response.success) {
      store.dispatch(setHasOperator(true));
      store.dispatch(setOperator(response.data));
    }
  } catch (e) {
    if (e.message === "Resource not found") {
      store.dispatch(setHasOperator(false));
      store.dispatch(setOperator(null));
    }
    console.log("get operator error", e);
  }
};
export const convertMinutesToTimeString = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};
export const handleGetInformationAdmin = async () => {
  try {
    const response = await userService.getProfileUser();

    if (response.success) {
      store.dispatch(setUserInfo(response.data));
      store.dispatch(
        setPermissionUser(response.data.permissions.map((item) => item.code))
      );
      Cookies.set(
        "permissionUser",
        JSON.stringify(response.data.permissions.map((item) => item.code))
      );
    }

    const responseLocation = await operatorService.getListLocationForOperator();
    if (responseLocation.success) {
      store.dispatch(setLocationOperator(responseLocation.data.map((item) => {
        return { value: item.id, label: item.name };
      })));

    }

  } catch (e) {
    console.log("e", e);
  }
};

export const getDayOfWeekFromDate = (date) => {
  const [day, month, year] = moment(date)
    .format("DD/MM/YYYY")
    .split("/")
    .map(Number);
  const dates = new Date(year, month - 1, day); // Months are zero-based

  return dates.getDay();
};

export const formatNumberAsCurrency = (number) => {
  if (!number) return 0;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(number);
};

export const getColorOfStatus = (status) => {
  const statusObj = listStatusBooking.find((item) => item.value === status);
  return statusObj;
};

export const formatDate = (date) => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  if (window.innerWidth < 768) {
    return moment(date)
      .format("DD/MM/YYYY")
    // return date.toLocationDateString('en-US',{weekday:'short'})
  }

  const dayOfWeek = daysOfWeek[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${dayOfWeek}, ${month} ${day}, ${year}`;
};

const units = [
  "",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];
const positions = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

export const readThreeDigits = (number) => {
  const hundred = Math.floor(number / 100);
  const ten = Math.floor((number % 100) / 10);
  const one = number % 10;
  console.log("hundred", hundred, ten, one);
  let result = "";

  if (hundred > 0) {
    result += units[hundred] + " trăm ";
  }

  if (ten > 0) {
    if (ten === 1) {
      result += "mười ";
    } else {
      result += units[ten] + " mươi ";
    }

    if (one === 1) {
      result += "mốt ";
    } else if (one === 5) {
      result += "lăm ";
    } else if (one > 0) {
      result += units[one] + " ";
    }
  } else if (one > 0) {
    result += "lẻ " + units[one] + " ";
  }

  return result;
};

export const convertToWords = (number) => {
  if (number === 0) return "không";

  const groups = [];
  while (number > 0) {
    groups.push(number % 1000);
    number = Math.floor(number / 1000);
  }

  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      result += readThreeDigits(groups[i]) + positions[i] + " ";
    }
  }

  // Clean up the text
  result = result
    .trim()
    .replace(/\s+/g, " ")
    .replace(/không trăm lẻ/g, "không trăm")
    .replace(/không trăm không mươi/g, "không trăm")
    .replace(/không mươi/g, "linh")
    .replace(/mươi một/g, "mươi mốt");

  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result + " đồng";
};

export function convertToUtcString(date, timeInMinutes) {
  const localDate = new Date(date);
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = timeInMinutes % 60;
  localDate.setHours(hours, minutes, 0, 0);
  return localDate.toISOString();
}

export function isPermissionScreen(permission, listPermission) {
  if (listPermission.includes(permission) || permission === "all") {
    return true;
  }
  return false;
}
export function filteredMenuItems(allowedKeys) {
  return lIST_SIDEBAR_CONTENT.filter((item) => {
    if (item.key === "all") {
      return true; // Always include items with key 'all'
    } else if (Array.isArray(item.key)) {
      return item.key.some((key) => allowedKeys.includes(key)); // Check if any key in the array is allowed
    } else {
      return allowedKeys.includes(item.key); // Check if the single key is allowed
    }
  });
}

export function detectBrowser() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Gecko/')) {
    return 'gecko';
  } else if (userAgent.includes('Chrome/')) {
    return 'chrome';
  } else if ( userAgent.includes("Mozilla/")) {
    return 'gecko'
  }
  return 'chrome';
}
export const convertHtmlToTextContent = (html) => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    const textContent = tempElement.innerText || "";
    return textContent;
  };