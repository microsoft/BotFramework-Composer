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
      getAccessToken: (options: OAuthOptions) => {
        return OAuthClient.getAccessToken(options);
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
