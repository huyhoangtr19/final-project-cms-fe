// Function Name : Dashboard Service
// Created date :  25/2/25             by :  NgVinh
// Updated date :                      by :  NgVinh

import ApiClientWithToken from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getListNewestActivity() {
    return ApiClientWithToken.get(`/v1/cms/dashboard/newest-activity?limit=5`);
  },
  getGrowChart(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/growth-chart?${getParamsHelp(params)}`
    );
  },
  getListDataStatistic(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/statistics?${getParamsHelp(params)}`
    );
  },
  getListPrediction(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/prediction?${getParamsHelp(params)}`
    );
  },
  getMetricPotential() {
    return ApiClientWithToken.get(`/v1/cms/metrics/potential`);
  },
  getMetricRisk() {
    return ApiClientWithToken.get(`/v1/cms/metrics/risk`);
  },
  updateMetricsPotential(requestBody) {
    return ApiClientWithToken.post("/v1/cms/metrics/potential", requestBody);
  },
  updateMetricsRisk(requestBody) {
    return ApiClientWithToken.post("/v1/cms/metrics/risk", requestBody);
  },
  getListStaffSalesRevenues(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/staffs/sales-revenue?${getParamsHelp(params)}`
    );
  },
  getListStaffTrainerCommission(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/staffs/trainer-commission?${getParamsHelp(params)}`
    );
  },
  getListStaffBurntSessions(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/staffs/burnt-session?${getParamsHelp(params)}`
    )
  },
  getListStaffGrowthChartExcel(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/staffs/report-bookings?${getParamsHelp(params)}`
    );
  },
  getStaffOperationReport(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/staffs/operation-report?${getParamsHelp(params)}`
    );
  },
  getListSalesPackagesKind(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/sales/package-kind?${getParamsHelp(params)}`
    )
  },
  getYearTotalRevenue(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/sales/total-revenue?${getParamsHelp(params)}`
    );
  },
  getServiceRevenue(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/sales/service-revenue?${getParamsHelp(params)}`
    );
  },
  getListCustomerMarketSegments(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/customers/market-segments?${getParamsHelp(params)}`
    );
  },
  getListCustomerStages(params) {
    return ApiClientWithToken.get(
      `/v1/cms/dashboard/customers/stages?${getParamsHelp(params)}`
    );
  },
};
