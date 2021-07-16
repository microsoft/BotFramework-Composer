// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { WebSiteManagementClient } from '@azure/arm-appservice';

import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import {
  ProvisionServiceConfig,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from '../types';
import { createCustomizeError, ProvisionErrors } from '../../../../azurePublish/src/node/utils/errorHandler';
import { AzureResourceTypes } from '../constants';

import { AZURE_HOSTING_GROUP_NAME, S1_STANDARD_TIER } from './constants';

export const servicePlanDefinition: ResourceDefinition = {
  key: 'servicePlan',
  description:
    'App Service plans give you the flexibility to allocate specific apps to a given set of resources and further optimize your Azure resource utilization. This way, if you want to save money on your testing environment you can share a plan across multiple apps.',
  text: 'Microsoft App Service Plan',
  tier: S1_STANDARD_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
  dependencies: [AzureResourceTypes.RESOURCE_GROUP],
};

export type ServicePlanResourceConfig = ResourceConfig & {
  key: 'servicePlan';
  resourceGroupName: string;
  appServicePlanName: string;
  location: string;
  operatingSystem: string;
};

const appServiceProvisionMethod = (provisionConfig: ProvisionServiceConfig) => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, provisionConfig.subscriptionId);

  return async (
    resourceConfig: ServicePlanResourceConfig,
    workingSet: ProvisionWorkingSet
  ): Promise<ProvisionWorkingSet> => {
    const operatingSystem = resourceConfig.operatingSystem ? resourceConfig.operatingSystem : 'windows';
    try {
      // Create new Service Plan
      const appServiceResult = await webSiteManagementClient.appServicePlans.createOrUpdate(
        resourceConfig.resourceGroupName,
        resourceConfig.appServicePlanName,
        {
          location: resourceConfig.location,
          kind: operatingSystem,
          reserved: operatingSystem === 'linux',
          sku: {
            name: 'S1',
            tier: 'Standard',
            size: 'S1',
            family: 'S',
            capacity: 1,
          },
        }
      );
      return { ...workingSet, appService: { appServicePlanName: appServiceResult.name } };
    } catch (err) {
      if (err.status >= 300) {
        throw createCustomizeError(ProvisionErrors.CREATE_WEB_APP_ERROR, err.message);
      }
    }
  };
};

export const getAppServiceProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType !== 'functions' ? 'required' : 'notAllowed';
    },
    provision: appServiceProvisionMethod(config),
    canPollStatus: true,
  };
};
