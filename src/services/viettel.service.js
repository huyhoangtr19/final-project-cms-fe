import ApiClientWithToken from "../api";

export default {
  getConfigViettel(id) {
    return ApiClientWithToken.get(`/v1/cms/viettel/location/${id}/config`);
  },
  updateConfigViettel(id, requestBody) {
    return ApiClientWithToken.post(`/v1/cms/viettel/location/${id}/config`, { ...requestBody });
  },
  updateHealthViettel(id, requestBody) {
    return ApiClientWithToken.post(`/v1/cms/viettel/location/${id}/check-health`, { ...requestBody });
  },
  getInVoices(saleId){
    return ApiClientWithToken.get(`/v1/cms/viettel/invoices?sale_order_id=${saleId}`);
  },
  getLogInVoices(saleId){
    return ApiClientWithToken.get(`/v1/cms/viettel/invoices/logs?sale_order_id=${saleId}`);
  },
  getInVoiceFiles(requestBody){
    return ApiClientWithToken.get(`/v1/cms/viettel/invoices/get-invoice-file?invoice_no=${requestBody.invoice_no}&sale_order_id=${requestBody.sale_order_id}`);
  },
  updatePaymentStatus(requestBody){
    return ApiClientWithToken.post(`/v1/cms/viettel/invoices/update-payment-status`, { ...requestBody });
  },
  sendMail(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/viettel/invoices/send-mail`, { ...requestBody });
  }
};
