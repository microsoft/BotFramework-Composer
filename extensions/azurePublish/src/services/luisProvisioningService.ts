// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

const createLuisProvisioningService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);

  /**
   * Creates Cognitive Services Account
   * */
  const create = async () => {
    throwNotImplementedError();
  };

  /**
   * Updates a Cognitive Services Account
   * */
  const update = async () => {
    throwNotImplementedError();
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  /**
   * Returns a Cognitive Services Account
   * */
  const getProperties = async () => {
    throwNotImplementedError();
  };

  const list = async () => {
    throwNotImplementedError();
  };

  const listByResourceGroup = async () => {
    throwNotImplementedError();
  };

  /**
   * Lists the account keys for the specified Cognitive Services account.
   */
  const listKeys = async () => {
    throwNotImplementedError();
  };

  /**
   * Creates or updates Cognitive Services Account
   * Can be used for provisioning Luis Authoring or Prediction Services
   */
  const provision = async () => {
    throwNotImplementedError();
  };

  return {
    create,
    deleteMethod,
    getProperties,
    list,
    listKeys,
    listByResourceGroup,
    provision,
    update,
  };
};

export type LuisProvisionService = ReturnType<typeof createLuisProvisioningService>;
