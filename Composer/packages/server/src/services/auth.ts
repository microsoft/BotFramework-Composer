import { ElectronContext, useElectronContext } from '../utility/electronContext';
import { isElectron } from '../utility/isElectron';

abstract class AuthProvider {
  constructor(protected config: OAuthConfig) {}

  abstract async getAccessToken(options: OAuthOptions): Promise<AuthResult>;
}

type AuthResult = {
  accessToken: string;
  idToken?: string; // do we need to return this?
};

export type OAuthOptions = {
  clientId: string;
  scopes: string[];
};

type OAuthConfig = {
  redirectUri: string;
};

class ElectronAuthProvider extends AuthProvider {
  private idToken: string;
  // private idTokenExpiryDate: Date | undefined;
  private accessToken: string;
  // private accessTokenExpiryDate: Date | undefined;
  private _electronContext: ElectronContext | undefined;

  constructor(config: OAuthConfig) {
    super(config);
    this.idToken = '';
    this.accessToken = '';
  }

  async getAccessToken(options: OAuthOptions): Promise<AuthResult> {
    const { getAccessToken, loginAndGetIdToken } = this.electronContext;

    const idToken = await loginAndGetIdToken(options);
    this.idToken = this.idToken;

    const accessToken = await getAccessToken({ ...options, idToken });
    this.accessToken = accessToken;
    console.log(this.accessToken);

    return { accessToken, idToken };
  }

  private get electronContext() {
    if (!this._electronContext) {
      this._electronContext = useElectronContext();
    }
    return this._electronContext;
  }
}

class WebAuthProvider extends AuthProvider {
  constructor(config: OAuthConfig) {
    super(config);
  }

  // TODO (toanzian / ccastro): implement
  async getAccessToken(options: OAuthOptions): Promise<AuthResult> {
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

  async getAccessToken(options: OAuthOptions): Promise<AuthResult> {
    return this.provider.getAccessToken(options);
  }
}

export const authService = new AuthService();
