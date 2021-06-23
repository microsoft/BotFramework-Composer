// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebSiteManagementClient } from '@azure/arm-appservice';
import { TokenCredentials } from '@azure/ms-rest-js';

import { AZURE_HOSTING_GROUP_NAME } from '../getResources';
import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import {
  ProvisionCredentials,
  ProvisionMethod,
  ProvisionWorkingSet,
  ResourceDefinition,
  ResourceProvisionService,
} from '../types';

import { WebAppConfig } from './types';

export const webAppResourceDefinition: ResourceDefinition = {
  key: 'webApp',
  description:
    'App Service Web Apps lets you quickly build, deploy, and scale enterprise-grade web, mobile, and API apps running on any platform. Hosting for your bot.',
  text: AZURE_HOSTING_GROUP_NAME,
  tier: 'S1 Standard',
  group: AZURE_HOSTING_GROUP_NAME,
};

const createWebApp = async (
  webAppManagementClient: WebSiteManagementClient,
  resourceGroupName: string,
  location: string,
  webAppName: string,
  serverFarmId: string
) => {
  return await webAppManagementClient.webApps.createOrUpdate(resourceGroupName, webAppName, {
    name: webAppName,
    serverFarmId: serverFarmId,
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

const getWebAppProvisionMethod = (credentials: ProvisionCredentials): ProvisionMethod => {
  const tokenCredentials = new TokenCredentials(credentials.token);
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, credentials.subscriptionId);

  return async (config: WebAppConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    // const appRegistrationResult = workingSet.appRegistration;
    const webAppResult = await createWebApp(webSiteManagementClient, 'rg-1', 'west-us', 'appName', 'serverfarmid');
    const hostname = webAppResult?.hostNames?.[0];

    const result = { hostname: hostname };
    return {
      ...workingSet,
      webAppResult: result,
    };
  };
};

export const getWebAppProvisionService = (credentials: ProvisionCredentials): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration', 'servicePlan'],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType !== 'functions' ? 'required' : 'notAllowed';
    },
    provision: getWebAppProvisionMethod(credentials),
  };
};
