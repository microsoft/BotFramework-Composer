// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { AzureBotService } from '@azure/arm-botservice';

import {
  ProvisionConfig,
  ProvisionMethod,
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

import { AZURE_HOSTING_GROUP_NAME, FREE_COGNITIVE_SERVICES_TIER } from './constants';

type BotServiceConfig = ResourceConfig & {
  key: 'botChannel';
  displayName: string;
  hostname: string; // probably should be derived from webapp, not here
  resourceGroupName: string;
};

export const botRegistrationDefinition: ResourceDefinition = {
  key: 'botRegistration',
  text: 'Microsoft Bot Channels Registration',
  description:
    'When registered with the Azure Bot Service, you can host your bot in any environment and enable customers from a variety of channels, such as your app or website, Direct Line Speech, Microsoft Teams and more.',
  tier: FREE_COGNITIVE_SERVICES_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
};

const botChannelProvisionMethod = (provisionConfig: ProvisionConfig): ProvisionMethod => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const azureBotService = new AzureBotService(tokenCredentials, provisionConfig.subscriptionId);

  return async (config: BotServiceConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    const appId = workingSet.appRegistration?.appId;
    const hostname = workingSet.webApp?.hostname;
    const endpoint = `https://${hostname ?? config.hostname + '.azurewebsites.net'}/api/messages`;

    try {
      await azureBotService.bots.create(config.resourceGroupName, config.displayName, {
        properties: {
          displayName: config.displayName,
          endpoint: endpoint ?? '',
          msaAppId: appId ?? '',
          openWithHint: 'bfcomposer://',
        },
        sku: {
          name: 'F0',
        },
        name: config.displayName,
        location: 'global',
        kind: 'azurebot',
        tags: {
          webapp: hostname,
        },
      });

      return {
        ...workingSet,
        botChannelResult: { botName: config.displayName },
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.BOT_REGISTRATION_ERROR, stringifyError(err));
    }
  };
};

export const getBotChannelProvisionService = (config: ProvisionConfig): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration', 'webApp'],
    getRecommendationForProject: (project) => 'required',
    provision: botChannelProvisionMethod(config),
    canPollStatus: false,
  };
};
