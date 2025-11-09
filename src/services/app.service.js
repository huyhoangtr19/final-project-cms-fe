// Function Name : App Service
// Created date :  8/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh

import ApiClientWithToken from "../api";

export default {
  getListUnit() {
    return ApiClientWithToken.get("/v1/cms/units");
  },
  getListCancelType() {
    return ApiClientWithToken.get("/v1/cms/cancel-types");
  },
  getListPermissions() {
    return ApiClientWithToken.get("/v1/cms/permissions");
  },
};
