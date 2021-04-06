// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters, AzureTenant } from '@botframework-composer/types';

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
  getARMTokenForTenant: (tenantId: string) => Promise<string>; // returns an ARM access token for specified tenant
  getTenants: () => Promise<AzureTenant[]>; // signs a user in and returns available Azure tenants for the user
  logOut: () => Promise<void>;
}

interface PublishAPI {
  getPublishConfig?: () => PublishConfig | void;
  startProvision?: (config: any) => void;
  currentProjectId?: () => string;
  closeDialog?: () => void;
  onBack?: () => void;
  setTitle?: (value) => void;
  getSchema?: () => any;
  getType?: () => string;
  getName?: () => string;
  savePublishConfig?: (config: PublishConfig) => void;
  getTokenFromCache?: () => { accessToken: string; graphToken: string };
  /** @deprecated use `userShouldProvideTokens` instead */
  isGetTokenFromUser?: () => boolean;
  userShouldProvideTokens?: () => boolean;
  getTenantIdFromCache?: () => string;
  setTenantId?: (value: string) => void;
}

class API implements IAPI {
  auth: AuthAPI;
  publish: PublishAPI;

  constructor() {
    this.auth = {
      getAccessToken: (params: AuthParameters) => AuthClient.getAccessToken(params),
      getARMTokenForTenant: (tenantId: string) => AuthClient.getARMTokenForTenant(tenantId),
      getTenants: () => AuthClient.getTenants(),
      logOut: () => AuthClient.logOut(),
    };
    this.publish = {
      getPublishConfig: undefined,
      startProvision: undefined,
      currentProjectId: undefined,
      closeDialog: undefined,
      onBack: undefined,
      setTitle: undefined,
      getSchema: undefined,
      savePublishConfig: undefined,
      getTokenFromCache: undefined,
      isGetTokenFromUser: undefined,
      userShouldProvideTokens: undefined,
      getTenantIdFromCache: undefined,
      setTenantId: undefined,
    };
  }
}

export const PluginAPI = new API();
