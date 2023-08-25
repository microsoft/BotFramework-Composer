// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as msal from '@azure/msal-browser';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// const instance = 'https://beebotaiqatb2c.b2clogin.com/';
// const clientId = 'be67666f-387f-400c-b320-3f0bbcf0b5a8';
// const tenantName = 'beebotaiqatb2c.onmicrosoft.com';
// const signUpSignInPolicy = 'B2C_1_SignIn';

const instance = 'https://beebotaiuatb2c.b2clogin.com/';
const clientId = '4ff50f6a-23bc-412b-a54f-4c96deac5fa3';
const tenantName = 'beebotaiuatb2c.onmicrosoft.com';
const signUpSignInPolicy = 'B2C_1_SignIn';
export const newMsalConfig: msal.Configuration = {
  auth: {
    clientId: clientId,
    authority: `${instance}tfp/${tenantName}/${signUpSignInPolicy}`,
    redirectUri: window.origin,
    postLogoutRedirectUri: window.origin,
    knownAuthorities: [`${instance}tfp/${tenantName}`, 'beebotaiuatb2c.b2clogin.com'],
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
};

export const isAuthenticated = () => {
  const account = msalApplication.getAllAccounts()[0];
  return account !== null && account !== undefined;
};

export const msalApplication = new msal.PublicClientApplication(newMsalConfig);

export const getToken = async () => {
  const msal = msalApplication;
  const account = msal.getAllAccounts()[0];
  if (account === undefined) {
    console.log('found no account');
    console.trace();
  }
  const result = await msal.acquireTokenSilent({
    account: account,
    scopes: [`https://beebotaiuatb2c.onmicrosoft.com/4ff50f6a-23bc-412b-a54f-4c96deac5fa3/Backend`],
  });

  return result.accessToken;
};

const tokenHeader = async (config: AxiosRequestConfig) => {
  console.log('running token');
  if (config.baseURL?.startsWith('/api') || config.url?.startsWith('/api')) {
    const token = await getToken();

    // eslint-disable-next-line no-underscore-dangle
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

console.log('adding interceptor');
export const addAxiosInterceptor = (axios: AxiosInstance) => axios.interceptors.request.use(tokenHeader);
