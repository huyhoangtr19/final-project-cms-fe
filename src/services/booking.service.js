// Function Name : Booking Service
// Created date :  6/8/24             by :  VinhLQ
// Updated date :                     by :  VinhLQ

import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListBooking(params) {
    return ApiClientWithToken.get(`/v1/cms/booking?${getParamsHelp(params)}`);
  },
  updateStatusBooking(customerId, active) {
    return ApiClientWithToken.put(`/v1/cms/booking/${customerId}/status`, {
      active,
    });
  },
  deleteABooking(customerId) {
    return ApiClientWithToken.delete(`/v1/cms/booking/${customerId}`);
  },

  deleteMultiBooking(sale_ids) {
    return ApiClientWithToken.delete(`/v1/cms/booking`, {
      data: { sale_ids },
    });
  },

  createBooking(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/booking`, requestBody);
  },
  updateBooking(requestBody, id) {
    return ApiClientWithToken.put(`/v1/cms/booking/${id}`, requestBody);
  },
  getDetailBooking(id) {
    return ApiClientWithToken.get(`/v1/cms/booking/${id}`);
  },
  cancelBooking(requestBody, id) {
    return ApiClientWithToken.post(`/v1/cms/booking/${id}/cancel`, requestBody);
  },
  checkInBooking(id) {
    return ApiClientWithToken.post(`/v1/cms/booking/${id}/check-in`);
  },
  getListBookingCalendar(params){
    return ApiClientWithToken.get(`/v1/cms/booking/calendar?${getParamsHelp(params)}`);
  },
  createBookingPT(requestBody) {
    return ApiClientWithToken.post(`/v1/cms/pt-booking`, requestBody);
  },
  updateBookingPT(requestBody, id) {
    return ApiClientWithToken.put(`/v1/cms/pt-booking/${id}`, requestBody);
  },
  getDetailBookingPT(id) {
    return ApiClientWithToken.get(`/v1/cms/pt-booking/${id}`);
  },
  cancelBookingPT(requestBody, id) {
    return ApiClientWithToken.post(`/v1/cms/pt-booking/${id}/cancel`, requestBody);
  },
  checkInBookingPT(id) {
    return ApiClientWithToken.post(`/v1/cms/pt-booking/${id}/check-in`);
  },
  getListBookingPTCalendar(params){
    return ApiClientWithToken.get(`/v1/cms/pt-booking/calendar?${getParamsHelp(params)}`);
  },
};
