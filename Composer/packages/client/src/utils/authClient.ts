// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';
import { isElectron } from './electronUtil';
import { Logger, UserAgentApplication, LogLevel } from 'msal';
import { authConfig } from '../constants';

const msal = new UserAgentApplication({
  auth: {
    authority: `https://login.microsoftonline.com/${authConfig.tenantId}/`,
    clientId: authConfig.clientId,
    redirectUri: authConfig.redirectUrl,
  },
  cache: {
    storeAuthStateInCookie: false,
  },
  system: {
    logger: new Logger((level, message, containsPii) => {
      if (containsPii) {
        return;
      }
      switch (level) {
        case LogLevel.Error:
          console.error(message);
          return;
        case LogLevel.Info:
          console.info(message);
          return;
        case LogLevel.Verbose:
          console.debug(message);
          return;
        case LogLevel.Warning:
          console.warn(message);
          return;
      }
    }),
    loadFrameTimeout: 10000,
  },
});

function setInSessionStorage(key: string, value: string) {
  sessionStorage.setItem(key, value);
}

function getInSessionStorage(key: string) {
  return sessionStorage.getItem(key);
}

async function getAccessToken(options: AuthParameters): Promise<string> {
  const { clientId = '', targetResource = '', scopes = [] } = options;
  if (isElectron()) {
    try {
      const { __csrf__ = '' } = window;

      let url = '/api/auth/getAccessToken?';
      const params = new URLSearchParams();
      if (clientId) {
        params.append('clientId', clientId);
      }
      if (scopes.length) {
        params.append('scopes', JSON.stringify(scopes));
      }
      if (targetResource) {
        params.append('targetResource', targetResource);
      }
      url += params.toString();

      const result = await fetch(url, { method: 'GET', headers: { 'X-CSRF-Token': __csrf__ } });
      const { accessToken = '' } = await result.json();
      setInSessionStorage(targetResource ? targetResource : JSON.stringify(scopes), accessToken);
      return accessToken;
    } catch (e) {
      // error handling
      console.error('Did not receive an access token back from the server: ', e);
      return '';
    }
  } else {
    // User not logged in, perform an interactive login
    const currentRequest = {
      scopes: options.scopes || authConfig.scopes,
    };
    let token = '';
    if (msal.getAccount()) {
      // If the user is already logged in, get the token silently.
      try {
        // User logged in means we can do silent token acquisition with the
        // requested scopes
        const tokenInfo = await msal.acquireTokenSilent(currentRequest);
        token = tokenInfo.accessToken;
      } catch (e) {
        // If token acquisition fails, we fallback to interactive login.
        await msal.loginPopup(currentRequest);
        const tokenInfo = await msal.acquireTokenPopup(currentRequest);
        token = tokenInfo.accessToken;
      }
    } else {
      try {
        // Interactive login should get us an id_token
        await msal.loginPopup({ scopes: authConfig.scopes });

        console.log('start to acquire');
        // Get the token with the specifically requested scopes
        const tokenInfo = await msal.acquireTokenPopup(currentRequest);
        console.log(tokenInfo);
        token = tokenInfo.accessToken;
      } catch (e) {
        console.error('Error encountered during log in: ', e);
        return '';
      }
    }
    setInSessionStorage(targetResource ? targetResource : JSON.stringify(scopes), token);
    return token;
  }
}

export const AuthClient = {
  getAccessToken,
};
