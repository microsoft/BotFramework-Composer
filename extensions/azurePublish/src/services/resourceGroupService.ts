/* eslint-disable @typescript-eslint/no-unused-vars */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ResourceManagementClient } from '@azure/arm-resources';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

const createResourceGroupService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  const client = new ResourceManagementClient(tokenCredentials, subscriptionId);

  const list = async () => {
    throwNotImplementedError();
  };

  const get = async (resourceGroupName: string) => {
    throwNotImplementedError();
  };

  const checkExistence = async (resourceGroupName: string) => {
    throwNotImplementedError();
  };

  const update = async (resourceGroupName: string) => {
    throwNotImplementedError();
  };

  const deleteMethod = async (resourceGroupName: string) => {
    throwNotImplementedError();
  };

  const createOrUpdate = async (resourceGroupName: string) => {
    throwNotImplementedError();
  };

  return {
    checkExistence,
    createOrUpdate,
    deleteMethod,
    get,
    list,
    update,
  };
};

export type ResourceGroupService = ReturnType<typeof createResourceGroupService>;
