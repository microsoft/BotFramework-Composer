// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { AzureBotService } from '@azure/arm-botservice';

import {
  ProvisionMethod,
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

import { AZURE_HOSTING_GROUP_NAME, FREE_COGNITIVE_SERVICES_TIER } from './constants';

export type BotRegistrationConfig = ResourceConfig & {
  key: 'botRegistration';
  hostname: string;
  resourceGroupName: string;
};

export const botRegistrationDefinition: ResourceDefinition = {
  key: 'botRegistration',
  text: 'Microsoft Bot Channels Registration',
  description:
    'When registered with the Azure Bot Service, you can host your bot in any environment and enable customers from a variety of channels, such as your app or website, Direct Line Speech, Microsoft Teams and more.',
  tier: FREE_COGNITIVE_SERVICES_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
  dependencies: [AzureResourceTypes.RESOURCE_GROUP, AzureResourceTypes.APP_REGISTRATION],
};

const botChannelProvisionMethod = (provisionConfig: ProvisionServiceConfig): ProvisionMethod => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const azureBotService = new AzureBotService(tokenCredentials, provisionConfig.subscriptionId);

  const checkRequiredField = (field: string, errorMsg: string) => {
    if (!field) {
      createCustomizeError(ProvisionErrors.BOT_REGISTRATION_ERROR, errorMsg);
    }
  };

  return async (config: BotRegistrationConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    checkRequiredField(config.resourceGroupName, 'resourceGroupName is required.');
    checkRequiredField(workingSet.appRegistration?.appId, 'appRegistration.appId is required.');
    checkRequiredField(workingSet.webAppResult?.hostname, 'webApp.hostname is required.');

    const appId = workingSet.appRegistration?.appId;
    const webAppHostname = workingSet.webAppResult?.hostname;
    const endpoint = `https://${webAppHostname ?? config.hostname + '.azurewebsites.net'}/api/messages`;
    const displayName = config.hostname; // how it is in production now - but theres a comment that we might not want to use hostname for displayName

    try {
      await azureBotService.bots.create(config.resourceGroupName, displayName, {
        properties: {
          displayName: displayName,
          endpoint: endpoint,
          msaAppId: appId,
          openWithHint: 'bfcomposer://',
        },
        sku: {
          name: 'F0',
        },
        name: displayName,
        location: 'global',
        kind: 'azurebot',
        tags: {
          webapp: webAppHostname,
        },
      });

      return {
        ...workingSet,
        botChannelResult: { botName: displayName },
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.BOT_REGISTRATION_ERROR, stringifyError(err));
    }
  };
};

export const getBotChannelProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration', 'webApp'],
    getRecommendationForProject: (project) => 'required',
    provision: botChannelProvisionMethod(config),
    canPollStatus: false,
  };
};
