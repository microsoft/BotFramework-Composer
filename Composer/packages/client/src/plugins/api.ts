// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OAuthClient, OAuthOptions } from '../utils/oauthClient';

interface IAPI {
  auth: AuthAPI;
  page?: {};
  publish: PublishAPI;
  storage?: {};
}

interface PublishConfig {
  [key: string]: any;
}

interface AuthAPI {
  login: (options: OAuthOptions) => Promise<string>; // returns an id token
  getAccessToken: (options: OAuthOptions) => Promise<string>; // returns an access token
}

interface PublishAPI {
  setConfigIsValid?: (valid: boolean) => void;
  setPublishConfig?: (config: PublishConfig) => void;
  useConfigBeingEdited?: (() => PublishConfig[]) | (() => void);
}

class API implements IAPI {
  auth: AuthAPI;
  publish: PublishAPI;

  constructor() {
    this.auth = {
      login: (options: OAuthOptions) => {
        const client = new OAuthClient(options);
        return client.login();
      },
      getAccessToken: (options: OAuthOptions) => {
        const client = new OAuthClient(options);
        return client.getTokenSilently();
      },
    };
    this.publish = {
      setConfigIsValid: undefined,
      setPublishConfig: undefined,
      useConfigBeingEdited: undefined,
    };
  }
}

export const PluginAPI = new API();
