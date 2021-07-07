// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  OnProvisionProgress,
  ProvisionServiceConfig,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from './types';
import { appInsightsDefinition, getAppInsightsProvisionService } from './azureResources/appInsights';
import {
  appRegistrationDefinition,
  AppRegistrationResourceConfig,
  getAppRegistrationProvisionService,
} from './azureResources/appRegistration';
import { azureFunctionDefinition, getAzureFunctionsProvisionService } from './azureResources/azureFunction';
import { blobStorageDefinition, getBlogStorageProvisionService } from './azureResources/blobStorage';
import { botRegistrationDefinition, getBotChannelProvisionService } from './azureResources/botChannel';
import { cosmosDbDefinition, getCosmosDbProvisionService } from './azureResources/cosmosDb';
import { getLuisAuthoringProvisionService, luisAuthoringDefinition } from './azureResources/luisAuthoring';
import { getLuisPredictionProvisionService, luisPredictionDefinition } from './azureResources/luisPrediction';
import { getQnAProvisionService, qnaDefinition } from './azureResources/qna';
import { getAppServiceProvisionService, servicePlanDefinition } from './azureResources/servicePlan';
import { getWebAppProvisionService, webAppResourceDefinition } from './azureResources/webApp';
import { AzureResourceTypes } from './constants';
import { ProvisioningConfig } from './provisioning';

type ApplicationType = 'web' | 'other';

export type AppInsightsResourceConfig = ResourceConfig & {
  resourceGroupName: string;
  location: string;
  name: string;
  applicationType?: ApplicationType;
};

export const availableResources: ResourceDefinition[] = [
  appRegistrationDefinition,
  webAppResourceDefinition,
  botRegistrationDefinition,
  azureFunctionDefinition,
  cosmosDbDefinition,
  appInsightsDefinition,
  luisAuthoringDefinition,
  luisPredictionDefinition,
  blobStorageDefinition,
  qnaDefinition,
  servicePlanDefinition,
];

export const getProvisionServices = (config: ProvisionServiceConfig): Record<string, ResourceProvisionService> => {
  return {
    appRegistration: getAppRegistrationProvisionService(config),
    webApp: getWebAppProvisionService(config),
    servicePlan: getAppServiceProvisionService(config),
    botRegistration: getBotChannelProvisionService(),
    azureFunctionApp: getAzureFunctionsProvisionService(),
    cosmosDB: getCosmosDbProvisionService(config),
    appInsights: getAppInsightsProvisionService(config),
    luisAuthoring: getLuisAuthoringProvisionService(),
    luisPrediction: getLuisPredictionProvisionService(),
    blobStorage: getBlogStorageProvisionService(),
    qna: getQnAProvisionService(),
  };
};

export const getResourceDependencies = (key: string) => {
  switch (key) {
    case AzureResourceTypes.APP_REGISTRATION:
      return appRegistrationDefinition.dependencies;
    case AzureResourceTypes.APPINSIGHTS:
      return appInsightsDefinition.dependencies;
    default:
      return [];
  }
};

export const provisionConfigToResourceConfigMap = {
  appRegistration: (config: ProvisioningConfig): AppRegistrationResourceConfig => {
    return {
      key: 'appRegistration',
      appName: config.hostname,
    };
  },
  appInsights: (config: ProvisioningConfig): AppInsightsResourceConfig => {
    return {
      key: 'appInsights',
      resourceGroupName: config.resourceGroup,
      location: config.location,
      name: config.hostname,
    };
  },
};

export const setUpProvisionService = (config: ProvisionServiceConfig, onProgress: OnProvisionProgress) => {
  const provisionServices = getProvisionServices(config);

  const provision = (selectedResources: ResourceConfig[]): void => {
    let workingSet: Record<string, object> = {};

    selectedResources.forEach(async (resourceConfig) => {
      const service: ResourceProvisionService = provisionServices[resourceConfig.key];
      if (service) {
        workingSet = await service.provision(resourceConfig, workingSet, onProgress);
      }
    });
  };

  return {
    provisionServices,
    provision,
  };
};

export type ProvisionService = ReturnType<typeof setUpProvisionService>;
