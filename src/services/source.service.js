// Function Name : Source Service
// Created date :  6/8/24             by :  VinhLQ
// Updated date :                     by :  VinhLQ

import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListSource(params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/sources?${getParamsHelp(params)}`
    );
  },
};
