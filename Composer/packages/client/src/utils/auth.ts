import querystring from 'query-string';

import { USER_TOKEN_STORAGE_KEY } from '../constants';

import { ClientStorage } from './storage';
const AuthStorage = new ClientStorage(window.sessionStorage);

export function getUserToken(): string | null {
  // first see if there is a token in the hash
  const { token } = querystring.parse(location.hash);

  if (token && token.length > 0) {
    const hashToken = Array.isArray(token) ? token[0] : token;
    AuthStorage.set(USER_TOKEN_STORAGE_KEY, hashToken);

    return hashToken;
  }

  // next checkt to see if we have a token in session storage
  const sessionToken = AuthStorage.get<string>(USER_TOKEN_STORAGE_KEY);

  if (sessionToken && sessionToken.length > 0) {
    return sessionToken;
  }

  // if token not found in the hash or session storage, set it to null
  return null;
}
