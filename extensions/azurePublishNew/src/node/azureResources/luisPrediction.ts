// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';

import {
  ProvisionMethod,
  ProvisionServiceConfig,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from '../types';
import { LuisAuthoringSupportLocation } from '../../../../azurePublish/src/types';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';
import { AzureResourceTypes } from '../constants';

import { COGNITIVE_SERVICES_GROUP_NAME, SO_STANDARD_TIER } from './constants';

export const luisPredictionDefinition: ResourceDefinition = {
  key: 'luisPrediction',
  description:
    'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis endpoint hitting.',
  text: 'Microsoft Language Understanding Prediction Account',
  tier: SO_STANDARD_TIER,
  group: COGNITIVE_SERVICES_GROUP_NAME,
  dependencies: [AzureResourceTypes.RESOURCE_GROUP],
};

export type LuisPredictionConfig = ResourceConfig & {
  key: 'luisPrediction';
  location: string;
  resourceGroupName: string;
  name: string;
  sku?: string;
};

const luisPredictionProvisionMethod = (provisionConfig: ProvisionServiceConfig): ProvisionMethod => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(
    tokenCredentials,
    provisionConfig.subscriptionId
  );

  return async (config: LuisPredictionConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    // check luis publish location is validated
    let authoringLocation = config.location;
    if (!LuisAuthoringSupportLocation.includes(config.location)) {
      authoringLocation = 'westus'; // default as westus
    }

    try {
      const deployResult = await cognitiveServicesManagementClient.accounts.create(
        config.resourceGroupName,
        config.name,
        {
          kind: 'LUIS',
          sku: {
            name: config.sku ?? 'S0',
          },
          location: authoringLocation,
        }
      );

      const endpoint = deployResult.properties?.endpoint ?? '';
      const keys = await cognitiveServicesManagementClient.accounts.listKeys(config.resourceGroupName, config.name);
      const endpointKey = keys?.key1 ?? '';
      const location = deployResult.location;
      return {
        ...workingSet,
        luisPrediction: { endpoint, endpointKey, location },
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.CREATE_LUIS_ERROR, stringifyError(err));
    }
  };
};

export const getLuisPredictionProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => {
      return project.requiresLuisPrediction; // tbd
    },
    provision: luisPredictionProvisionMethod(config),
    canPollStatus: false,
  };
};
