// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SkuName } from '@azure/arm-storage/esm/models';

export interface AzureResourceManangerConfig {
  // The credentials of user
  creds: any;

  // The logger
  logger: any;

  // The subscription id of user
  subId: string;

  // Create Resource Group config
  resourceGroup: ResourceGroupConfig;

  // Create luis authoring resource config
  luisAuthoringResource: LuisAuthoringResourceConfig;

  // Create luis resource config
  luisResource: LuisResourceConfig;

  // Create application insights config
  appInsights: ApplicationInsightsConfig;

  // Create cosmos db config
  cosmosDB: CosmosDBConfig;

  // Create blob storage config
  blobStorage: BlobStorageConfig;

  // Create bot service
  bot: BotConfig;

  // Create web app
  webApp: WebAppConfig;

  // Deployments counter
  deployments: DeploymentsConfig;

  // Use this to handle the create or not of a resource
  createOrNot: CreateResouces;
}

export interface CreateResouces {
  // Create luis authoring resource or not
  luisAuthoringResource: boolean;

  // Create luis resource or not
  luisResource: boolean;

  // Create application insights or not
  appInsights: boolean;

  // Create cosmos db or not
  cosmosDB: boolean;

  // Create blob storage or not
  blobStorage: boolean;

  // Create bot service or not
  bot: boolean;

  // Create web app or not
  webApp: boolean;

  // Create Deployment UUID counter or not
  deployments: boolean;
}

export interface ResourceGroupConfig {
  name: string;
  location: string;
}

export interface LuisAuthoringResourceConfig {
  resourceGroupName: string;
  accountName: string;
  location: string;
  sku?: string;
}

export interface LuisResourceConfig {
  resourceGroupName: string;
  accountName: string;
  location: string;
  sku?: string;
}

export interface ApplicationInsightsConfig {
  resourceGroupName: string;
  name: string;
  location: string;
  applicationType?: ApplicationType;
}

export interface CosmosDBConfig {
  resourceGroupName: string;
  name: string;
  location: string;
  databaseAccountOfferType?: string;
  databaseName: string;
  containerName: string;
}

export interface BlobStorageConfig {
  resourceGroupName: string;
  name: string;
  location: string;
  sku?: SkuName;
  containerName: string;
}

export interface BotConfig {
  resourceGroupName: string;
  name: string;
  location: string;
  displayName: string;
  endpoint?: string;
  appId?: string;
  appPwd?: string;
  appInsightsId?: string;
  appInsightsApiKey?: string;
  appInsightsInsKey?: string;
}

export interface WebAppConfig {
  resourceGroupName: string;
  name: string;
  location: string;
  sku?: string;
  appId?: string;
  appPwd?: string;
}

export interface DeploymentsConfig {
  resourceGroupName: string;
  name: string;
}

export type ApplicationType = 'web' | 'other';
