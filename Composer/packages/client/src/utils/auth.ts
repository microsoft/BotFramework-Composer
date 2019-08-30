import querystring from 'query-string';
import axios from 'axios';

import { USER_TOKEN_STORAGE_KEY, BASEURL } from '../constants';

import storage from './storage';

export function prepareAxios() {
  const cancelSource = axios.CancelToken.source();

  axios.interceptors.request.use(config => {
    config.cancelToken = cancelSource.token;

    const token = getUserToken();
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
        cancelSource.cancel('Unauthorized access.');
        // TODO: set up store to display unauthorized page and ask use to log in again
        console.error('Unauthorized Access.');
      }
    }
  );
}

export function getUserToken(): string | null {
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

export async function loginUser() {
  if (getUserToken() || !process.env.COMPOSER_REQUIRE_AUTH) {
    return;
  }

  const loginUrl =
    BASEURL + `/login?${querystring.stringify({ reource: window.location.pathname + window.location.search })}`;

  window.location.replace(loginUrl);
}
