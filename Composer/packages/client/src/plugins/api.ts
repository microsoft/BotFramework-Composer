// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';

import { getAccessTokenInCache, getGraphTokenInCache } from '../utils/auth';
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

interface TokenPair {
  access_token: string | null;
  graph_token: string | null;
}

interface AuthAPI {
  getAccessTokensFromStorage: () => TokenPair;
  getCurrentUser?: () => any;
  getAccessToken: (options: AuthParameters) => Promise<string>; // returns an access token
}

interface PublishAPI {
  setConfigIsValid?: (valid: boolean) => void;
  setPublishConfig?: (config: PublishConfig) => void;
  useConfigBeingEdited?: (() => PublishConfig[]) | (() => void);
  startProvision?: (config: any) => void;
  currentProjectId?: () => string;
  closeDialog?: () => void;
  onBack?: () => void;
  setTitle?: (value) => void;
  getSchema?: () => any;
  getType?: () => string;
  savePublishConfig?: (config: PublishConfig) => void;
}

class API implements IAPI {
  auth: AuthAPI;
  publish: PublishAPI;

  constructor() {
    this.auth = {
      getAccessToken: (params: AuthParameters) => {
        return AuthClient.getAccessToken(params);
      },
      // TODO: deprecate this when we are using real login
      getAccessTokensFromStorage: () => {
        return {
          // eslint-disable-next-line @typescript-eslint/camelcase
          access_token: getAccessTokenInCache(),
          // eslint-disable-next-line @typescript-eslint/camelcase
          graph_token: getGraphTokenInCache(),
        };
      },
      getCurrentUser: undefined,
    };
    this.publish = {
      setConfigIsValid: undefined,
      setPublishConfig: undefined,
      useConfigBeingEdited: undefined,
      startProvision: undefined,
      currentProjectId: undefined,
      closeDialog: undefined,
      onBack: undefined,
      setTitle: undefined,
      getSchema: undefined,
      savePublishConfig: undefined,
    };
  }
}

export const PluginAPI = new API();
