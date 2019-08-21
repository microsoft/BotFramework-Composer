import storage, { ClientStorage } from './storage';

const KEY = 'OAuth';

interface OAuthConfig {
  OAuthInput: {
    MicrosoftAppId: string;
    MicrosoftAppPassword: string;
  };
}

class OAuthStorage {
  static defaultConfig: OAuthConfig = {
    OAuthInput: {
      MicrosoftAppId: '',
      MicrosoftAppPassword: '',
    },
  };
  private storage: ClientStorage;
  private _all: OAuthConfig | null;

  constructor() {
    this.storage = storage;
    this._all = this.storage.get<OAuthConfig | null>(KEY, null);
  }

  get(): OAuthConfig {
    return this._all || OAuthStorage.defaultConfig;
  }

  set(config: OAuthConfig) {
    this.check(config);
    this._all = config;
    this.storage.set(KEY, config);
  }

  check(config: OAuthConfig) {
    Object.keys(config.OAuthInput).forEach(property => {
      if (OAuthStorage.defaultConfig.OAuthInput.hasOwnProperty(property) === false) {
        throw new Error(`Please enter the date in the structure:
				OAuthInput: {
					MicrosoftAppId: '',
					MicrosoftAppPassword: '',
				} `);
      }
    });
  }
}

export default new OAuthStorage();
