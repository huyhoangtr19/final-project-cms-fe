// Function Name : Package Service
// Created date :  1/8/24            by :  NgVinh
// Updated date :                    by :  NgVinh

import ApiClientWithToken from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListPackages(params) {
    return ApiClientWithToken.get(`/v1/cms/packages?${getParamsHelp(params)}`);
  },
  updateStatusPackages(packageId, active) {
    return ApiClientWithToken.put(`/v1/cms/packages/${packageId}/status`, {
      active,
    });
  },
  deleteAPackages(packageId) {
    return ApiClientWithToken.delete(`/v1/cms/packages/${packageId}`);
  },
  deleteMultiPackages(package_ids) {
    return ApiClientWithToken.delete(`/v1/cms/packages`, {
      data: { package_ids },
    });
  },
  createPackages(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/packages`, { ...requestBody });
  },
  updatePackages(requestBody, id) {
    return ApiClientWithToken.put(`/v1/cms/packages/${id}`, { ...requestBody });
  },
  getDetailPackages(id) {
    return ApiClientWithToken.get(`/v1/cms/packages/${id}`);
  },
  getListPackageForOperator(params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/packages/get-by-operator?${getParamsHelp(params)}`
    );
  },
  getListPackageForCustomer(customerId, params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/packages/get-for-customer/${customerId}?${getParamsHelp(params)}`
    );
  },
};
