// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  OnProvisionProgress,
  ProvisionServiceConfig,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from './types';
import {
  appInsightsDefinition,
  AppInsightsResourceConfig,
  getAppInsightsProvisionService,
} from './azureResources/appInsights';
import {
  appRegistrationDefinition,
  AppRegistrationResourceConfig,
  getAppRegistrationProvisionService,
} from './azureResources/appRegistration';
import { azureFunctionDefinition, getAzureFunctionsProvisionService } from './azureResources/azureFunction';
import { blobStorageDefinition, getBlogStorageProvisionService } from './azureResources/blobStorage';
import { botRegistrationDefinition, getBotChannelProvisionService } from './azureResources/botChannel';
import { cosmosDbDefinition, getCosmosDbProvisionService } from './azureResources/cosmosDb';
import {
  getLuisAuthoringProvisionService,
  LuisAuthoringConfig,
  luisAuthoringDefinition,
} from './azureResources/luisAuthoring';
import {
  getLuisPredictionProvisionService,
  LuisPredictionConfig,
  luisPredictionDefinition,
} from './azureResources/luisPrediction';
import { getQnAProvisionService, qnaDefinition } from './azureResources/qna';
import {
  getAppServiceProvisionService,
  servicePlanDefinition,
  ServicePlanResourceConfig,
} from './azureResources/servicePlan';
import { getWebAppProvisionService, WebAppResourceConfig, webAppResourceDefinition } from './azureResources/webApp';
import { AzureResourceTypes } from './constants';
import { ProvisioningConfig } from './provisioning';

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
    luisAuthoring: getLuisAuthoringProvisionService(config),
    luisPrediction: getLuisPredictionProvisionService(config),
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
    case AzureResourceTypes.APPINSIGHTS:
      return appInsightsDefinition.dependencies;
    case AzureResourceTypes.LUIS_PREDICTION:
      return luisPredictionDefinition.dependencies;
    case AzureResourceTypes.LUIS_AUTHORING:
      return luisAuthoringDefinition.dependencies;
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
  appInsights: (config: ProvisioningConfig): AppInsightsResourceConfig => {
    return {
      key: 'appInsights',
      resourceGroupName: config.resourceGroup,
      location: config.location,
      name: config.hostname,
    };
  },
  luisPrediction: (config: ProvisioningConfig): LuisPredictionConfig => {
    return {
      key: 'luisPrediction',
      location: config.luisLocation,
      name: `${config.hostname}-luis`,
      resourceGroupName: config.resourceGroup,
    };
  },
  luisAuthoring: (config: ProvisioningConfig): LuisAuthoringConfig => {
    return {
      key: 'luisAuthoring',
      resourceGroupName: config.resourceGroup,
      location: config.luisLocation,
      name: `${config.hostname}-luis-authoring`,
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
