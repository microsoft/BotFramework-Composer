import storage from './storage';

const KEY = 'OAuth';

class oauthStorage {
  static defaultConfig = {
    OAuthInput: {
      MicrosoftAppId: '',
      MicrosoftAppPassword: '',
    },
  };

  constructor() {
    this.storage = storage;
    this._all = this.storage.get(KEY, null);
  }

  get() {
    return this._all || oauthStorage.defaultConfig;
  }

  set(config) {
    this.check(config);
    this._all = config;
    this.storage.set(KEY, config);
  }

  check(config) {
    Object.keys(config.OAuthInput).forEach(property => {
      if (oauthStorage.defaultConfig.OAuthInput.hasOwnProperty(property) === false) {
        throw new Error(`Please enter the date in the structure: 
				OAuthInput: {
					MicrosoftAppId: '',
					MicrosoftAppPassword: '',
				} `);
      }
    });
  }
}

export default new oauthStorage();
