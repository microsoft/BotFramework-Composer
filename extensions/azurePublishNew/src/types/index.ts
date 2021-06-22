// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum AzureAPIStatus {
  INFO = 'INFO',
  PARAM_ERROR = 'PARAM_ERROR',
  ERROR = 'ERROR',
}

export type ProvisionAction = 'create' | 'import' | 'generate';

export enum AzureResourceProviderType {
  QnA = 'Microsoft.CognitiveServices',
  Luis = 'Microsoft.CognitiveServices',
  CosmosDB = 'Microsoft.DocumentDB',
  BlobStorage = 'Microsoft.Storage',
  ApplicationInsights = 'Microsoft.Insights',
  WebApp = 'Microsoft.Web',
  Bot = 'Microsoft.BotService',
}

export type ResourcesItem = {
  description: string;
  text: string;
  tier: string;
  group: string;
  key: string;
  required: boolean;
  [key: string]: any;
};

export type PublishProfileConfiguration = {
  tenantId: string;
  subscriptionId: string;
  resourceGroup: ResourceGroup;
  luisRegion: string;
  deployLocation: string;
  hostName: string;
};

export type ResourceGroup = {
  name: string;
  isNew: boolean;
};

export type UserInfo = {
  token: string;
  email: string;
  name: string;
  expiration: number;
  sessionExpired: boolean;
};

export type ImportConfiguration = {
  config: string;
  isValidConfiguration: boolean;
};

export type LuisRegion = 'westus' | 'australiaeast' | 'westeurope';

export type PreviewResourcesItem = {
  name: string;
  icon: string;
  key: string;
};
