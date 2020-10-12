// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { randomBytes } from 'crypto';

import { BrowserWindow } from 'electron';

import ElectronWindow from '../electronWindow';

const composerRedirectUri = 'bfcomposer://oauth';
const baseUrl = 'https://login.microsoftonline.com/organizations/';
const implicitEndpoint = 'oauth2/v2.0/authorize';

function parseJwt(token: string) {
  const base64Payload = token.split('.')[1];
  const payload = Buffer.from(base64Payload, 'base64');
  return JSON.parse(payload.toString());
}

function generateNonce(): string {
  return randomBytes(32).toString('base64');
}

function generateState(clientId: string) {
  const state = {
    clientId,
    guid: randomBytes(32).toString('base64'),
    time: Date.now(),
  };
  return JSON.stringify(state);
}

export interface OAuthLoginOptions {
  clientId: string;
  redirectUri: string;
  scopes?: string[];
}

export interface OAuthTokenOptions extends OAuthLoginOptions {
  idToken: string;
}

function getLoginUrl(options: OAuthLoginOptions): string {
  const { clientId, redirectUri = composerRedirectUri } = options;
  const scopes = [...(options.scopes || [])];
  if (scopes.indexOf('openid') === -1) {
    scopes.push('openid');
  }
  if (scopes.indexOf('profile') === -1) {
    scopes.push('profile');
  }
  const params = [
    `client_id=${encodeURIComponent(clientId)}`,
    `response_type=id_token`,
    `redirect_uri=${encodeURIComponent(redirectUri)}`,
    `scope=${encodeURIComponent(scopes.join(' '))}`,
    `response_mode=fragment`,
    `state=${encodeURIComponent(generateState(clientId))}`,
    `nonce=${encodeURIComponent(generateNonce())}`,
  ].join('&');

  const url = `${baseUrl}${implicitEndpoint}?${params}`;
  return url;
}

export function getAccessTokenUrl(options: OAuthTokenOptions): string {
  const { clientId, idToken, redirectUri = composerRedirectUri, scopes = [] } = options;
  const params = [
    `client_id=${encodeURIComponent(clientId)}`,
    `response_type=token`,
    `redirect_uri=${encodeURIComponent(redirectUri)}`,
    `scope=${encodeURIComponent(scopes.join(' '))}`,
    `response_mode=fragment`,
    `state=${encodeURIComponent(generateState(clientId))}`,
    `nonce=${encodeURIComponent(generateNonce())}`,
    `prompt=none`,
  ];
  const jwt = parseJwt(idToken);
  if (jwt.preferred_username) {
    params.push(`login_hint=${encodeURIComponent(jwt.preferred_username)}`);
  }

  const url = `${baseUrl}${implicitEndpoint}?${params.join('&')}`;
  return url;
}

async function createAccessTokenWindow(
  url: string
): Promise<{ accessToken: string; acquiredAt: number; expiresIn: number }> {
  const tokenWindow = new BrowserWindow({ width: 400, height: 600, show: false });
  const waitingForAccessToken = monitorWindowForQueryParams(tokenWindow, ['access_token', 'expires_in']);
  tokenWindow.loadURL(url);
  const { access_token: accessToken, expires_in: expiresIn } = await waitingForAccessToken;
  return { accessToken, acquiredAt: Date.now(), expiresIn: Number(expiresIn) };
}

async function createLoginWindow(url: string): Promise<string> {
  const loginWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: true,
    title: 'Login',
    parent: ElectronWindow.getInstance().browserWindow, // always show login window on top of main app window
  });
  loginWindow.setMenu(null);
  const waitingForIdToken = monitorWindowForQueryParams(loginWindow, ['id_token']);
  loginWindow.loadURL(url);
  const { id_token: idToken } = await waitingForIdToken;
  return idToken;
}

/** Will wait until the specified window redirects to a URL starting with bfcomposer://oauth,
 *  and then resolve with the desired parameter value or reject with an error message.
 *
 *  @param window The Electron browser window to monitor for redirect events
 *  @param queryParams The query string parameters to be ripped off the final URL after all redirects are finished
 */
async function monitorWindowForQueryParams(
  window: BrowserWindow,
  queryParams: string[]
): Promise<{ [paramName: string]: string }> {
  return new Promise((resolve, reject) => {
    const prematureCloseListener = () => {
      reject({ error: 'The window was closed before authentication was complete.' });
    };
    window.addListener('closed', prematureCloseListener);
    window.webContents.on('will-redirect', (event, redirectUrl) => {
      if (redirectUrl.startsWith(composerRedirectUri)) {
        // We have reached the end of the oauth flow; don't actually complete the redirect.
        // Just rip the desired parameters from the url and close the window.
        event.preventDefault();
        const parsedUrl = new URL(redirectUrl.replace('#', '?'));
        const result = {};

        // look for any errors
        const error = parsedUrl.searchParams.get('error');
        const errorDescription = parsedUrl.searchParams.get('error_description');
        if (error || errorDescription) {
          window.removeListener('closed', prematureCloseListener);
          window.close();
          reject({ error, errorDescription });
        }

        // pull desired params off of the url
        for (const paramName of queryParams) {
          const paramVal = parsedUrl.searchParams.get(paramName);
          if (paramVal) {
            result[paramName] = paramVal;
          }
        }

        // clean up the window and return params
        window.removeListener('closed', prematureCloseListener);
        window.close();
        resolve(result);
      }
    });
  });
}

/**
 * Logs the user in using the OAuth implicit flow and returns an id token
 *
 * @param id Internal id used by Composer to route the OAuth response back to the client that it originated from
 * @returns The ID token granted by the login flow
 */
export async function loginAndGetIdToken(options: OAuthLoginOptions): Promise<string> {
  try {
    const loginUrl = getLoginUrl(options);
    const res = await createLoginWindow(loginUrl);
    return res;
  } catch (e) {
    return Promise.reject(`Error getting ID token: ${e}`);
  }
}

/**
 * Uses an id token to request an access token on behalf of the user and returns token
 *
 * @param id Internal id used by Composer to route the OAuth response back to the client that it originated from
 * @returns The access token granted by the login flow
 */
export async function getAccessToken(
  options: OAuthTokenOptions
): Promise<{ accessToken: string; acquiredAt: number; expiresIn: number }> {
  try {
    const tokenUrl = getAccessTokenUrl(options);
    const res = await createAccessTokenWindow(tokenUrl);
    return res;
  } catch (e) {
    return Promise.reject(`Error getting access token: ${e}`);
  }
}
