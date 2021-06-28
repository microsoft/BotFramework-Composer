// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { WebSiteManagementClient } from '@azure/arm-appservice';

import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import { ProvisionConfig, ProvisionWorkingSet, ResourceConfig, ResourceProvisionService } from '../types';
import { createCustomizeError, ProvisionErrors } from '../../../../azurePublish/src/node/utils/errorHandler';

type ServicePlanConfig = ResourceConfig & {
  key: 'servicePlan';
  resourceGroupName: string;
  appServicePlanName: string;
  appServicePlanOptions: {}; // has location, operationsystem
  location: string;
  operatingSystem: string;
};

const appServiceProvisionMethod = (provisionConfig: ProvisionConfig) => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, provisionConfig.subscriptionId);

  return async (resourceConfig: ServicePlanConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
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

export const getAppServiceProvisionService = (config: ProvisionConfig): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration'],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType !== 'functions' ? 'required' : 'notAllowed';
    },
    provision: appServiceProvisionMethod(config),
  };
};
