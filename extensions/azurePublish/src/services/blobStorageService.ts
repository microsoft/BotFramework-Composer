// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { StorageManagementClient } from '@azure/arm-storage';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

const createBlobStorageService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const storageManagementClient = new StorageManagementClient(tokenCredentials, subscriptionId);

  const checkNameAvailability = async () => {
    throwNotImplementedError();
  };

  const create = async () => {
    throwNotImplementedError();
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  /**
   * Returns the properties for the specified storage account
   */
  const getProperties = async () => {
    throwNotImplementedError();
  };

  const list = async () => {
    throwNotImplementedError();
  };

  const listByResourceGroup = async () => {
    throwNotImplementedError();
  };

  const listKeys = async () => {
    throwNotImplementedError();
  };

  const update = async () => {
    throwNotImplementedError();
  };

  /**
   * Creates or updates a Blob Storage Account for given resource group
   */
  const provision = async () => {
    throwNotImplementedError();
  };

  return {
    checkNameAvailability,
    create,
    deleteMethod,
    getProperties,
    list,
    listByResourceGroup,
    listKeys,
    update,
    provision,
  };
};

export type BlobStorageService = ReturnType<typeof createBlobStorageService>;
