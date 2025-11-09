// Function Name : Customer review Service
// Created date :  13/10/24             by :  VinhLQ
// Updated date :                      by :  VinhLQ

import ApiClientWithToken from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListLocationReview(params) {
    return ApiClientWithToken.get(
      `/v1/cms/reviews/locations?${getParamsHelp(params)}`
    );
  },
  getListTrainerReview(params) {
    return ApiClientWithToken.get(
      `/v1/cms/reviews/trainers?${getParamsHelp(params)}`
    );
  },
  getListBookingReview(params) {
    return ApiClientWithToken.get(
      `/v1/cms/reviews/bookings?${getParamsHelp(params)}`
    );
  },
};
