// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Axios, { AxiosRequestConfig } from 'axios';

export * from 'axios';

const csrfInterceptor = (config: AxiosRequestConfig) => {
  if (config.baseURL?.startsWith('/api') || config.url?.startsWith('/api')) {
    // eslint-disable-next-line no-underscore-dangle
    config.headers['X-CSRF-Token'] = (window as any).__csrf__;
  }
  return config;
};

const instance = Axios.create() ?? Axios;

instance.interceptors.request.use(csrfInterceptor);

export const axios = instance;

export const createAxios: typeof Axios.create = (...args) => {
  const axiosInstance = Axios.create(...args) ?? Axios;
  axiosInstance.interceptors.request.use(csrfInterceptor);
  return axiosInstance;
};
