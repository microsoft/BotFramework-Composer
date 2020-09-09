// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { randomBytes } from 'crypto';

import { BrowserWindow } from 'electron';

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
  const { clientId, redirectUri, scopes = [] } = options;
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
  const { clientId, idToken, redirectUri, scopes = [] } = options;
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

async function createAccessTokenWindow(url: string): Promise<string> {
  const tokenWindow = new BrowserWindow({ width: 400, height: 600, show: false });
  const waitingForAccessToken = monitorWindowForQueryParam(tokenWindow, 'access_token');
  tokenWindow.loadURL(url);
  return waitingForAccessToken;
}

async function createLoginWindow(url: string): Promise<string> {
  const loginWindow = new BrowserWindow({ width: 400, height: 600, show: true });
  const waitingForIdToken = monitorWindowForQueryParam(loginWindow, 'id_token');
  loginWindow.loadURL(url);
  return waitingForIdToken;
}

/** Will wait until the specified window redirects to a URL starting with bfcomposer://oauth,
 *  and then resolve with the desired parameter value or reject with an error message.
 *
 *  @param window The Electron browser window to monitor for redirect events
 *  @param queryParam The query string parameter to be ripped off the final URL after all redirects are finished
 */
async function monitorWindowForQueryParam(window: BrowserWindow, queryParam: string): Promise<string> {
  return new Promise((resolve, reject) => {
    window.webContents.on('will-redirect', (event, redirectUrl) => {
      if (redirectUrl.startsWith(composerRedirectUri)) {
        // We have reached the end of the oauth flow; don't actually complete the redirect.
        // Just rip the desired parameters from the url and close the window.
        event.preventDefault();
        const parsedUrl = new URL(redirectUrl.replace('#', '?'));
        const param = parsedUrl.searchParams.get(queryParam);
        if (param) {
          window.close();
          resolve(param);
        }
        const error = parsedUrl.searchParams.get('error');
        const errorDescription = parsedUrl.searchParams.get('error_description');
        if (error || errorDescription) {
          window.close();
          reject({ error, errorDescription });
        }
        reject({ error: `Unknown error retrieving ${param} from OAuth window` });
      }
    });
  });
}

/**
 * Logs the user in using the OAuth implicit flow and returns an id token
 *
 * @param id Internal id used by Composer to route the OAuth response back to the client that it originated from
 * @returns An object containing the id token and the id of the OAuth client that originated the request
 */
export async function loginAndGetIdToken(options: OAuthLoginOptions): Promise<string> {
  const loginUrl = getLoginUrl(options);
  const res = await createLoginWindow(loginUrl);
  return res;
}

/**
 * Uses an id token to request an access token on behalf of the user and returns token
 *
 * @param id Internal id used by Composer to route the OAuth response back to the client that it originated from
 * @returns An object containing the access token and the id of the OAuth client that originated the request
 */
export async function getAccessToken(options: OAuthTokenOptions): Promise<string> {
  const tokenUrl = getAccessTokenUrl(options);
  const res = await createAccessTokenWindow(tokenUrl);
  return res;
}
