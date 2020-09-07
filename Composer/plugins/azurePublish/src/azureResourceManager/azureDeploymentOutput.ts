// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface AzureDeploymentOutput {
  applicationInsights: ApplicationInsightsOutput;
  cosmosDb: CosmosDbOutput;
  blobStorage: BlobStorageOutput;
  luis: LuisOutput;
  qna: QnAOutput;
}

export interface ApplicationInsightsOutput {
  instrumentationKey?: string;
}

export interface CosmosDbOutput {
  cosmosDBEndpoint?: string;
  authKey?: string;
  databaseId?: string;
  collectoinId?: string;
  containerId?: string;
}

export interface BlobStorageOutput {
  connectionString?: string;
  container?: string;
}

export interface LuisOutput {
  endpointKey?: string;
  authoringKey?: string;
  region?: string;
  endpoint?: string;
  authoringEndpoint?: string;
}

export interface WebAppOutput {
  endpoint: string;
}

export interface QnAOutput {
  endpoint?: string;
  subscriptionKey?: string;
}
