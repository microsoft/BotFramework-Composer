// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum AzureAPIStatus {
  INFO = 'INFO',
  PARAM_ERROR = 'PARAM_ERROR',
  ERROR = 'ERROR',
}

export enum AzureResourceProviderType {
  QnA = 'Microsoft.CognitiveServices',
  Luis = 'Microsoft.CognitiveServices',
  CosmosDB = 'Microsoft.DocumentDB',
  BlobStorage = 'Microsoft.Storage',
  ApplicationInsights = 'Microsoft.Insights',
  WebApp = 'Microsoft.Web',
  Bot = 'Microsoft.BotService',
}
