// Function Name : Auth Service
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import ApiClientWithToken, { LoginClient } from "../api";

export default {
  login(requestBody) {
    return LoginClient.post("/user/login", { ...requestBody });
  },
  forgotPassword(requestBody) {
    return LoginClient.post("/user/forgot-password", { ...requestBody });
  },

  logout() {
    return ApiClientWithToken.post("/logout");
  },
};
