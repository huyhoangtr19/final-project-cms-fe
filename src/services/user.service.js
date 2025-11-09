import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListUsers(params = {}) {
    return ApiClientWithToken.get(`/v1/cms/users?${getParamsHelp(params)}`);
  },
  deleteMultiUsers(user_ids) {
    return ApiClientWithToken.delete(`/v1/cms/users`, {
      data: { user_ids },
    });
  },
  updateStatusUser(id, status) {
    return ApiClientWithToken.put(`/v1/cms/users/${id}/status`, {
      status,
    });
  },
  getDetailUserPermissions(id) {
    return ApiClientWithToken.get(`/v1/cms/users/${id}`);
  },
  getProfileUser() {
    return ApiClientWithToken.get("/v1/cms/users/profile");
  },
  createNewUser(data) {
    return ApiClientWithToken.post(`/v1/cms/users`, data);
  },
  updateUser(id, data) {
    return ApiClientWithToken.put(`/v1/cms/users/${id}`, data);
  },
  changePassword(data) {
    return ApiClientWithToken.put(`/v1/cms/users/change-password`, data);
  },
  createAdminOperator(data) {
    return ApiClientWithToken.post(`/admin-operator/register`, data);
  },
};
