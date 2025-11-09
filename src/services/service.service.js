// Function Name : Service Service
// Created date :  28/7/24             by :  NgVinh
// Updated date :  1/8/24              by :  NgVinh

import ApiClientWithToken from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListServices(params) {
    return ApiClientWithToken.get(`/v1/cms/services?${getParamsHelp(params)}`);
  },
  updateStatusService(serviceId, active) {
    return ApiClientWithToken.put(`/v1/cms/services/${serviceId}/status`, {
      active,
    });
  },
  deleteAService(serviceId) {
    return ApiClientWithToken.delete(`/v1/cms/services/${serviceId}`);
  },
  deleteMultiService(service_ids) {
    return ApiClientWithToken.delete(`/v1/cms/services`, {
      data: { service_ids },
    });
  },
  createService(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/services`, { ...requestBody });
  },
  updateService(requestBody, id) {
    return ApiClientWithToken.put(`/v1/cms/services/${id}`, { ...requestBody });
  },
  getDetailService(id) {
    return ApiClientWithToken.get(`/v1/cms/services/${id}`);
  },
  getListServiceForOperator() {
    return ApiClientWithToken.get(`/v1/cms/services/get-by-operator`);
  },
};
