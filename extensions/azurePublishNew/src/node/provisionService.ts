// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from '@botframework-composer/types';

import { getAppRegistrationProvisionService } from './azureResources/appRegistration';
import { getWebAppProvisionService } from './azureResources/webApp';
import { getBotChannelProvisionService } from './azureResources/botChannel';
import { getAzureFunctionsProvisionService } from './azureResources/azureFunctions';
import { getCosmosDbProvisionService } from './azureResources/cosmosDb';
import { getLuisAuthoringProvisionService } from './azureResources/luisAuthoring';
import { getLuisPredictionProvisionService } from './azureResources/luisPrediction';
import { getBlogStorageProvisionService } from './azureResources/blobStorage';
import { getQnAProvisionService } from './azureResources/qna';
import { getAppServiceProvisionService } from './azureResources/servicePlan';
import { getAppInsightsProvisionService } from './azureResources/appInsights';

// bot project => candidate resources => select & configure resources => order & provision

export type ProvisionWorkingSet = Record<string, object>;

export type ProvisionMethod = (config: ResourceConfig, workingSet: ProvisionWorkingSet) => Promise<ProvisionWorkingSet>;

export type ResourceProvisionService = {
  getDependencies: () => string[];
  getRecommendationForProject: (project: IBotProject) => 'required' | 'optional' | 'invalid';
  provision: ProvisionMethod;
};

export type ResourceDefinition = {
  key: string;
  text: string;
  description: string;
  tier: string;
  group: string;
};

export type GetResourcesResult = ResourceDefinition & {
  required: boolean;
};

type ProvisionConfig = {
  key: string;
};

export type ProvisionCredentials = {
  token: string;
  graphToken: string;
  subscriptionId: string;
};

export type ResourceConfig = {
  key: string;
};

export const getProvisionServices = (credentials: ProvisionCredentials): Record<string, ResourceProvisionService> => {
  return {
    appRegistration: getAppRegistrationProvisionService(credentials),
    webApp: getWebAppProvisionService(credentials),
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

export const setUpProvisionService = (credentials: ProvisionCredentials) => {
  const provisionServices = getProvisionServices(credentials);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const provision = (config: ProvisionConfig): void => {
    // config => sorted resource config
    const selectedResources: ResourceConfig[] = [];

    const provisionServices = getProvisionServices(credentials);

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
