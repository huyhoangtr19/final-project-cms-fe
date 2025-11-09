// Function Name : Customer Service
// Created date :  30/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import ApiClientWithToken, { formDataClientWithToken, fileDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListCustomer(params = {}) {
    return ApiClientWithToken.get(`/v1/cms/customers?${getParamsHelp(params)}`);
  },

  getListCustomerForOperator(params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/customers/get-by-operator?${getParamsHelp(params)}`
    );
  },

  updateStatusCustomer(customerId, active) {
    return ApiClientWithToken.put(`/v1/cms/customers/${customerId}/status`, {
      active,
    });
  },
  deleteACustomer(customerId) {
    return ApiClientWithToken.delete(`/v1/cms/customers/${customerId}`);
  },
  deleteMultiCustomer(customer_ids) {
    return ApiClientWithToken.delete(`/v1/cms/customers`, {
      data: { customer_ids },
    });
  },
  createCustomer(requestBody) {
    return formDataClientWithToken.post(`/v1/cms/customers`, requestBody);
  },
  updateCustomer(requestBody, id) {
    return formDataClientWithToken.post(`/v1/cms/customers/${id}`, requestBody);
  },
  getDetailCustomer(id) {
    return ApiClientWithToken.get(`/v1/cms/customers/${id}`);
  },
  getListPurchaseForDetail(id, params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/customers/${id}/purchasing-history?${getParamsHelp(params)}`
    );
    //v1/cms/customers/1/purchasing-history
  },
  getListBookingForDetail(id, params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/customers/${id}/booking-history?${getParamsHelp(params)}`
    );
  },
  updateStatusCustomerPurchase(customerId, status) {
    return ApiClientWithToken.put(
      `/v1/cms/customers/purchasing-history/${customerId}/status`,
      {
        status,
      }
    );
  },
  checkInMember(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/customers/check-in/member`, requestBody);
  },
  getListPackageCustomer(params) {
    return ApiClientWithToken.get(
      `/v1/cms/customers/packages?${getParamsHelp(params)}`
    );
  },
  syncCustomerFromHanet() {
    return ApiClientWithToken.post(`/v1/cms/customers/sync-hanet`);
  },
  importCustomerFromExcelFile(requestBody) {
    return fileDataClientWithToken.post(`/v1/cms/customers/import-excel`, requestBody);
  },
  resetPasswordDefauld(id) {
    return ApiClientWithToken.put(`/v1/cms/customers/${id}/change-password`, { password: "Actiwell@1234" })
  }
};
