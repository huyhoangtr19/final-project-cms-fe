// Function Name : Class Service
// Created date :  2/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh

import ApiClientWithToken from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListClass(params) {
    return ApiClientWithToken.get(`/v1/cms/class?${getParamsHelp(params)}`);
  },
  updateStatusClass(packageId, active) {
    return ApiClientWithToken.put(`/v1/cms/class/${packageId}/status`, {
      active,
    });
  },
  deleteClass(packageId) {
    return ApiClientWithToken.delete(`/v1/cms/class/${packageId}`);
  },
  deleteMultiClasses(class_ids) {
    return ApiClientWithToken.delete(`/v1/cms/class`, {
      data: { class_ids },
    });
  },

  createClass(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/class`, { ...requestBody });
  },
  updateClass(requestBody, id) {
    return ApiClientWithToken.put(`/v1/cms/class/${id}`, { ...requestBody });
  },
  getDetailClass(id) {
    return ApiClientWithToken.get(`/v1/cms/class/${id}`);
  },
  getListScheduleForClass(id, params) {
    return ApiClientWithToken.get(
      `/v1/cms/class/${id}/schedule-list?${getParamsHelp(params)}`
    );
  },
  getDetailScheduleForClass(id) {
    return ApiClientWithToken.get(`/v1/cms/class/${id}/schedule-time`);
  },
  createScheduleForClass(requestBody, id) {
    return ApiClientWithToken.post(`/v1/cms/class/${id}/schedule`, {
      ...requestBody,
    });
  },
  updateScheduleForClass(requestBody, id) {
    return ApiClientWithToken.put(`/v1/cms/class/${id}/schedule-time`, {
      ...requestBody,
    });
  },
  deleteAScheduleForClass(id) {
    return ApiClientWithToken.delete(`/v1/cms/class/${id}/schedule-time`);
  },
  deleteScheduleForClassMulti(class_schedule_time_ids) {
    return ApiClientWithToken.delete(`/v1/cms/class/schedule-time`, {
      data: { class_schedule_time_ids },
    });
  },
  updateStatusClassSchedule(scheduleId) {
    return ApiClientWithToken.post(
      `/v1/cms/class/${scheduleId}/schedule-time/cancel`,
      
    );
  },
  getListClassScheduleTime(params) {
    return ApiClientWithToken.get(
      `/v1/cms/class/class-schedule?${getParamsHelp(params)}`
    );
  },
  getListClassScheduleCalender(params) {
    return ApiClientWithToken.get(
      `/v1/cms/class/class-schedule/calendar?${getParamsHelp(params)}`
    );
  },
  getListClassForCustomer(params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/class/get-for-customer?${getParamsHelp(params)}`
    );
  },
  getListScheduleForStaffByClass(classId, staffId, params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/class/${classId}/schedule/get-by-staff/${staffId}?${getParamsHelp(
        params
      )}`
    );
  },
  getClassOccupancyRate(params) {
    return ApiClientWithToken.get(
      `/v1/cms/class/occupancy-rate?${getParamsHelp(params)}`
    );
  },
};
