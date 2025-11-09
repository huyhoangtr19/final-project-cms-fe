// Function Name : Option Service
// Created date :  6/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh
import ApiClientWithToken from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListOptions(params) {
    return ApiClientWithToken.get(`/v1/cms/options?${getParamsHelp(params)}`);
  },
  createOption(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/options`, { ...requestBody });
  },
  updateOption(requestBody, id) {
    return ApiClientWithToken.put(`/v1/cms/options/${id}`, { ...requestBody });
  },
  updateStatusOption(optionId, active) {
    return ApiClientWithToken.put(`/v1/cms/options/${optionId}/status`, {
      active,
    });
  },
  deleteOption(optionId) {
    return ApiClientWithToken.delete(`/v1/cms/options/${optionId}`);
  },
  deleteMultiOptions(option_ids) {
    return ApiClientWithToken.delete(`/v1/cms/options`, {
      data: { option_ids },
    });
  },
  getOptionDetail(optionId) {
    return ApiClientWithToken.get(`/v1/cms/options/${optionId}`);
  },
  getListOptionOperator() {
    return ApiClientWithToken.get(`/v1/cms/options/get-by-operator`);
  },
  getListOptionByProduct(productId) {
    return ApiClientWithToken.get(`/v1/cms/options/get-by-product/${productId}`);
  },
};
