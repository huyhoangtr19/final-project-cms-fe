// Function Name : Customer group Service
// Created date :  08/21               by :  Antoine REY
// Updated date :                      by :  Antoine REY

import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListCustomerGroups(params = {}) {
    return ApiClientWithToken.get(`/v1/cms/customer-groups?${getParamsHelp(params)}`);
  },
  createCustomerGroup(requestBody) {
    return formDataClientWithToken.post(`v1/cms/customer-groups`, requestBody);
  },
  updateCustomerGroup(id, requestBody) {
    return ApiClientWithToken.put(`v1/cms/customer-groups/${id}`, requestBody);
  },
  getDetailCustomerGroup(id) {
    return ApiClientWithToken.get(`/v1/cms/customer-groups/${id}`);
  },
  deleteCustomerGroup(id) {
    return ApiClientWithToken.delete(`/v1/cms/customer-groups/${id}`);
  },
  deleteMultiCustomerGroup(customer_group_ids) {
    return ApiClientWithToken.delete(`/v1/cms/customer-groups`, {
      data: { customer_group_ids },
    });
  },
};
