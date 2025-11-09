// Function Name : Market segment Service
// Created date :  21/7/25             by :  Antoine REY
// Updated date :                      by :  Antoine REY

import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListDepartments(params = {}) {
    return ApiClientWithToken.get(`/v1/cms/departments?${getParamsHelp(params)}`);
  },
  createDepartment(requestBody) {
    return formDataClientWithToken.post(`v1/cms/departments`, requestBody);
  },
  updateDepartment(id, requestBody) {
    return ApiClientWithToken.put(`v1/cms/departments/${id}`, requestBody);
  },
  getDetailDepartment(id) {
    return ApiClientWithToken.get(`/v1/cms/departments/${id}`);
  },
  deleteDepartment(id) {
    return ApiClientWithToken.delete(`/v1/cms/departments/${id}`);
  },
  deleteMultiDepartment(department_ids) {
    return ApiClientWithToken.delete(`/v1/cms/departments`, {
      data: { department_ids },
    });
  },
  getValidParent(id, params = {}) {
    return ApiClientWithToken.get(`/v1/cms/departments/${id}/valid-parents?${getParamsHelp(params)}`)
  }
};
