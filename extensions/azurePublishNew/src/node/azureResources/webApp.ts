// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebSiteManagementClient } from '@azure/arm-appservice';
import { TokenCredentials } from '@azure/ms-rest-js';
import { parseRuntimeKey } from '@bfc/shared';

import { ProvisionConfig, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { AZURE_HOSTING_GROUP_NAME, S1_STANDARD_TIER } from './constants';

export const webAppResourceDefinition: ResourceDefinition = {
  key: 'webApp',
  description:
    'App Service Web Apps lets you quickly build, deploy, and scale enterprise-grade web, mobile, and API apps running on any platform. Hosting for your bot.',
  text: 'App Services',
  tier: S1_STANDARD_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
};

const createWebApp = async (client: WebSiteManagementClient, config: ProvisionConfig) => {
  const { resourceGroupName, webAppName, serverFarm, location } = config;
  return await client.webApps.createOrUpdate(resourceGroupName, webAppName, {
    name: webAppName,
    serverFarmId: serverFarm,
    location: location,
    kind: 'app',
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
};

const webAppProvisionMethod = async (
  client: WebSiteManagementClient,
  config: ProvisionConfig,
  workingSet: {}
): Promise<ProvisionWorkingSet> => {
  // const appRegistrationResult = workingSet.appRegistration;
  const webAppResult = await createWebApp(client, config);
  const hostname = webAppResult?.hostNames?.[0];

  const result = { hostname: hostname };
  return {
    ...workingSet,
    webAppResult: result,
  };
};

export const getWebAppProvisionService = (config: ProvisionConfig): ResourceProvisionService => {
  const tokenCredentials = new TokenCredentials(config.credentials.token);
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, config.subscriptionId);

  return {
    getDependencies: () => ['appRegistration', 'servicePlan'],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType !== 'functions' ? 'required' : 'notAllowed';
    },
    provision: () => webAppProvisionMethod(webSiteManagementClient, config, {}),
  };
};
