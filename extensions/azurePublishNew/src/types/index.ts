// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
