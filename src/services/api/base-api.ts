import Axios, { AxiosError, type AxiosRequestConfig, type Method } from "axios";
import { Observable } from "rxjs";
import queryString from "query-string";

import { AUTH_RESPONSE } from "@/constants/storage";

import store from "@/app/redux/store";
import storage from "../storage/local-storage";
import { authActions } from "../../app/redux/authSlice";
import { BASE_URL } from "@/constants/api";
import type {
  AuthenticationResponse,
  RefreshTokenResponse,
} from "@/models/auth";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

const REFRESH_TOKEN_ENDPOINT = "/user/refreshtoken";

declare module "axios" {
  export interface AxiosRequestConfig {
    isPublic?: boolean;
  }
}

interface FailedRequestHandler {
  // eslint-disable-next-line @typescript-eslint/ban-types
  resolve: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  reject: Function;
}

const axiosInstance = Axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  if (!config.isPublic) {
    const authDetails = storage.get(AUTH_RESPONSE);
    if (authDetails?.token) {
      config.headers["Authorization"] = `Bearer ${authDetails.token}`;
    }
  } else {
    // Remove any Authorization if it exists globally
    delete config.headers["Authorization"];
  }
  return config;
});

let isRefreshing = false;
let failedRequestHandlers: FailedRequestHandler[] = [];

//  eslint-disable-next-line
axiosInstance.defaults.headers.common["Content-Type"] = "application/json";
//  eslint-disable-next-line
axiosInstance.defaults.headers.common.Accept = "application/json";

const setBearerToken = (token: string): void => {
  //  eslint-disable-next-line
  // axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: any) => {
  failedRequestHandlers.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedRequestHandlers = [];
};

// Handle refresh token
/* eslint-disable */
axiosInstance.interceptors.response.use(
  (response) => response,
  (err) => {
    const originalRequest = err.config;

    if (
      (err.response.status === 403 || err.response.status === 401) &&
      !originalRequest._retry
    ) {
      handleUnauthorizedKickOut();

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedRequestHandlers.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return Axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const authDetails: AuthenticationResponse = storage.get(AUTH_RESPONSE);

      return new Promise(function (resolve, reject) {
        axiosInstance
          .get<RefreshTokenResponse>(
            `${REFRESH_TOKEN_ENDPOINT}?refreshToken=${
              storage.get(AUTH_RESPONSE).refreshToken
            }`
          )
          .then(({ data }) => {
            storage.set(AUTH_RESPONSE, {
              ...authDetails,
              token: data.bearerToken,
            });
            axiosInstance.defaults.headers.common["Authorization"] =
              "Bearer " + data.bearerToken;
            originalRequest.headers["Authorization"] =
              "Bearer " + data.bearerToken;
            processQueue(null, data.bearerToken);
            resolve(Axios(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            handleUnauthorizedKickOut();
            reject(err);
          })
          .then(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(err);
  }
);
/* eslint-enable */

const removeBearerToken = (): void => {
  //  eslint-disable-next-line
  delete axiosInstance.defaults.headers.common.Authorization;
};

export const handleUnauthorizedKickOut = () => {
  store.dispatch(authActions.logoutUser());
  storage.remove(AUTH_RESPONSE);

  window.location.href = "/login";
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
