// Function Name : Staff Service
// Created date :  31/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListStaff(params) {
    return ApiClientWithToken.get(`/v1/cms/staffs?${getParamsHelp(params)}`);
  },
  updateStatusStaff(staffId, active) {
    return ApiClientWithToken.put(`/v1/cms/staffs/${staffId}/status`, {
      active,
    });
  },
  deleteAStaff(staffId) {
    return ApiClientWithToken.delete(`/v1/cms/staffs/${staffId}`);
  },
  deleteMultiStaff(staff_ids) {
    return ApiClientWithToken.delete(`/v1/cms/staffs`, {
      data: { staff_ids },
    });
  },
  getListPosition() {
    return ApiClientWithToken.get(`/v1/cms/positions`);
  },
  createStaffProfile(requestBody) {
    return formDataClientWithToken.post(`/v1/cms/staffs`, requestBody);
  },
  getDetailStaffProfile(id) {
    return ApiClientWithToken.get(`/v1/cms/staffs/${id}`);
  },
  updateStaffProfile(requestBody, id) {
    return formDataClientWithToken.post(`/v1/cms/staffs/${id}`, requestBody);
  },
  getDetailStaffAvailability(id) {
    return ApiClientWithToken.get(`/v1/cms/staffs/${id}/available`);
  },
  updateStaffAvailability(requestBody, id) {
    return ApiClientWithToken.post(`/v1/cms/staffs/${id}/available`, {
      ...requestBody,
    });
  },
  getListTrainerForOperator(params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/staffs/get-by-operator?${getParamsHelp(params)}`
    );
  },
  getListTrainerForCustomer(params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/staffs/get-for-customer?${getParamsHelp(params)}`
    );
  },
  getListTrainerAvaiableForLocation(params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/staffs/available?${getParamsHelp(params)}`
    );
  },
  importSchedule(requestBody) {
    return formDataClientWithToken.post(
      `/v1/cms/staffs/import/schedule`,
      requestBody
    );
  },
  exportSchedule() {
    return ApiClientWithToken.get(`/v1/cms/staffs/template/schedule`, {
      responseType: "blob",
    });
  },
  getListTrainerAvaiableByTime(params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/staffs/available-by-time?${getParamsHelp(params)}`
    );
  },
  getStaffRevenuesByMarketSegments(id, params) {
    return ApiClientWithToken.get(`/v1/cms/staffs/${id}/revenues-by-market-segments?${getParamsHelp(params)}`);
  },
  getStaffPolicies(id) {
    return ApiClientWithToken.get(`/v1/cms/staffs/${id}/policies`);
  }, 
  getListStaffSchedule(params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/staffs/schedules?${getParamsHelp(params)}`
    );
  },
};
