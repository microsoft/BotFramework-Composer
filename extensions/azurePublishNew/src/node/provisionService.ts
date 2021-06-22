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

// bot project => candidate resources => select & configure resources => order & provision

export type ProvisionWorkingSet = Record<string, object>;

export type ResourceProvisionService = {
  getDependencies: () => string[];
  getRecommendationForProject: (project: IBotProject) => 'required' | 'optional' | 'invalid';
  provision: <TConfig>(config: TConfig, workingSet: ProvisionWorkingSet) => void;
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

type ProvisionCredentials = {
  token: string;
  graphToken: string;
  subscriptionId: string;
};

export type ResourceConfig = {
  key: string;
};

export type ProvisionMethod = <TConfig>(config: TConfig, workingSet: ProvisionWorkingSet) => ProvisionWorkingSet;

export const getProvisionServices = (): Record<string, ResourceProvisionService> => {
  return {
    appRegistration: getAppRegistrationProvisionService(),
    webApp: getWebAppProvisionService(),
    botRegistration: getBotChannelProvisionService(),
    azureFunctionApp: getAzureFunctionsProvisionService(),
    cosmosDB: getCosmosDbProvisionService(),
    appInsights: getWebAppProvisionService(),
    luisAuthoring: getLuisAuthoringProvisionService(),
    luisPrediction: getLuisPredictionProvisionService(),
    blobStorage: getBlogStorageProvisionService(),
    qna: getQnAProvisionService(),
    servicePlan: getAppServiceProvisionService(),
  };
};

export const setUpProvisionService = (creds: ProvisionCredentials) => {
  const token = creds.token;
  const subscriptionId = creds.subscriptionId;
  const graphToken = creds.graphToken;

  const provision = (config: ProvisionConfig): void => {
    // config => sorted resource config
    const selectedResources: ResourceConfig[] = [];

    const provisionServices = getProvisionServices();

    const workingSet: Record<string, object> = {};
    selectedResources.forEach((resourceConfig) => {
      const service = provisionServices[resourceConfig.key];
      if (service) {
        service.provision(resourceConfig, workingSet);
      }
    });
  };
};

export type ProvisionService = ReturnType<typeof setUpProvisionService>;
