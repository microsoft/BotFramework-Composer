// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { AzureBotService } from '@azure/arm-botservice';

import {
  ProvisionConfig,
  ProvisionMethod,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceProvisionService,
} from '../types';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';

type BotServiceConfig = ResourceConfig & {
  key: 'botChannel';
  displayName: string;
  hostname: string; // probably should be derived from webapp, not here
  resourceGroupName: string;
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
