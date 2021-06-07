// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebSiteManagementClient } from '@azure/arm-appservice';
import { TokenCredentials } from '@azure/ms-rest-js';

import { AzureFunctionsConfig } from '../azureResourceManager/azureResourceManagerConfig';

import { throwNotImplementedError } from './throwNotImplementedError';

const createWebAppAzureFunctionService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, subscriptionId);

  const createOrUpdate = async (azureFunctionsName: string, config: AzureFunctionsConfig) => {
    return await webSiteManagementClient.webApps.createOrUpdate(config.resourceGroupName, config.name, {
      name: azureFunctionsName,
      location: config.location,
      kind: 'functionapp',
      httpsOnly: true,
      siteConfig: {
        webSocketsEnabled: true,
        appSettings: [
          {
            name: 'MicrosoftAppId',
            value: config.appId,
          },
          {
            name: 'MicrosoftAppPassword',
            value: config.appPwd,
          },
          {
            name: 'FUNCTIONS_EXTENSION_VERSION',
            value: '~3',
          },
          {
            name: 'FUNCTIONS_WORKER_RUNTIME',
            value: config.workerRuntime || 'dotnet',
          },
          {
            name: 'WEBSITE_NODE_DEFAULT_VERSION',
            value: '~14',
          },
          {
            name: 'APPINSIGHTS_INSTRUMENTATIONKEY',
            value: config.instrumentationKey ?? '',
          },
        ],
      },
    });
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
   * Creates or updates a Azure Function WebApp for given resource group
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
    update,
    provision,
  };
};

export type WebAppAzureFunctionService = ReturnType<typeof createWebAppAzureFunctionService>;
