import ApiClientWithToken from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListNotification(params) {
    return ApiClientWithToken.get(
      `/v1/cms/notifications?${getParamsHelp(params)}`
    );
  },
  createNotification(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/notifications`, {
      ...requestBody,
    });
  },
  updateNotification(id, requestBody) {
    return ApiClientWithToken.put(`/v1/cms/notifications/${id}`, {
      ...requestBody,
    });
  },
  cancelSendSchedule(id) {
    return ApiClientWithToken.post(`/v1/cms/notifications/${id}/cancel`);
  },

  deleteNotifications(notification_ids) {
    return ApiClientWithToken.delete(`/v1/cms/notifications`, {
      data: { notification_ids },
    });
  },
  getNotificationDetail(optionId) {
    return ApiClientWithToken.get(`/v1/cms/notifications/${optionId}`);
  },
  getCategoryByOperator() {
    return ApiClientWithToken.get(`/v1/cms/product-categories/get-by-operator`);
  },
  getListUnreadNotice(params){
     return ApiClientWithToken.get(
      `/v1/cms/notifications/by-user?${getParamsHelp(params)}`
    );
  },
  readNotice(id){
    return ApiClientWithToken.get(`/v1/cms/notifications/by-user/${id}/read`)
  }
};
