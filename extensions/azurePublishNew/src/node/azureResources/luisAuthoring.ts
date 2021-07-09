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

import { COGNITIVE_SERVICES_GROUP_NAME, FREE_COGNITIVE_SERVICES_TIER } from './constants';

export const luisAuthoringDefinition: ResourceDefinition = {
  key: 'luisAuthoring',
  description:
    'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis app authoring.',
  text: 'Microsoft Language Understanding Authoring Account',
  tier: FREE_COGNITIVE_SERVICES_TIER,
  group: COGNITIVE_SERVICES_GROUP_NAME,
  dependencies: [],
};

export type LuisAuthoringConfig = ResourceConfig & {
  key: 'luisAuthoring';
  resourceGroupName: string;
  name: string;
  location: string;
  sku?: string;
};

const luisAuthoringProvisionMethod = (provisionConfig: ProvisionServiceConfig): ProvisionMethod => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);

  const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(
    tokenCredentials,
    provisionConfig.subscriptionId
  );

  return async (config: LuisAuthoringConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    // check location is validated
    let authoringLocation = config.location;
    if (!LuisAuthoringSupportLocation.includes(config.location)) {
      authoringLocation = 'westus'; // default as westus
    }

    try {
      const deployResult = await cognitiveServicesManagementClient.accounts.create(
        config.resourceGroupName,
        config.name,
        {
          kind: 'LUIS.Authoring',
          sku: {
            name: config.sku ?? 'F0',
          },
          location: authoringLocation,
        }
      );

      const authoringEndpoint = deployResult.properties?.endpoint ?? '';
      const keys = await cognitiveServicesManagementClient.accounts.listKeys(config.resourceGroupName, config.name);
      const authoringKey = keys?.key1 ?? '';
      const location = deployResult.location;
      return {
        ...workingSet,
        luisAuthoring: { authoringKey, authoringEndpoint, location },
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.CREATE_LUIS_AUTHORING_RESOURCE_ERROR, stringifyError(err));
    }
  };
};

export const getLuisAuthoringProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => {
      return project.requiresLuisAuthoring; // tbd
    },
    provision: luisAuthoringProvisionMethod(config),
    canPollStatus: false,
  };
};
