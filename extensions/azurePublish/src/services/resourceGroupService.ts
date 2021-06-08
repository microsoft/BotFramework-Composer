// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ResourceManagementClient } from '@azure/arm-resources';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

const createResourceGroupService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const client = new ResourceManagementClient(tokenCredentials, subscriptionId);

  const list = async () => {
    throwNotImplementedError();
  };

  const get = async () => {
    throwNotImplementedError();
  };

  const checkExistence = async () => {
    throwNotImplementedError();
  };

  const update = async () => {
    throwNotImplementedError();
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  const createOrUpdate = async () => {
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
