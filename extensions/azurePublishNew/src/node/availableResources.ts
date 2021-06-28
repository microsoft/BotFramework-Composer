// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionConfig, ResourceConfig, ResourceDefinition, ResourceProvisionService } from './types';
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

export const getProvisionServices = (config: ProvisionConfig): Record<string, ResourceProvisionService> => {
  return {
    appRegistration: getAppRegistrationProvisionService(config),
    webApp: getWebAppProvisionService(config),
    servicePlan: getAppServiceProvisionService(config),
    botRegistration: getBotChannelProvisionService(),
    azureFunctionApp: getAzureFunctionsProvisionService(),
    cosmosDB: getCosmosDbProvisionService(),
    appInsights: getAppInsightsProvisionService(),
    luisAuthoring: getLuisAuthoringProvisionService(),
    luisPrediction: getLuisPredictionProvisionService(),
    blobStorage: getBlogStorageProvisionService(),
    qna: getQnAProvisionService(),
  };
};

export const setUpProvisionService = (config: ProvisionConfig) => {
  const provisionServices = getProvisionServices(config);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const provision = (selectedResources: ResourceConfig[]): void => {
    // config => sorted resource config
    // sortResources(selectedResources);
    const workingSet: Record<string, object> = {};

    selectedResources.forEach((resourceConfig) => {
      const service = provisionServices[resourceConfig.key];
      if (service) {
        service.provision(resourceConfig, workingSet);
      }
    });
  };

  return {
    provisionServices,
    provision,
  };
};

export type ProvisionService = ReturnType<typeof setUpProvisionService>;
