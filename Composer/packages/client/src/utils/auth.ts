// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/camelcase */
import querystring from 'query-string';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import formatMessage from 'format-message';

import { USER_TOKEN_STORAGE_KEY, BASEURL } from '../constants';
import { Dispatcher } from '../recoilModel/dispatchers';

import storage from './storage';
import httpClient from './httpUtil';

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

export function prepareAxios({ setUserSessionExpired }: Dispatcher) {
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
          setUserSessionExpired(true);
        }

        return Promise.reject(err);
      }
    );
  }
}

const MAX_WAIT = 1000 * 60 * 2; // 2 minutes

export async function loginPopup(): Promise<string | null> {
  const windowLoc = window.location;

  return new Promise((resolve) => {
    const loginUrl = BASEURL + `/login?${querystring.stringify({ resource: windowLoc.pathname + windowLoc.search })}`;

    /**
     * window.innerWidth displays browser window"s height and width excluding toolbars
     */
    const width = window.innerWidth || document.body.clientWidth;
    const height = window.innerHeight || document.body.clientHeight;
    const left = width / 2 - 483 / 2 + window.screenX;
    const top = height / 2 - 600 / 2 + window.screenY;

    // loginUrl is not user-generated
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const popup = window.open(
      loginUrl,
      formatMessage('Login to Composer'),
      `width=483, height=600, top=${top}, left=${left}`
    );

    // if popups are blocked, use a redirect flow
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      windowLoc.replace(loginUrl);

      resolve(null);
      return;
    }

    popup.focus();

    /**
     * Start an interval to check the url fragment to see if it includes an access token.
     * If a token is found, resolve with it.
     * If the popup is out of scope, clear the interval and resolve with null.
     * if the max timeout is reached, clear the interval and resolve with null.
     */
    const startTime = Date.now();
    const popupTimer = setInterval(() => {
      try {
        if (popup) {
          if (popup.location.href.includes(windowLoc.hostname)) {
            const { access_token, error } = querystring.parse(popup.location.hash);

            if (access_token) {
              popup.close();
              clearInterval(popupTimer);
              const token = Array.isArray(access_token) ? access_token[0] : access_token;
              storage.set(USER_TOKEN_STORAGE_KEY, token);
              resolve(token);
            } else if (error) {
              resolve(null);
            }
          }
        } else {
          // clear the interval if there is no popup to inspect.
          clearInterval(popupTimer);
          resolve(null);
        }
      } catch (e) {
        // Ignore the cross-domain errors thrown by trying to access a window not on our domain
      }

      // wait for MAX_WAIT and then clean up -- maybe user stalled?
      if (Date.now() - startTime >= MAX_WAIT) {
        if (popup) popup.close();
        clearInterval(popupTimer);
        resolve(null);
      }
    }, 1);
  });
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
