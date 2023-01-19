// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { ResourceManagementClient } from '@azure/arm-resources';

import {
  ProvisionMethod,
  ProvisionServiceConfig,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceProvisionService,
} from '../types';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';

export type ResourceGroupResourceConfig = ResourceConfig & {
  key: 'resourceGroup';
  name: string;
  location: string;
};

const resourceGroupProvisionMethod = (provisionConfig: ProvisionServiceConfig): ProvisionMethod => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const resourceManagementClient = new ResourceManagementClient(tokenCredentials, provisionConfig.subscriptionId);

  return async (config: ResourceGroupResourceConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    try {
      const resourceGroupResult = await resourceManagementClient.resourceGroups.createOrUpdate(config.name, {
        location: config.location,
      });
      return {
        ...workingSet,
        resourceGroup: { name: config.name, location: resourceGroupResult.location },
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.CREATE_RESOURCEGROUP_ERROR, stringifyError(err));
    }
  };
};

export const getResourceGroupProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => 'required',
    provision: resourceGroupProvisionMethod(config),
    canPollStatus: false,
  };
};
