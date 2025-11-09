// Function Name : Product Service
// Created date :  6/8/24             by :  NgVinh
// Updated date :                     by :  NgVinh
import ApiClientWithToken from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListProduct(params) {
    return ApiClientWithToken.get(`/v1/cms/products?${getParamsHelp(params)}`);
  },
  createProduct(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/products`, { ...requestBody });
  },
  updateProduct(requestBody, id) {
    return ApiClientWithToken.put(`/v1/cms/products/${id}`, { ...requestBody });
  },
  deleteProduct(optionId) {
    return ApiClientWithToken.delete(`/v1/cms/products/${optionId}`);
  },
  updateStatusProduct(optionId, active) {
    return ApiClientWithToken.put(`/v1/cms/products/${optionId}/status`, {
      active,
    });
  },
  deleteMultiProducts(product_ids) {
    return ApiClientWithToken.delete(`/v1/cms/products`, {
      data: { product_ids },
    });
  },
  getProductDetail(optionId) {
    return ApiClientWithToken.get(`/v1/cms/products/${optionId}`);
  },
  getListProductOperator(params = {}) {
    return ApiClientWithToken.get(`/v1/cms/products/get-by-operator?${getParamsHelp(params)}`);
  },
};
