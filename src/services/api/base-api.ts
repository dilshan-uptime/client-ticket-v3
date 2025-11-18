import Axios, { AxiosError, type AxiosRequestConfig, type Method } from "axios";
import { Observable } from "rxjs";
import queryString from "query-string";

import { AUTH_RESPONSE } from "@/constants/storage";

import store from "@/app/redux/store";
import storage from "../storage/local-storage";
import { authActions } from "../../app/redux/authSlice";
import { BASE_URL } from "@/constants/api";
import type { AuthenticationResponse } from "@/models/auth";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

declare module "axios" {
  export interface AxiosRequestConfig {
    isPublic?: boolean;
  }
}

const axiosInstance = Axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
  if (!config.isPublic) {
    const authDetails = storage.get(AUTH_RESPONSE);
    if (authDetails?.token) {
      config.headers["Authorization"] = `Bearer ${authDetails.token}`;
    }
  } else {
    delete config.headers["Authorization"];
  }
  return config;
});

//  eslint-disable-next-line
axiosInstance.defaults.headers.common["Content-Type"] = "application/json";
//  eslint-disable-next-line
axiosInstance.defaults.headers.common.Accept = "application/json";

const setBearerToken = (token: string): void => {
  //  eslint-disable-next-line
  // axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (err) => {
    if (
      err.response &&
      (err.response.status === 403 || err.response.status === 401)
    ) {
      handleUnauthorizedKickOut();
    }
    return Promise.reject(err);
  }
);

const removeBearerToken = (): void => {
  //  eslint-disable-next-line
  delete axiosInstance.defaults.headers.common.Authorization;
};

export const handleUnauthorizedKickOut = () => {
  store.dispatch(authActions.logoutUser());
  storage.remove(AUTH_RESPONSE);

  window.location.href = "/";
};

const createUrl = (
  endPoint: string,
  queryParams: Record<string, unknown> | undefined
): string => {
  if (queryParams && Object.keys(queryParams).length > 0) {
    return `${endPoint}?${queryString.stringify(queryParams)}`;
  }

  return endPoint;
};

const createOptions = (
  url: string,
  method: Method,
  data: Record<string, unknown> | undefined,
  customConfig: AxiosRequestConfig = {}
) => ({
  url,
  method,
  data,
  ...customConfig,
});

const apiCall = <T>(
  method: Method,
  endpoint: string,
  data: Record<string, unknown> | undefined = undefined,
  queryParams: Record<string, unknown> | undefined = undefined,
  customConfig: AxiosRequestConfig | undefined = undefined
): Observable<T> => {
  const url = createUrl(endpoint, queryParams);

  const snakeData =
    data && Object.keys(data).length > 0
      ? snakecaseKeys(data, { deep: true })
      : data;
  const options = createOptions(url, method, snakeData, customConfig);

  return new Observable<T>((subscriber) => {
    axiosInstance
      .request<T>(options)
      .then((response) => {
        const data: any =
          response && response.data
            ? camelcaseKeys(response.data, { deep: true })
            : response.data;

        subscriber.next(data);
        subscriber.complete();
      })
      .catch((err: AxiosError) => {
        if (err.response) {
          subscriber.error(err.response.data);
        } else {
          subscriber.error(err);
        }
      });
  });
};

const GET = <T>(
  endpoint: string,
  queryParams: Record<string, unknown> | undefined = undefined,
  customConfig?: AxiosRequestConfig
): Observable<T> =>
  apiCall<T>("GET", endpoint, undefined, queryParams, customConfig);

const POST = <T>(
  endpoint: string,
  data: Record<string, unknown>,
  queryParams: Record<string, unknown> | undefined = undefined,
  customConfig?: AxiosRequestConfig
): Observable<T> =>
  apiCall<T>("POST", endpoint, data, queryParams, customConfig);

const PUT = <T>(
  endPoint: string,
  data: Record<string, unknown>,
  queryParams: Record<string, unknown> | undefined = undefined,
  customConfig?: AxiosRequestConfig
): Observable<T> =>
  apiCall<T>("PUT", endPoint, data, queryParams, customConfig);

const DELETE = <T>(
  endPoint: string,
  data: Record<string, unknown> | undefined = undefined,
  queryParams: Record<string, unknown> | undefined = undefined,
  customConfig?: AxiosRequestConfig
): Observable<T> =>
  apiCall<T>("DELETE", endPoint, data, queryParams, customConfig);

const PATCH = <T>(
  endPoint: string,
  data: Record<string, unknown>,
  queryParams: Record<string, unknown> | undefined = undefined,
  customConfig?: AxiosRequestConfig
): Observable<T> =>
  apiCall<T>("PATCH", endPoint, data, queryParams, customConfig);

export { GET, POST, PUT, DELETE, PATCH, setBearerToken, removeBearerToken };
