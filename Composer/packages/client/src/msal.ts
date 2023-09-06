// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as msal from '@azure/msal-browser';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import jwtDecode from 'jwt-decode';

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

// copied from utils/auth.js to fix imports when building
function decodeToken(token: string) {
  try {
    return jwtDecode<any>(token);
  } catch (err) {
    console.error('decode token error in ', err);
    return null;
  }
}

const getTokenFromStorage = async (count: number) => {
  if (count > 2) {
    console.log("couldn't find token");
    return '';
  }

  const token = localStorage.getItem('composer:accessToken')?.slice(1, -1);
  if (token === '' || token === undefined) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return await getTokenFromStorage(count + 1);
  }

  const decoded = decodeToken(token);
  const expiry = decoded.exp * 1000;
  if (Date.now() >= expiry) {
    const newToken = await getToken();
    localStorage.setItem('composer:accessToken', newToken);
    return newToken;
  }
  return token;
};

const tokenHeader = async (config: AxiosRequestConfig) => {
  console.log('running token');
  if (config.baseURL?.startsWith('/api') || config.url?.startsWith('/api')) {
    const token = await getTokenFromStorage(0);

    // eslint-disable-next-line no-underscore-dangle
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

console.log('adding interceptor');
export const addAxiosInterceptor = (axios: AxiosInstance) => axios.interceptors.request.use(tokenHeader);
