// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';

import { AuthClient } from '../utils/authClient';

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
  getAccessToken: (options: AuthParameters) => Promise<string>; // returns an access token
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
      getAccessToken: (params: AuthParameters) => {
        return AuthClient.getAccessToken(params);
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
