import { ElectronContext, useElectronContext } from '../utility/electronContext';
import { isElectron } from '../utility/isElectron';
import logger from '../logger';

const log = logger.extend('electron-auth-provider');

abstract class AuthProvider {
  constructor(protected config: OAuthConfig) {}

  abstract async getAccessToken(options: OAuthOptions): Promise<string>;
}

type TokenRecord = {
  expiryTime: number;
  accessToken: string;
};

type TokenCache = {
  [credentials: string]: TokenRecord | undefined;
};

export type OAuthOptions = {
  clientId: string;
  /** ID of the resource to fetch an access token for -- can either be a URI (https://graph.microsoft.com) or a <guid>[/scope] (abc-123-456) */
  targetResource?: string;
  scopes: string[];
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

  async getAccessToken(options: OAuthOptions): Promise<string> {
    const { getAccessToken } = this.electronContext;
    const { targetResource = '' } = options;

    if (process.platform === 'linux') {
      log('Auth login flow is currently unsupported in Linux.');
      return '';
    }

    log('Getting access token.');

    // try to get a cached token
    const cachedToken = this.getCachedToken(options);
    if (!!cachedToken && Date.now() <= cachedToken.expiryTime.valueOf()) {
      log('Returning cached token.');
      return cachedToken.accessToken;
    }

    try {
      // otherwise get a fresh token
      log('Did not find cached token. Getting fresh token.');
      const { accessToken, acquiredAt, expiryTime } = await getAccessToken({ target: targetResource });
      this.cacheTokens({ accessToken, acquiredAt, expiryTime }, options);

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

  private getCachedToken(options: OAuthOptions): TokenRecord | undefined {
    const tokenHash = this.getTokenHash(options);
    const cachedToken = this.tokenCache[tokenHash];
    return cachedToken;
  }

  private cacheTokens(
    tokenInfo: { accessToken: string; acquiredAt: number; expiryTime: number },
    options: OAuthOptions
  ): void {
    const { accessToken, acquiredAt, expiryTime } = tokenInfo;
    const tokenHash = this.getTokenHash(options);
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
    setTimeout(() => this.refreshAccessToken(options), timeUntilRefresh);
  }

  private async refreshAccessToken(options: OAuthOptions) {
    log('Refreshing access token...');
    const { getAccessToken } = this.electronContext;
    const { targetResource = '' } = options;
    const cachedToken = this.tokenCache[this.getTokenHash(options)];
    if (!!cachedToken) {
      const { accessToken, acquiredAt, expiryTime } = await getAccessToken({ target: targetResource });
      this.cacheTokens({ accessToken, acquiredAt, expiryTime }, options);
      log('Access token refreshed.');
    }
  }

  private getTokenHash(options: OAuthOptions): string {
    return options.targetResource || '';
  }
}

class WebAuthProvider extends AuthProvider {
  constructor(config: OAuthConfig) {
    super(config);
  }

  // TODO (toanzian / ccastro): implement
  async getAccessToken(options: OAuthOptions): Promise<string> {
    throw new Error(
      'WebAuthProvider has not been implemented yet. Implicit auth flow currently only works in Electron.'
    );
  }
}

class AuthService {
  private provider: AuthProvider;

  constructor() {
    if (isElectron) {
      // desktop scenario
      this.provider = new ElectronAuthProvider({ redirectUri: 'bfcomposer://oauth' });
    } else {
      // hosted / web scenario
      this.provider = new WebAuthProvider({ redirectUri: 'bfcomposer://oauth' });
    }
  }

  async getAccessToken(options: OAuthOptions): Promise<string> {
    return this.provider.getAccessToken(options);
  }
}

export const authService = new AuthService();
