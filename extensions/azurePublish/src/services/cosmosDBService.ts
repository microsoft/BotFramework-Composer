// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { CosmosDBManagementClient } from '@azure/arm-cosmosdb';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

export const createCosmosDBService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cosmosDBManagementClient = new CosmosDBManagementClient(tokenCredentials, subscriptionId);

  const listAccounts = async () => {
    throwNotImplementedError();
  };

  const listAccountKeys = async () => {
    throwNotImplementedError();
  };

  const listDatabases = async () => {
    throwNotImplementedError();
  };

  const listContainers = async () => {
    throwNotImplementedError();
  };

  const getAccount = async () => {
    throwNotImplementedError();
  };

  const getDatabase = async () => {
    throwNotImplementedError();
  };

  const getContainer = async () => {
    throwNotImplementedError();
  };

  const createAccount = async () => {
    throwNotImplementedError();
  };

  const createDatabase = async () => {
    throwNotImplementedError();
  };

  const createContainer = async () => {
    throwNotImplementedError();
  };

  const deleteAccount = async () => {
    throwNotImplementedError();
  };

  const deleteDatabase = async () => {
    throwNotImplementedError();
  };

  const deleteContainer = async () => {
    throwNotImplementedError();
  };

  const updateAccount = async () => {
    throwNotImplementedError();
  };

  const updateDatabase = async () => {
    throwNotImplementedError();
  };

  const updateContainer = async () => {
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
    createAccount,
    createDatabase,
    createContainer,
    deleteAccount,
    deleteDatabase,
    deleteContainer,
    getAccount,
    getDatabase,
    getContainer,
    listAccounts,
    listAccountKeys,
    listDatabases,
    listContainers,
    updateAccount,
    updateDatabase,
    updateContainer,
    provision,
  };
};

export type CosmosDBService = ReturnType<typeof createCosmosDBService>;
