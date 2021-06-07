// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AzureBotService } from '@azure/arm-botservice';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

export const createBotRegistrationService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const azureBotSerivce = new AzureBotService(tokenCredentials, subscriptionId);

  const list = async () => {
    throwNotImplementedError();
  };

  const listByResourceGroup = async () => {
    throwNotImplementedError();
  };

  const getCheckNameAvailability = async () => {
    throwNotImplementedError();
  };

  const create = async () => {
    throwNotImplementedError();
  };

  const get = async () => {
    throwNotImplementedError();
  };

  const update = async () => {
    throwNotImplementedError();
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  /**
   * Creates or updates a Bot Service for given resource group
   */
  const provision = async () => {
    throwNotImplementedError();
  };

  return {
    create,
    get,
    getCheckNameAvailability,
    deleteMethod,
    update,
    list,
    listByResourceGroup,
    provision,
  };
};

export type BotRegistrationService = ReturnType<typeof createBotRegistrationService>;
