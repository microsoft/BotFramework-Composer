// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getAppRegistrationProvisionService } from './azureResources/appRegistration';
import { getWebAppProvisionService } from './azureResources/webApp';
import { getBotChannelProvisionService } from './azureResources/botChannel';
import { getAzureFunctionsProvisionService } from './azureResources/azureFunction';
import { getCosmosDbProvisionService } from './azureResources/cosmosDb';
import { getLuisAuthoringProvisionService } from './azureResources/luisAuthoring';
import { getLuisPredictionProvisionService } from './azureResources/luisPrediction';
import { getBlogStorageProvisionService } from './azureResources/blobStorage';
import { getQnAProvisionService } from './azureResources/qna';
import { getAppServiceProvisionService } from './azureResources/servicePlan';
import { getAppInsightsProvisionService } from './azureResources/appInsights';
import { ProvisionConfig, ResourceConfig, ResourceProvisionService } from './types';

// bot project => candidate resources => select & configure resources => order & provision

export const getProvisionServices = (config: ProvisionConfig): Record<string, ResourceProvisionService> => {
  return {
    appRegistration: getAppRegistrationProvisionService(config),
    webApp: getWebAppProvisionService(config),
    botRegistration: getBotChannelProvisionService(),
    azureFunctionApp: getAzureFunctionsProvisionService(),
    cosmosDB: getCosmosDbProvisionService(),
    appInsights: getAppInsightsProvisionService(),
    luisAuthoring: getLuisAuthoringProvisionService(),
    luisPrediction: getLuisPredictionProvisionService(),
    blobStorage: getBlogStorageProvisionService(),
    qna: getQnAProvisionService(),
    servicePlan: getAppServiceProvisionService(),
  };
};

export const setUpProvisionService = (config: ProvisionConfig) => {
  const provisionServices = getProvisionServices(config);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const provision = (): void => {
    // config => sorted resource config
    const selectedResources: ResourceConfig[] = [];

    const provisionServices = getProvisionServices(config);

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
