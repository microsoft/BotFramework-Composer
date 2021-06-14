// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { CosmosDBManagementClient } from '@azure/arm-cosmosdb';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from '../throwNotImplementedError';

export const createCosmosDBService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cosmosDBManagementClient = new CosmosDBManagementClient(tokenCredentials, subscriptionId);

  const checkNameAvailability = async () => {
    throwNotImplementedError();
  };

  const create = async () => {
    throwNotImplementedError();
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  const get = async () => {
    throwNotImplementedError();
  };

  const list = async () => {
    throwNotImplementedError();
  };

  const listByResourceGroup = async () => {
    throwNotImplementedError();
  };

  const update = async () => {
    throwNotImplementedError();
  };

  /**
   * Provisions Cosmos DB service in the given resource group. If the service already
   * exists, all properties will be updated with the given values.
   * Provisioning Steps:
   * - Creates or updates the Cosmos DB Account
   * - Creates or updates the Cosmos DB SQL Database
   * - Creates or updates the Cosmos DB SQL Container
   * Returns Success/Fail ?
   */
  const provision = async () => {
    throwNotImplementedError();
  };

  return {
    checkNameAvailability,
    create,
    deleteMethod,
    get,
    list,
    listByResourceGroup,
    provision,
    update,
  };
};

export type CosmosDBService = ReturnType<typeof createCosmosDBService>;
