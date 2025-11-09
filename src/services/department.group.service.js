// Function Name : Market segment Service
// Created date :  /25             by :  Antoine REY
// Updated date :                      by :  Antoine REY

import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListDepartmentGroups(params = {}) {
    return ApiClientWithToken.get(`/v1/cms/department-groups?${getParamsHelp(params)}`);
  },
  createDepartmentGroup(requestBody) {
    return formDataClientWithToken.post(`v1/cms/department-groups`, requestBody);
  },
  updateDepartmentGroup(id, requestBody) {
    return ApiClientWithToken.put(`v1/cms/department-groups/${id}`, requestBody);
  },
  getDetailDepartmentGroup(id) {
    return ApiClientWithToken.get(`/v1/cms/department-groups/${id}`);
  },
  deleteDepartmentGroup(id) {
    return ApiClientWithToken.delete(`/v1/cms/department-groups/${id}`);
  },
  deleteMultiDepartmentGroup(department_group_ids) {
    return ApiClientWithToken.delete(`/v1/cms/department-groups`, {
      data: { department_group_ids },
    });
  },
};
