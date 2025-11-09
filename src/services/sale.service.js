// Function Name : Sale Service
// Created date :  6/8/24             by :  VinhLQ
// Updated date :                     by :  VinhLQ

import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListSale(params) {
    return ApiClientWithToken.get(
      `/v1/cms/sale-orders?${getParamsHelp(params)}`
    );
  },
  updateStatusSale(customerId, active) {
    return ApiClientWithToken.put(`/v1/cms/sale-orders/${customerId}/status`, {
      active,
    });
  },
  deleteASale(customerId) {
    return ApiClientWithToken.delete(`/v1/cms/sale-orders/${customerId}`);
  },

  deleteMultiSale(sale_ids) {
    return ApiClientWithToken.delete(`/v1/cms/sale-orders`, {
      data: { sale_order_ids: sale_ids },
    });
  },

  createSale(requestBody) {
    return formDataClientWithToken.post(`/v1/cms/sale-orders`, requestBody);
  },
  updateSale(requestBody, id) {
    return formDataClientWithToken.post(
      `/v1/cms/sale-orders/${id}`,
      requestBody
    );
  },
  getDetailSale(id) {
    return ApiClientWithToken.get(`/v1/cms/sale-orders/${id}`);
  },
  getDetailReceiptCode(id) {
    return ApiClientWithToken.get(`/v1/cms/sale-orders/${id}/receipt-code`);
  },
  updateDetailReceiptCode(id) {
    return ApiClientWithToken.put(`/v1/cms/sale-orders/${id}/receipt-code`);
  },
  onHoldPackage(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/sale-orders/packages/on-hold`, requestBody);
  },
  transferPackage(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/sale-orders/packages/transfer`, requestBody);
  },
  paymentRequest(requestBody, id) {
    return ApiClientWithToken.post(`/v1/cms/sale-orders/${id}/payments`, requestBody);
  },
  removePaymentRequest(id) {
    return ApiClientWithToken.post(`/v1/cms/sale-orders/${id}/payments/remove`);
  },
  retryPaymentRequest(id) {
    return ApiClientWithToken.post(`/v1/cms/sale-orders/${id}/payments/retry`);
  },
  subscribeSale(id, device_token) {
    return ApiClientWithToken.post(`/v1/cms/sale-orders/${id}/firebase/subscribe`, {
      token: device_token,
    });
  },
  unsubscribeSale(id, device_token) {
    return ApiClientWithToken.post(`/v1/cms/sale-orders/${id}/firebase/unsubscribe`, {
      token: device_token,
    });
  },
  getPaymentStatus(id) {
    return ApiClientWithToken.get(`/v1/cms/sale-orders/${id}/payments/status`);
  },
  createEContract(id) {
    return ApiClientWithToken.post(`/v1/cms/sale-orders/${id}/e-contract`);
  },
  updateEContract(id) {
    return ApiClientWithToken.put(`/v1/cms/sale-orders/${id}/e-contract`);
  },
  getStatusEContract(id) {
    return ApiClientWithToken.get(`/v1/cms/sale-orders/${id}/e-contract/status`);
  },
  previewEContract(id) {
    return ApiClientWithToken.get(`/v1/cms/sale-orders/${id}/e-contract/download`);
  }
};
