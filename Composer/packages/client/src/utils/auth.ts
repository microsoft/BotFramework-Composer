// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/camelcase */
import querystring from 'query-string';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

import { USER_TOKEN_STORAGE_KEY, BASEURL, ActionTypes } from '../constants';
import { Store } from '../store/types';

import storage from './storage';
import httpClient from './httpUtil';
import { AuthClient } from './authClient';

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);

    return decoded.exp * 1000 <= Date.now();
  } catch (e) {
    // if we can't decode the token, just act as if it were expired.
    return true;
  }
}

export function clearUserTokenFromCache(): void {
  storage.remove(USER_TOKEN_STORAGE_KEY);
}

export function getUserTokenFromCache(): string | null {
  let token: string | null = null;

  // first see if there is a token in the hash
  const { access_token } = querystring.parse(location.hash);

  if (access_token && access_token.length > 0) {
    location.hash = '';
    token = Array.isArray(access_token) ? access_token[0] : access_token;
  }

  // next check to see if we have a token in session storage
  if (!token) {
    const sessionToken = storage.get<string>(USER_TOKEN_STORAGE_KEY);

    if (sessionToken && sessionToken.length > 0) {
      token = sessionToken;
    }
  }

  // return the token only if it is not expired
  if (token && !isTokenExpired(token)) {
    storage.set(USER_TOKEN_STORAGE_KEY, token);
    return token;
  } else {
    clearUserTokenFromCache();
    return null;
  }
}

export function prepareAxios(store: Store) {
  if (process.env.COMPOSER_REQUIRE_AUTH) {
    const cancelSource = axios.CancelToken.source();

    httpClient.interceptors.request.use((config) => {
      // only attach cancellation token to api requests
      if (config.url && config.url.includes('/api/')) {
        config.cancelToken = cancelSource.token;
      }

      const token = getUserTokenFromCache();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    httpClient.interceptors.response.use(
      (res) => {
        return res;
      },
      (err) => {
        if (err.response && err.response.status === 401) {
          // cancel all other requests
          cancelSource.cancel('Unauthorized');

          // remove user token from the cache
          clearUserTokenFromCache();

          store.dispatch({
            type: ActionTypes.USER_SESSION_EXPIRED,
            payload: { expired: true },
          });
        }

        return Promise.reject(err);
      }
    );
  }
}

const MAX_WAIT = 1000 * 60 * 10; // 10 minutes

let authClient: AuthClient;
const graph = 'https://graph.microsoft.com/User.Read';
const arm = 'https://management.azure.com/user_impersonation';

export async function loginPopup(url = '', callbackUrl = ''): Promise<string | undefined> {
  if (!authClient) {
    // TODO: tenant id, client id and redirect url should come from settings, not hardcoded
    authClient = new AuthClient(
      '9d248250-ec90-4fa9-b0c9-4d3baf9bd223',
      '284e2bc8-b2ca-428a-bfc5-2f9c9718c170',
      'http://localhost:3000/oauth',
      [arm, graph]
    );
  }

  const armToken = await authClient.getToken([arm]);
  const graphToken = await authClient.getToken([graph]);

  // setAccessToken(armToken);
  // setGraphToken(graphToken);
  // Test code: Graph - get my user profile
  // let headers = new Headers();
  // let bearer = 'Bearer ' + graphToken;
  // headers.append('Authorization', bearer);
  // let options = {
  //   method: 'GET',
  //   headers: headers,
  // };
  // let graphEndpoint = 'https://graph.microsoft.com/v1.0/me';

  // fetch(graphEndpoint, options)
  //   .then((resp) => resp.json())
  //   .then((resp) => {
  //     console.log('Got graph response ', resp);
  //   });

  // // Test code: ARM - get my tenant's subscriptions
  // headers = new Headers();
  // bearer = 'Bearer ' + armToken;
  // headers.append('Authorization', bearer);
  // options = {
  //   method: 'GET',
  //   headers: headers,
  // };
  // graphEndpoint = 'https://management.azure.com/subscriptions?api-version=2020-01-01';

  // fetch(graphEndpoint, options)
  //   .then((resp) => resp.json())
  //   .then((resp) => {
  //     console.log('Got arm response ', resp);
  //     //do something with response
  //   });
  return;
}

export async function refreshToken(): Promise<string> {
  const windowLoc = window.location;

  const loginUrl = BASEURL + `/login?${querystring.stringify({ resource: windowLoc.pathname + windowLoc.search })}`;

  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.src = loginUrl;
    iframe.style.display = 'none';

    document.body.append(iframe);

    const startTime = Date.now();
    const iframeTimer = setInterval(() => {
      try {
        if (iframe) {
          if (iframe.contentWindow && iframe.contentWindow.location.href.includes(windowLoc.hostname)) {
            const { access_token } = querystring.parse(iframe.contentWindow.location.hash);

            if (access_token) {
              iframe.remove();
              clearInterval(iframeTimer);
              const token = Array.isArray(access_token) ? access_token[0] : access_token;
              storage.set(USER_TOKEN_STORAGE_KEY, token);
              resolve(token);
            }
          }
        } else {
          clearInterval(iframeTimer);
          reject();
        }
      } catch (e) {
        // Ignore the cross-domain errors thrown by trying to access a window not on our domain
      }

      // wait for MAX_WAIT and then clean up -- maybe user stalled?
      if (Date.now() - startTime >= MAX_WAIT) {
        if (iframe) iframe.remove();
        clearInterval(iframeTimer);
        reject(null);
      }
    }, 1);
  });
}

export const getAccessTokenInCache = () => {
  return window.localStorage.getItem('access_token');
};

export const setAccessToken = (value: any) => {
  window.localStorage.setItem('access_token', value);
};

export const setGraphToken = (value: any) => {
  window.localStorage.setItem('graph_token', value);
};
