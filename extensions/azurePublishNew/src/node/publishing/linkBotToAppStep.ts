// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AzureBotService } from '@azure/arm-botservice';
import { TokenCredentials } from '@azure/ms-rest-js';

import { OnPublishProgress } from './types';

type StepConfig = {
  accessToken: string;
  botName: string;
  hostname: string;
  resourceGroupName: string;
  subscriptionId: string;
};

export const linkBotToAppStep = async (config: StepConfig, onProgress: OnPublishProgress): Promise<void> => {
  const { accessToken, botName, hostname, resourceGroupName, subscriptionId } = config;

  if (!subscriptionId || !hostname || !resourceGroupName || !botName) {
    onProgress(400, 'Skipped linking bot with app service. Settings Missing.');
    return;
  }

  onProgress(202, 'Linking bot with app service...');

  const creds = new TokenCredentials(accessToken);
  const azureBotSerivce = new AzureBotService(creds, subscriptionId);

  const getBotResult = await azureBotSerivce.bots.get(resourceGroupName, botName);

  // The _response is the underlying HTTP responst
  // eslint-disable-next-line no-underscore-dangle
  const getBotResponse = getBotResult?._response;
  if (getBotResponse?.status >= 300) {
    throw new Error(`Failed to get bot information. ${getBotResponse?.bodyAsText}`);
  }

  //TODO: The getBotResult is a bot if successful, consider removing using the parsedBody here
  const bot = getBotResponse.parsedBody;
  bot.properties.endpoint = `https://${hostname}.azurewebsites.net/api/messages`;

  const botUpdateResult = await azureBotSerivce.bots.update(resourceGroupName, botName, {
    tags: {
      webapp: hostname,
    },
    properties: bot.properties,
  });

  if (botUpdateResult?._response?.status >= 300) {
    throw new Error(`Failed to link bot to app service. ${getBotResponse?.bodyAsText}`);
  }

  onProgress(202, 'Linked bot with app service');
};
