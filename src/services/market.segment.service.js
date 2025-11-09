// Function Name : Market segment Service
// Created date :  21/7/25             by :  Antoine REY
// Updated date :                      by :  Antoine REY

import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListMarketSegments(params = {}) {
    return ApiClientWithToken.get(`/v1/cms/market-segments?${getParamsHelp(params)}`);
  },
  createMarketSegment(requestBody) {
    return formDataClientWithToken.post(`v1/cms/market-segments`, requestBody);
  },
  updateMarketSegment(id, requestBody) {
    return ApiClientWithToken.put(`v1/cms/market-segments/${id}`, requestBody);
  },
  getDetailMarketSegment(id) {
    return ApiClientWithToken.get(`/v1/cms/market-segments/${id}`);
  },
  deleteMarketSegment(id) {
    return ApiClientWithToken.delete(`/v1/cms/market-segments/${id}`);
  },
  deleteMultiMarketSegment(market_segment_ids) {
    return ApiClientWithToken.delete(`/v1/cms/market-segments`, {
      data: { market_segment_ids },
    });
  },
  getValidParent(id, params = {}) {
    return ApiClientWithToken.get(`/v1/cms/market-segments/${id}/valid-parents?${getParamsHelp(params)}`)
  }
};
