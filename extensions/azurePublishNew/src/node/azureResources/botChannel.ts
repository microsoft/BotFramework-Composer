// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ProvisionMethod,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from '../provisionService';
import { AZURE_HOSTING_GROUP_NAME } from '../getResources';

import { AppRegistrationResult } from './appRegistration';
import { WebAppResult } from './webApp';

type BotServiceConfig = ResourceConfig & {
  key: 'botChannel';
  name: string;
  resourceGroupName: string;
};

type BotChannelResult = {
  botName: string;
};

export const botRegistrationDefinition: ResourceDefinition = {
  key: 'botRegistration',
  text: 'Microsoft Bot Channels Registration',
  description:
    'When registered with the Azure Bot Service, you can host your bot in any environment and enable customers from a variety of channels, such as your app or website, Direct Line Speech, Microsoft Teams and more.',
  tier: 'F0',
  group: AZURE_HOSTING_GROUP_NAME,
};

const getBotChannelProvisionMethod = (): ProvisionMethod => (
  config: BotServiceConfig,
  workingSet: ProvisionWorkingSet
): ProvisionWorkingSet => {
  const appRegistrationResult: AppRegistrationResult = workingSet.appRegistration;
  const webAppResult: WebAppResult = workingSet.webApp;
  const { appId } = appRegistrationResult.appId;
  const { endpoint } = webAppResult.endpoint;
  const { hostname } = webAppResult.hostname;

  const provisionResult: BotChannelResult = { botName: '' };

  return {
    ...workingSet,
    botChannelResult: provisionResult,
  };
};

export const getBotChannelProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration', 'webApp'],
    getRecommendationForProject: (project) => 'required',
    provision: getBotChannelProvisionMethod(),
  };
};
