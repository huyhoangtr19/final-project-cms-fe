// Function Name : Operator Service
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh
import ApiClientWithToken, { formDataClientWithToken } from "../api";
import { getParamsHelp } from "../hook/useApp";

export default {
  getOperatorForAdmin() {
    return ApiClientWithToken.get("/v1/cms/operators/get-by-admin");
  },
  createOperatorForAdmin(requestBody) {
    return formDataClientWithToken.post("/v1/cms/operators", requestBody);
  },
  updateStatusOperatorForAdmin(operatorId, active) {
    return ApiClientWithToken.put(`/v1/cms/operators/${operatorId}/status`, {
      active,
    });
  },
  getListCurrencies() {
    return ApiClientWithToken.get("/v1/cms/currencies");
  },
  getListCountries() {
    return ApiClientWithToken.get("/v1/cms/countries");
  },
  getListProvinceByCountry(countryId) {
    return ApiClientWithToken.get(`/v1/cms/provinces/${countryId}`);
  },
  getListProvinceByOperator() {
    return ApiClientWithToken.get(`/v1/cms/provinces/get-by-operator`);
  },
  getListAmenities() {
    return ApiClientWithToken.get("/v1/cms/amenities");
  },
  createLocation(requestBody) {
    return formDataClientWithToken.post("/v1/cms/locations", requestBody);
  },
  getListLocation(params) {
    return ApiClientWithToken.get(`/v1/cms/locations?${getParamsHelp(params)}`);
  },
  getLocationsForUser() {
    return ApiClientWithToken.get(`/v1/cms/locations/get-for-user`);
  },
  deleteALocation(locationId) {
    return ApiClientWithToken.delete(`/v1/cms/locations/${locationId}`);
  },
  deleteMultiLocation(location_ids) {
    return ApiClientWithToken.delete(`/v1/cms/locations`, {
      data: { location_ids },
    });
  },
  updateStatusLocation(locationId, active) {
    return ApiClientWithToken.put(`/v1/cms/locations/${locationId}/status`, {
      active,
    });
  },
  getDetailLocation(id) {
    return ApiClientWithToken.get(`/v1/cms/locations/${id}`);
  },
  updateLocationDetail(requestBody, id) {
    return formDataClientWithToken.post(`/v1/cms/locations/${id}`, requestBody);
  },
  getListLocationForOperator() {
    return ApiClientWithToken.get(`/v1/cms/locations/get-by-operator`);
  },
  getListLocationForPackage(packageId, params = {}) {
    return ApiClientWithToken.get(
      `/v1/cms/locations/get-by-package/${packageId}?${getParamsHelp(params)}`
    );
  },
  getListLocationForService(packageId) {
    return ApiClientWithToken.get(
      `/v1/cms/locations/get-by-service/${packageId}`
    );
  },
  getTimeSheetByLocation(locationId, params) {
    return ApiClientWithToken.get(
      `/v1/cms/locations/${locationId}/timesheets?${getParamsHelp(params)}`
    );
  }
};
