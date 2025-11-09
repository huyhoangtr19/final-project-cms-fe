// Function Name : Axios Config
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import axios from "axios";
import Cookies from "js-cookie";

import { handleLogout, handleRefreshToken } from "../utils/auth";
import { BASE_URL } from "../constants/api.const";
import { ApiConstant } from "../constants";

export const defaultConfig = (headers) => ({
  baseURL: BASE_URL,
  headers: { ...headers },
  timeout: ApiConstant.TIMEOUT,
});

export const fileImportConfig = (headers) => ({
  baseURL: BASE_URL,
  headers: { ...headers },
}); // No timeout 

const loginConfigInterceptors = (axiosClient) => {
  axiosClient.interceptors.response.use(
    (res) => res.data,
    (res) => Promise.reject(res.response?.data)
  );
  return axiosClient;
};

export const tokenConfigInterceptors = (axiosClient, newToken) => {
  axiosClient.interceptors.request.use(async (config) => {
    config.headers.Authorization = "Bearer " + newToken;
  });
};

const configInterceptors = (axiosClient) => {
  axiosClient.interceptors.response.use(
    async (res) => res.data,
    async (error) => {
      const originalConfig = error.config;
      if (error.response) {
        if (error.response.status === 401 && !originalConfig._retry) {
          originalConfig._retry = true;
          handleLogout();
        } else {
          if (error.response.status === 400) {
            // const errorMess = error?.response?.data?.error;
            // !isHidden &&
            //   showToastApiError(errorMess ? errorMess : "Bad request");
          }
          return Promise.reject(error?.response?.data);
        }
      }
      return Promise.reject(error);
    }
  );
  axiosClient.interceptors.request.use(
    async (config) => {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = "Bearer " + token;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  return axiosClient;
};

const ApiClientWithToken = configInterceptors(
  axios.create(defaultConfig(ApiConstant.HEADER_DEFAULT))
);

export const formDataClientWithToken = configInterceptors(
  axios.create(defaultConfig(ApiConstant.HEADER_FORM_DATA))
);

export const fileDataClientWithToken = configInterceptors(
  axios.create(fileImportConfig(ApiConstant.HEADER_FORM_DATA))
);

export const LoginClient = loginConfigInterceptors(
  axios.create(defaultConfig(ApiConstant.HEADER_DEFAULT))
);

export const tokenClient = tokenConfigInterceptors(
  axios.create(defaultConfig(ApiConstant.HEADER_DEFAULT))
);

export default ApiClientWithToken;
