import querystring from 'query-string';
import axios from 'axios';
import formatMessage from 'format-message';

import { USER_TOKEN_STORAGE_KEY, BASEURL, ActionTypes } from '../constants';
import { Store } from '../store/types';

import storage from './storage';

export function prepareAxios(store: Store) {
  const cancelSource = axios.CancelToken.source();

  axios.interceptors.request.use(config => {
    config.cancelToken = cancelSource.token;

    const token = getUserTokenFromCache();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    res => {
      return res;
    },
    err => {
      if (err.response && err.response.status === 401) {
        // cancel all other requests
        cancelSource.cancel('Unauthorized');

        // remove user token from the cache
        clearUserTokenFromCache();

        store.dispatch({
          type: ActionTypes.USER_SESSION_EXPIRED,
        });

        let payload = {
          summary: formatMessage('Unauthorized'),
          message: formatMessage('Try logging in again.'),
        };

        if (err.response.data.error === 'Session expired') {
          payload = {
            summary: formatMessage('Session Expired'),
            message: formatMessage('Try logging in again.'),
          };
        }

        store.dispatch({
          type: ActionTypes.SET_ERROR,
          payload,
        });
      }

      return Promise.reject(err);
    }
  );
}

export function getUserTokenFromCache(): string | null {
  // first see if there is a token in the hash
  const { access_token } = querystring.parse(location.hash);

  if (access_token && access_token.length > 0) {
    const hashToken = Array.isArray(access_token) ? access_token[0] : access_token;
    storage.set(USER_TOKEN_STORAGE_KEY, hashToken);
    location.hash = '';

    return hashToken;
  }

  // next check to see if we have a token in session storage
  const sessionToken = storage.get<string>(USER_TOKEN_STORAGE_KEY);

  if (sessionToken && sessionToken.length > 0) {
    return sessionToken;
  }

  // if token not found in the hash or session storage, set it to null
  return null;
}

export function clearUserTokenFromCache(): void {
  storage.remove(USER_TOKEN_STORAGE_KEY);
}

const MAX_WAIT = 1000 * 60; // 1 minute

export async function refreshTokenPopup(): Promise<string | null> {
  return new Promise(resolve => {
    const loginUrl = BASEURL + `/login?${querystring.stringify({ reource: '/' })}`;

    /**
     * adding winLeft and winTop to account for dual monitor
     * using screenLeft and screenTop for IE8 and earlier
     */
    const winLeft = window.screenLeft ? window.screenLeft : window.screenX;
    const winTop = window.screenTop ? window.screenTop : window.screenY;
    /**
     * window.innerWidth displays browser window"s height and width excluding toolbars
     * using document.documentElement.clientWidth for IE8 and earlier
     */
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const left = width / 2 - 483 / 2 + winLeft;
    const top = height / 2 - 600 / 2 + winTop;

    const popup = window.open(loginUrl, 'Login to Composer', `width=483, height=600, top=${top}, left=${left}`);

    const startTime = Date.now();
    const popupTimer = setInterval(() => {
      try {
        if (popup) {
          if (popup.location.href.includes(window.location.hostname)) {
            const { access_token } = querystring.parse(popup.location.hash);

            if (access_token) {
              popup.close();
              clearInterval(popupTimer);
              storage.set(USER_TOKEN_STORAGE_KEY, access_token);
              const token = Array.isArray(access_token) ? access_token[0] : access_token;
              resolve(token);
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
