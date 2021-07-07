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
import { appRegistrationDefinition, getAppRegistrationProvisionService } from './azureResources/appRegistration';
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

export type AppRegistrationResourceConfig = ResourceConfig & {
  key: 'appRegistration';
  appName: string;
};

export type WebAppResourceConfig = ResourceConfig & {
  key: 'webApp';
  resourceGroupName: string;
  location: string;
  webAppName: string;
  operatingSystem: string;
};

export type ServicePlanResourceConfig = ResourceConfig & {
  key: 'servicePlan';
  resourceGroupName: string;
  appServicePlanName: string;
  location: string;
  operatingSystem: string;
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
    appInsights: getAppInsightsProvisionService(),
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
    case AzureResourceTypes.WEBAPP:
      return webAppResourceDefinition.dependencies;
    case AzureResourceTypes.SERVICE_PLAN:
      return servicePlanDefinition.dependencies;
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
  webApp: (config: ProvisioningConfig): WebAppResourceConfig => {
    return {
      key: 'webApp',
      webAppName: config.hostname,
      location: config.location,
      operatingSystem: config.appServiceOperatingSystem,
      resourceGroupName: config.resourceGroup,
    };
  },
  servicePlan: (config: ProvisioningConfig): ServicePlanResourceConfig => {
    return {
      key: 'servicePlan',
      appServicePlanName: config.hostname,
      location: config.location,
      operatingSystem: config.appServiceOperatingSystem,
      resourceGroupName: config.resourceGroup,
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
