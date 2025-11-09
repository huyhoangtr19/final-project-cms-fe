// Function Name : Category Service
// Created date :  6/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh
import ApiClientWithToken from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListCategory(params) {
    return ApiClientWithToken.get(
      `/v1/cms/product-categories?${getParamsHelp(params)}`
    );
  },
  createCategory(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/product-categories`, {
      ...requestBody,
    });
  },
  updateCategory(requestBody, id) {
    return ApiClientWithToken.put(`/v1/cms/product-categories/${id}`, {
      ...requestBody,
    });
  },
  updateStatusCategory(optionId, active) {
    return ApiClientWithToken.put(
      `/v1/cms/product-categories/${optionId}/status`,
      {
        active,
      }
    );
  },
  deleteCategory(optionId) {
    return ApiClientWithToken.delete(`/v1/cms/product-categories/${optionId}`);
  },
  deleteMultiCategories(prd_category_ids) {
    return ApiClientWithToken.delete(`/v1/cms/product-categories`, {
      data: { prd_category_ids },
    });
  },
  getCategoryDetail(optionId) {
    return ApiClientWithToken.get(`/v1/cms/product-categories/${optionId}`);
  },
  getCategoryByOperator() {
    return ApiClientWithToken.get(`/v1/cms/product-categories/get-by-operator`);
  },
};
