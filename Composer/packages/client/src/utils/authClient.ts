/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters, AzureTenant } from '@botframework-composer/types';

import { authConfig } from '../constants';

import {
  getTokenFromCache,
  createPopupWindow,
  monitorWindowForQueryParam,
  createHiddenIframe,
  getIdTokenUrl,
  getAccessTokenUrl,
  isTokenExpired,
  cleanTokenFromCache,
  removeTenantFromCache,
  setTokenInCache,
} from './auth';
import { isElectron } from './electronUtil';
import storage from './storage';

let idToken = getTokenFromCache('idToken');
// eslint-disable-next-line no-underscore-dangle
const fetchHeaders = { 'X-CSRF-Token': window.__csrf__ };

async function getAccessToken(options: AuthParameters): Promise<string> {
  const { targetResource = '', scopes = [] } = options;
  try {
    if (isElectron()) {
      let url = '/api/auth/getAccessToken?';
      const params = new URLSearchParams();
      if (targetResource) {
        params.append('targetResource', targetResource);
      }
      url += params.toString();
      const result = await fetch(url, { method: 'GET', headers: fetchHeaders });
      const { accessToken = '' } = await result.json();
      return accessToken;
    } else if (authConfig.clientId && authConfig.redirectUrl && authConfig.tenantId) {
      // get access token from cache
      const key = authConfig.clientId + JSON.stringify(scopes);
      let token = getTokenFromCache(key);
      if (token && !isTokenExpired(token)) {
        return token;
      }

      // get id token
      if (!idToken) {
        // pop up window if token not exist
        const popup = createPopupWindow(
          getIdTokenUrl({ clientId: authConfig.clientId, redirectUrl: authConfig.redirectUrl }),
        );
        if (popup) {
          idToken = await monitorWindowForQueryParam(popup, 'id_token', authConfig.redirectUrl);
          storage.set('idToken', idToken || '');
        }
      } else if (isTokenExpired(idToken)) {
        // refresh idToken
        const notDisplayFrame = createHiddenIframe(
          getIdTokenUrl({ clientId: authConfig.clientId, redirectUrl: authConfig.redirectUrl }),
        );
        idToken =
          notDisplayFrame.contentWindow &&
          (await monitorWindowForQueryParam(notDisplayFrame.contentWindow, 'id_token', authConfig.redirectUrl));
        storage.set('idToken', idToken || '');
      }

      // use id token to get access token
      if (typeof idToken === 'string') {
        const notDisplayFrame = createHiddenIframe(
          getAccessTokenUrl({ clientId: authConfig.clientId, redirectUrl: authConfig.redirectUrl, scopes: scopes }),
        );
        token =
          notDisplayFrame.contentWindow &&
          (await monitorWindowForQueryParam(notDisplayFrame.contentWindow, 'access_token', authConfig.redirectUrl));
        notDisplayFrame.remove();
        // update cache
        storage.set(key, token);
        return token || '';
      }

      return '';
    }
    return '';
  } catch (e) {
    // error handling
    console.error('Did not receive an access token back from the server: ', e);
    return '';
  }
}

async function logOut() {
  // clean tenantId cache
  removeTenantFromCache();
  cleanTokenFromCache('accessToken');
  cleanTokenFromCache('graphToken');
  if (isElectron()) {
    const url = '/api/auth/logOut';
    const result = await fetch(url, { method: 'GET', headers: fetchHeaders });
    return result.ok;
  } else if (authConfig.clientId) {
    // clean token cache in storage
    cleanTokenFromCache('idToken');
    cleanTokenFromCache(authConfig.clientId);
    return true;
  }
  return true;
}

/**
 * Will retrieve an ARM token for the desired Azure tenant.
 * NOTE: Should call getTenants() beforehand to retrieve a list of
 * available tenants.
 * @param tenantId The Azure tenant to get an ARM token for
 */
async function getARMTokenForTenant(tenantId: string): Promise<string> {
  const options = {
    method: 'GET',
    headers: fetchHeaders,
  };
  // do we have a valid token in the cache for this tenant?
  if (getTokenFromCache(`token-${tenantId}`)) {
    return getTokenFromCache(`token-${tenantId}`);
  } else {
    const result = await fetch(`/api/auth/getARMTokenForTenant?tenantId=${tenantId}`, options);
    if (result.status >= 400) {
      const data = await result.json();
      throw new Error(data.error?.diagnostics?.description || 'get ARM token failure');
    } else {
      const { accessToken = '' } = await result.json();
      // cache the token so we don't overrequest it.
      setTokenInCache(`token-${tenantId}`, accessToken);
      return accessToken;
    }
  }
}

/**
 * Will log the user into ARM and return a list of available Azure tenants for the user.
 * This should then be used to display the list of tenants in the UI, allowing the user
 * to select a tenant. The selected tenant ID should then be passed to getARMTokenForTenant()
 * to get an ARM token for reading / writing Azure resources in that tenant.
 */
async function getTenants(): Promise<AzureTenant[]> {
  const options = {
    method: 'GET',
    headers: fetchHeaders,
  };

  const result = await fetch('/api/auth/getTenants', options);
  const { tenants = [] } = await result.json();
  return tenants;
}

async function getAccount() {
  if (isElectron()) {
    const result = await fetch('/api/auth/getAccount', { method: 'GET', headers: fetchHeaders });
    const { account = {} } = await result.json();
    return account;
  }
  return {};
}

export const AuthClient = {
  getAccessToken,
  getARMTokenForTenant,
  getTenants,
  logOut,
  getAccount,
};
