// Function Name : Policy Service
// Created date :  06/08/25            by :  Quentin POINTEAU
// Updated date :                      by :  Quentin POINTEAU

import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListPolicies(params = {}) {
    return ApiClientWithToken.get(`/v1/cms/policy?${getParamsHelp(params)}`);
  },
  createPolicy(requestBody) {
    return formDataClientWithToken.post(`v1/cms/policy`, requestBody);
  },
  updatePolicy(id, requestBody) {
    return ApiClientWithToken.put(`v1/cms/policy/${id}`, requestBody);
  },
  getDetailPolicy(id) {
    return ApiClientWithToken.get(`/v1/cms/policy/${id}`);
  },
  deletePolicy(id) {
    return ApiClientWithToken.delete(`/v1/cms/policy/${id}`);
  },
  deleteMultiPolicies(policy_ids) {
    return ApiClientWithToken.delete(`/v1/cms/policy`, {
      data: { policy_ids },
    });
  }
};
