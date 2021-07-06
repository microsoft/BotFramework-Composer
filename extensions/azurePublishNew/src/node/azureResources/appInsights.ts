// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { AzureBotService } from '@azure/arm-botservice';

import { ProvisionServiceConfig, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';
import { AzureResourceTypes } from '../constants';
import { AppInsightsResourceConfig } from '../availableResources';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';

import { AZURE_HOSTING_GROUP_NAME, PAY_AS_YOU_GO_TIER } from './constants';

export const appInsightsDefinition: ResourceDefinition = {
  key: 'appInsights',
  description: 'Application Insights allows you to monitor and analyze usage and performance of your bot.',
  text: 'Application Insights',
  tier: PAY_AS_YOU_GO_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
  dependencies: [AzureResourceTypes.RESOURCE_GROUP, AzureResourceTypes.BOT_REGISTRATION],
};

const appInsightsProvisionMethod = (provisionConfig: ProvisionServiceConfig) => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);

  const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(
    tokenCredentials,
    provisionConfig.subscriptionId
  );

  const botServiceClient = new AzureBotService(tokenCredentials, provisionConfig.subscriptionId);

  const createOrUpdateAppInsightsComponent = async (resourceConfig: AppInsightsResourceConfig) =>
    await applicationInsightsManagementClient.components.createOrUpdate(
      resourceConfig.resourceGroupName,
      resourceConfig.name,
      {
        location: resourceConfig.location,
        applicationType: resourceConfig.applicationType ?? 'web',
        kind: 'web',
      }
    );

  type ApiKeyOptions = {
    name: string;
    linkedReadProperties: string[];
    linkedWriteProperties: string[];
  };

  const getApiKeyOptions = (config: AppInsightsResourceConfig, subscriptionId: string): ApiKeyOptions => {
    // timestamp will be used as deployment name
    const timeStamp = new Date().getTime().toString();

    return {
      name: `${config.resourceGroupName}-provision-${timeStamp}`,
      linkedReadProperties: [
        `/subscriptions/${subscriptionId}/resourceGroups/${config.resourceGroupName}/providers/microsoft.insights/components/${config.name}/api`,
        `/subscriptions/${subscriptionId}/resourceGroups/${config.resourceGroupName}/providers/microsoft.insights/components/${config.name}/agentconfig`,
      ],
      linkedWriteProperties: [
        `/subscriptions/${subscriptionId}/resourceGroups/${config.resourceGroupName}/providers/microsoft.insights/components/${config.name}/annotations`,
      ],
    };
  };

  const connectAppInsightsToBotService = async (
    appInsightsClient: ApplicationInsightsManagementClient,
    botServiceClient: AzureBotService,
    apiKeyOptions: ApiKeyOptions,
    config: AppInsightsResourceConfig
  ) => {
    const appComponents = await appInsightsClient.components.get(config.resourceGroupName, config.name);
    const appInsightsId = appComponents.appId;
    const appInsightsInstrumentationKey = appComponents.instrumentationKey;

    const appInsightsApiKeyResponse = await appInsightsClient.aPIKeys.create(
      config.resourceGroupName,
      config.name,
      apiKeyOptions
    );

    const appInsightsApiKey = appInsightsApiKeyResponse.apiKey;

    if (appInsightsId && appInsightsInstrumentationKey && appInsightsApiKey) {
      const botCreated = await botServiceClient.bots.get(config.resourceGroupName, config.name);
      if (botCreated.properties) {
        botCreated.properties.developerAppInsightKey = appInsightsInstrumentationKey;
        botCreated.properties.developerAppInsightsApiKey = appInsightsApiKey;
        botCreated.properties.developerAppInsightsApplicationId = appInsightsId;
        await botServiceClient.bots.update(config.resourceGroupName, config.name, botCreated);
      }
    }
  };

  return async (
    resourceConfig: AppInsightsResourceConfig,
    workingSet: ProvisionWorkingSet
  ): Promise<ProvisionWorkingSet> => {
    try {
      const deployResult = await createOrUpdateAppInsightsComponent(resourceConfig);

      const apiKeyOptions = getApiKeyOptions(resourceConfig, provisionConfig.subscriptionId);

      await connectAppInsightsToBotService(
        applicationInsightsManagementClient,
        botServiceClient,
        apiKeyOptions,
        resourceConfig
      );

      const provisionResult = {
        instrumentationKey: deployResult.instrumentationKey,
        connectionString: deployResult.connectionString,
      };

      return {
        ...workingSet,
        appInsights: provisionResult,
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.CREATE_APP_INSIGHT_ERROR, stringifyError(err));
    }
  };
};

export const getAppInsightsProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => ['botRegistration'],
    getRecommendationForProject: (project) => 'optional',
    provision: appInsightsProvisionMethod(config),
    canPollStatus: false,
  };
};
