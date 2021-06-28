// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { AppRegistrationResult, BotChannelResult, BotServiceConfig, WebAppResult } from './types';

const getBotChannelProvisionMethod = (): ProvisionMethod => (
  config: BotServiceConfig,
  workingSet: ProvisionWorkingSet
): Promise<ProvisionWorkingSet> => {
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
    canPollStatus: false,
  };
};
