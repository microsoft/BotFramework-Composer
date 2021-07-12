// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ResourceConfig, ResourceDefinition } from '../types';

export type WebAppResult = {
  key: 'webApp';
  endpoint: string;
  hostname: string;
};
export type WebAppConfig = ResourceConfig & {
  key: 'webApp';
  name: string;
  location: string;
  resourceGroupName: string;
};
export type AppServiceConfig = ResourceDefinition & {};
export type BotServiceConfig = ResourceConfig & {
  key: 'botChannel';
  name: string;
  resourceGroupName: string;
};
export type BotChannelResult = {
  botName: string;
};

export type BlobStorageConfigNew = ResourceConfig & {
  key: 'blobStorage';
};
export type AppRegistrationConfig = ResourceConfig & {
  key: 'appRegistration';
  name: string;
};
export type AppRegistrationResult = {
  key: 'appRegistration';
  appId: string;
  appPassword: string;
};
