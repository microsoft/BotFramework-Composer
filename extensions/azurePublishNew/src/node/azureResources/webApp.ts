// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebSiteManagementClient } from '@azure/arm-appservice';
import { TokenCredentials } from '@azure/ms-rest-js';
import { parseRuntimeKey } from '@bfc/shared';

import {
  ProvisionServiceConfig,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from '../types';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';
import { AzureResourceTypes } from '../constants';

import { AZURE_HOSTING_GROUP_NAME, S1_STANDARD_TIER } from './constants';

export const webAppResourceDefinition: ResourceDefinition = {
  key: 'webApp',
  description:
    'App Service Web Apps lets you quickly build, deploy, and scale enterprise-grade web, mobile, and API apps running on any platform. Hosting for your bot.',
  text: 'App Services',
  tier: S1_STANDARD_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
  dependencies: [AzureResourceTypes.RESOURCE_GROUP, AzureResourceTypes.SERVICE_PLAN],
};

export type WebAppResourceConfig = ResourceConfig & {
  key: 'webApp';
  resourceGroupName: string;
  location: string;
  webAppName: string;
  operatingSystem: string;
};

const webAppProvisionMethod = (provisionConfig: ProvisionServiceConfig) => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, provisionConfig.subscriptionId);

  return async (
    resourceConfig: WebAppResourceConfig,
    workingSet: ProvisionWorkingSet
  ): Promise<ProvisionWorkingSet> => {
    const { resourceGroupName, webAppName, operatingSystem, location } = resourceConfig;
    try {
      const webAppResult = await webSiteManagementClient.webApps.createOrUpdate(resourceGroupName, webAppName, {
        name: webAppName,
        serverFarmId: workingSet.appService.appServicePlanName,
        location: location,
        kind: operatingSystem === 'linux' ? 'app,linux' : 'app',
        siteConfig: {
          webSocketsEnabled: true,
          appSettings: [
            {
              name: 'WEBSITE_NODE_DEFAULT_VERSION',
              value: '10.14.1',
            },
          ],
          cors: {
            allowedOrigins: ['https://botservice.hosting.portal.azure.net', 'https://hosting.onecloud.azure-test.net/'],
          },
        },
      });
      const hostname = webAppResult?.hostNames?.[0];
      return { ...workingSet, webAppResult: { hostname: hostname } };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.CREATE_WEB_APP_ERROR, stringifyError(err));
    }
  };
};

export const getWebAppProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => ['servicePlan'],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType !== 'functions' ? 'required' : 'notAllowed';
    },
    provision: webAppProvisionMethod(config),
    canPollStatus: true,
  };
};
