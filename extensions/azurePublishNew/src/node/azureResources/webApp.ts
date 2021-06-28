// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebSiteManagementClient } from '@azure/arm-appservice';
import { TokenCredentials } from '@azure/ms-rest-js';
import { parseRuntimeKey } from '@bfc/shared';

import { ProvisionConfig, ProvisionWorkingSet, ResourceConfig, ResourceProvisionService } from '../types';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';

type WebAppResourceConfig = ResourceConfig & {
  key: 'webApp';
  resourceGroupName: string;
  location: string;
  webAppName: string;
  appServicePlanName: string;
  operatingSystem: string;
};

const webAppProvisionMethod = (provisionConfig: ProvisionConfig) => {
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

export const getWebAppProvisionService = (config: ProvisionConfig): ResourceProvisionService => {
  return {
    getDependencies: () => ['servicePlan'],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType !== 'functions' ? 'required' : 'notAllowed';
    },
    provision: webAppProvisionMethod(config),
  };
};
