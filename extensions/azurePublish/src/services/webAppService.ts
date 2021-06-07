// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebSiteManagementClient } from '@azure/arm-appservice';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

export const createWebAppService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, subscriptionId);

  const createOrUpdate = async (createAppOptions) => {
    const { resourceGroupName, webAppName, AppPlanName, location } = createAppOptions;

    const webAppResult = await webSiteManagementClient.webApps.createOrUpdate(resourceGroupName, webAppName, {
      name: webAppName,
      serverFarmId: AppPlanName,
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

    return webAppResult;
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  const get = async () => {
    throwNotImplementedError();
  };

  const list = async () => {
    throwNotImplementedError();
  };

  const listByResourceGroup = async () => {
    throwNotImplementedError();
  };

  const update = async () => {
    throwNotImplementedError();
  };

  /**
   * Creates or updates a Azure WebApp for given resource group
   */
  const provision = async () => {
    throwNotImplementedError();
  };

  return {
    createOrUpdate,
    deleteMethod,
    get,
    list,
    listByResourceGroup,
    provision,
    update,
  };
};

export type WebAppService = ReturnType<typeof createWebAppService>;
