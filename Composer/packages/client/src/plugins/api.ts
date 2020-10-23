// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OAuthClient, OAuthOptions } from '../utils/oauthClient';
import { getAccessTokenInCache, getGraphTokenInCache } from '../utils/auth';

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
  login: (options: OAuthOptions) => Promise<string>; // returns an id token
  getAccessToken: (options: OAuthOptions) => Promise<string>; // returns an access token
  getAccessTokensFromStorage: () => TokenPair;
}

interface PublishAPI {
  setConfigIsValid?: (valid: boolean) => void;
  setPublishConfig?: (config: PublishConfig) => void;
  useConfigBeingEdited?: (() => PublishConfig[]) | (() => void);
  startProvision?: (config: any) => void;
  currentProjectId?: () => string;
  closeDialog?: () => void;
  onBack?: () => void;
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
      // TODO: deprecate this when we are using real login
      getAccessTokensFromStorage: () => {
        return {
          // eslint-disable-next-line @typescript-eslint/camelcase
          access_token: getAccessTokenInCache(),
          // eslint-disable-next-line @typescript-eslint/camelcase
          graph_token: getGraphTokenInCache(),
        };
      },
    };
    this.publish = {
      setConfigIsValid: undefined,
      setPublishConfig: undefined,
      useConfigBeingEdited: undefined,
      startProvision: undefined,
      currentProjectId: undefined,
      closeDialog: undefined,
      onBack: undefined,
    };
  }
}

export const PluginAPI = new API();
