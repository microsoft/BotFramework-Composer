// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { WebSiteManagementClient } from '@azure/arm-appservice';

import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import {
  ProvisionMethod,
  ProvisionServiceConfig,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from '../types';
import { AzureResourceTypes } from '../constants';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';

import { AZURE_HOSTING_GROUP_NAME, S1_STANDARD_TIER } from './constants';

export const azureFunctionsDefinition: ResourceDefinition = {
  key: 'azureFunctions',
  description: 'Azure Functions hosting your bot services.',
  text: 'Azure Functions',
  tier: S1_STANDARD_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
  dependencies: [AzureResourceTypes.RESOURCE_GROUP, AzureResourceTypes.APP_REGISTRATION],
};

export type AzureFunctionsConfig = ResourceConfig & {
  key: 'azureFunctions';
  name: string;
  resourceGroupName: string;
  location: string;
  operatingSystem: string;
  workerRuntime?: string;
  instrumentationKey?: string;
};

const azureFunctionsProvisionMethod = (provisionConfig: ProvisionServiceConfig): ProvisionMethod => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);

  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, provisionConfig.subscriptionId);

  return async (config: AzureFunctionsConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    try {
      const azureFunctionsName = config.name;

      const operatingSystem = config.operatingSystem ? config.operatingSystem : 'windows';

      const azureFunctionsResult = await webSiteManagementClient.webApps.createOrUpdate(
        config.resourceGroupName,
        config.name,
        {
          name: azureFunctionsName,
          location: config.location,
          kind: operatingSystem === 'linux' ? 'functionapp,linux' : 'functionapp',
          httpsOnly: true,
          reserved: operatingSystem === 'linux',
          siteConfig: {
            webSocketsEnabled: true,
            appSettings: [
              {
                name: 'MicrosoftAppId',
                value: workingSet.appRegistration.appId,
              },
              {
                name: 'MicrosoftAppPassword',
                value: workingSet.appRegistration.appPassword,
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
        }
      );

      const hostname = azureFunctionsResult?.hostNames?.[0];

      return {
        ...workingSet,
        azureFunctions: { hostname },
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.CREATE_FUNCTIONS_RESOURCE_ERROR, stringifyError(err));
    }
  };
};

export const getAzureFunctionsProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration'],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType === 'functions' ? 'required' : 'notAllowed';
    },
    provision: azureFunctionsProvisionMethod(config),
    canPollStatus: false,
  };
};
