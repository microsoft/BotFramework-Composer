import { v4 as uuid } from 'uuid';
import { AuthParameters } from '@botframework-composer/types';

import { ElectronContext, useElectronContext } from '../utility/electronContext';
import { isElectron } from '../utility/isElectron';
import logger from '../logger';

const log = logger.extend('electron-auth-provider');

abstract class AuthProvider {
  constructor(protected config: OAuthConfig) {}

  abstract async getAccessToken(params: AuthParameters): Promise<string>;
}

type TokenRecord = {
  expiryTime: number;
  accessToken: string;
};

type TokenCache = {
  [credentials: string]: TokenRecord | undefined;
};

type OAuthConfig = {
  redirectUri: string;
};

class ElectronAuthProvider extends AuthProvider {
  private _electronContext: ElectronContext | undefined;
  private tokenRefreshFactor: number = 0.75; // refresh the token after 75% of the expiry time has passed
  private tokenCache: TokenCache;

  constructor(config: OAuthConfig) {
    super(config);
    this.tokenCache = {};
    log('Initialized.');
  }

  async getAccessToken(params: AuthParameters): Promise<string> {
    const { getAccessToken } = this.electronContext;
    const { targetResource = '' } = params;

    if (process.platform === 'linux') {
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
      // TODO: error handling
      log('Error while trying to get access token: %O', e);
      return '';
    }
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
    if (!!cachedToken) {
      const { accessToken, acquiredAt, expiryTime } = await getAccessToken({ targetResource });
      this.cacheTokens({ accessToken, acquiredAt, expiryTime }, params);
      log('Access token refreshed.');
    }
  }

  private getTokenHash(params: AuthParameters): string {
    return params.targetResource || '';
  }
}

class WebAuthProvider extends AuthProvider {
  constructor(config: OAuthConfig) {
    super(config);
  }

  // TODO (toanzian / ccastro): implement
  async getAccessToken(params: AuthParameters): Promise<string> {
    throw new Error(
      'WebAuthProvider has not been implemented yet. Implicit auth flow currently only works in Electron.'
    );
  }
}

class AuthService {
  private provider: AuthProvider;
  private _csrfToken: string;

  constructor() {
    if (isElectron) {
      // desktop scenario
      this.provider = new ElectronAuthProvider({ redirectUri: 'bfcomposer://oauth' });
    } else {
      // hosted / web scenario
      this.provider = new WebAuthProvider({ redirectUri: 'bfcomposer://oauth' });
    }
    // generate anti-csrf token in production environment
    if (process.env.NODE_ENV === 'production') {
      this._csrfToken = uuid();
    } else {
      this._csrfToken = '';
    }
  }

  async getAccessToken(params: AuthParameters): Promise<string> {
    return this.provider.getAccessToken(params);
  }

  get csrfToken(): string {
    return this._csrfToken;
  }
}

export const authService = new AuthService();
