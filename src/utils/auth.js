// Function Name : auth util
// Created date :  19/7/24             by :  NgVinh
// Updated date :  21/7/24             by :  NgVinh

import Cookies from "js-cookie";
import authService from "../services/auth.service";
import store from "../store";
import { setIsToken, setToken, setUserInfo } from "../store/reducers/auth";

export const handleRefreshToken = async () => {
  try {
    const oldRefreshToken = Cookies.get("refreshToken");

    const response = await authService.refreshToken({
      refresh_token: oldRefreshToken,
    });
    if (true) {
      Cookies.set("accessToken", response?.data?.data?.access_token, {
        //TODO: set expiry time
        expires: response?.data?.data?.refresh_token_expiry,
      });
      Cookies.set("refreshToken", response?.data?.data?.refresh_token, {
        //TODO: set expiry time
        expires: response?.data?.data?.refresh_token_expiry,
      });
      Cookies.set("isTokenValid", "true", {
        //TODO: set expiry time
        expires: response?.data?.data?.access_token_expiry,
      });

      return response?.data?.data?.access_token;
    }
  } catch (error) {
    //TODO: logout
    handleLogout();
    console.log("refresh token error", error);
    return "";
  }
};

export const handleLogout = async () => {
  try {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("userInfo");
    sessionStorage.removeItem("isToken");
    sessionStorage.removeItem("accessToken");
  } catch (e) {
    console.log("logout error", e);
  }
};
export const handleGetUserInfo = async () => {
  const userInfo = Cookies.get("userInfo");
  const accessToken = Cookies.get("accessToken");
  if (accessToken) {
    console.log("has", accessToken);
    store.dispatch(setToken(accessToken));
    store.dispatch(setIsToken(true));
    sessionStorage.setItem("isToken", true);
    const res = await operatorService.getOperatorForAdmin();
    console.log("res", res);
  }
  if (userInfo) {
    store.dispatch(setUserInfo(userInfo));
  }
};
