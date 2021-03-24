// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';

import logger from '../../logger';
import { ElectronContext, useElectronContext } from '../../utility/electronContext';
import { isLinux } from '../../utility/platform';

import { AuthConfig, AuthProvider } from './authProvider';

const log = logger.extend('electron-auth-provider');

type TokenRecord = {
  expiryTime: number;
  accessToken: string;
};

type TokenCache = Record<string, TokenRecord>;

export class ElectronAuthProvider extends AuthProvider {
  private _electronContext: ElectronContext | undefined;
  private tokenRefreshFactor = 0.65; // refresh the token after 75% of the expiry time has passed
  private tokenCache: TokenCache;

  constructor(config: AuthConfig) {
    super(config);
    this.tokenCache = {};
    log('Initialized.');
  }

  async getAccessToken(params: AuthParameters): Promise<string> {
    const { getAccessToken } = this.electronContext;
    const { targetResource = '' } = params;

    if (isLinux()) {
      log('Auth login flow is currently unsupported in Linux.');
      return '';
    }

    log('Getting access token.');

    // try to get a cached token
    const cachedToken = this.getCachedToken(params);
    if (!!cachedToken && Date.now() <= cachedToken.expiryTime.valueOf()) {
      log('Returning cached token.');
      return cachedToken.accessToken;
    }

    try {
      // otherwise get a fresh token
      log('Did not find cached token. Getting fresh token.');
      const { accessToken, acquiredAt, expiryTime } = await getAccessToken({ targetResource });
      this.cacheTokens({ accessToken, acquiredAt, expiryTime }, params);

      return accessToken;
    } catch (e) {
      log('Error while trying to get access token: %O', e);
      return '';
    }
  }

  async getArmAccessToken(tenantId: string): Promise<string> {
    const { getARMTokenForTenant } = this.electronContext;
    if (isLinux()) {
      log('Auth login flow is currently unsupported in Linux.');
      return '';
    }
    log('Getting ARM access token.');
    try {
      // otherwise get a fresh token
      const token = await getARMTokenForTenant(tenantId);
      return token;
    } catch (e) {
      log('Error while trying to get access token: %O', e);
      return '';
    }
  }

  logOut(): void {
    const { logOut } = this.electronContext;
    logOut();
    // clean all the cache tokens from the same user
    this.tokenCache = {};
  }

  private get electronContext() {
    if (!this._electronContext) {
      this._electronContext = useElectronContext();
    }
    return this._electronContext;
  }

  private getCachedToken(params: AuthParameters): TokenRecord | undefined {
    const tokenHash = this.getTokenHash(params);
    const cachedToken = this.tokenCache[tokenHash];
    return cachedToken;
  }

  private cacheTokens(
    tokenInfo: { accessToken: string; acquiredAt: number; expiryTime: number },
    params: AuthParameters
  ): void {
    const { accessToken, acquiredAt, expiryTime } = tokenInfo;
    if (!accessToken) {
      // oneauth shim returns an empty access token as a result
      return;
    }
    const tokenHash = this.getTokenHash(params);
    const expiresIn = expiryTime - acquiredAt;

    log('Caching token...');

    // cache token
    this.tokenCache[tokenHash] = {
      accessToken,
      expiryTime,
    };

    log('Token cached.');

    // setup timer to refresh token
    const timeUntilRefresh = this.tokenRefreshFactor * expiresIn;
    setTimeout(() => this.refreshAccessToken(params), timeUntilRefresh);
  }

  private async refreshAccessToken(params: AuthParameters) {
    log('Refreshing access token...');
    const { getAccessToken } = this.electronContext;
    const { targetResource = '' } = params;
    const cachedToken = this.tokenCache[this.getTokenHash(params)];
    if (cachedToken) {
      const { accessToken, acquiredAt, expiryTime } = await getAccessToken({ targetResource });
      this.cacheTokens({ accessToken, acquiredAt, expiryTime }, params);
      log('Access token refreshed.');
    }
  }

  private getTokenHash(params: AuthParameters): string {
    return params.targetResource || '';
  }
}
