import { ElectronContext, useElectronContext } from '../utility/electronContext';
import { isElectron } from '../utility/isElectron';

abstract class AuthProvider {
  constructor(protected config: OAuthConfig) {}

  abstract async getAccessToken(options: OAuthOptions): Promise<string>;
}

type TokenRecord = {
  expiryTime: Date;
  accessToken: string;
  idToken: string;
};

type TokenCache = {
  [credentials: string]: TokenRecord | undefined;
};

export type OAuthOptions = {
  clientId: string;
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
  }

  async getAccessToken(options: OAuthOptions): Promise<string> {
    const { getAccessToken, loginAndGetIdToken } = this.electronContext;

    // try to get a cached token
    const cachedToken = this.getCachedToken(options);
    if (!!cachedToken && Date.now() <= cachedToken.expiryTime.valueOf()) {
      console.log('returning cached token');
      return cachedToken.accessToken;
    }

    try {
      // otherwise get a fresh token
      console.log('getting fresh token');
      const idToken = await loginAndGetIdToken(options);
      const { accessToken, acquiredAt, expiresIn } = await getAccessToken({ ...options, idToken });
      this.cacheTokens({ accessToken, acquiredAt, expiresIn, idToken }, options);

      return accessToken;
    } catch (e) {
      // TODO: error handling
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
    tokenInfo: { accessToken: string; acquiredAt: number; expiresIn: number; idToken: string },
    options: OAuthOptions
  ): void {
    const { accessToken, acquiredAt, expiresIn, idToken } = tokenInfo;
    const tokenHash = this.getTokenHash(options);
    const expiresInMs = expiresIn * 1000; // expiresIn is in seconds

    // cache token
    this.tokenCache[tokenHash] = {
      accessToken,
      expiryTime: new Date(acquiredAt + expiresInMs),
      idToken,
    };

    // setup timer to refresh token
    const timeUntilRefresh = this.tokenRefreshFactor * expiresInMs;
    setTimeout(() => this.refreshAccessToken(options), timeUntilRefresh);
  }

  private async refreshAccessToken(options: OAuthOptions) {
    console.log('refreshing token...');
    const { getAccessToken } = this.electronContext;
    const cachedToken = this.tokenCache[this.getTokenHash(options)];
    if (!!cachedToken) {
      const { accessToken, acquiredAt, expiresIn } = await getAccessToken({ ...options, idToken: cachedToken.idToken });
      this.cacheTokens({ accessToken, acquiredAt, expiresIn, idToken: cachedToken.idToken }, options);
    }
  }

  private getTokenHash(options: OAuthOptions): string {
    return `${options.clientId}#${options.scopes.join('')}`;
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
