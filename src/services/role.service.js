import ApiClientWithToken from "../api";

export default {
  getListRoles() {
    return ApiClientWithToken.get(`/v1/cms/roles`);
  },
};
