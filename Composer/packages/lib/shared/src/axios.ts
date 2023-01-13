// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export * from 'axios';

const csrfInterceptor = (config: AxiosRequestConfig) => {
  if (config.baseURL?.startsWith('/api') || config.url?.startsWith('/api')) {
    // eslint-disable-next-line no-underscore-dangle
    config.headers['X-CSRF-Token'] = ((window as unknown) as { __csrf__: string }).__csrf__;
  }
  return config;
};

export const addCSRFInterceptor = (instance: AxiosInstance) => instance?.interceptors.request.use(csrfInterceptor);

export const createAxios: typeof Axios.create = (...args) => {
  const axiosInstance = Axios.create(...args);
  addCSRFInterceptor(axiosInstance);
  return axiosInstance;
};

export const axios = createAxios();
