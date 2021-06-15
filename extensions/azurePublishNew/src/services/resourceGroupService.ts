// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ResourceManagementClient } from '@azure/arm-resources';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

const sleep = (waitTimeInMs: number) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

const runWithRetry = async (requestOperation: () => Promise<any>, numOfRetries = 2) => {
  let result;
  let retryCount = numOfRetries;

  while (retryCount >= 0) {
    try {
      result = await requestOperation();
    } catch (err) {
      if (retryCount == 0) {
        const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
        throw new Error(errorMessage);
      } else {
        // if auth expired, don't retry...
        await sleep(3000);
        retryCount--;
        continue;
      }
    }

    break;
  }

  return result;
};

const wrapWithRetry = (operation: () => Promise<any>) => {
  return () => runWithRetry(operation);
};

const runWithErrorHandling = async (operation: () => Promise<any>) => {
  try {
    const result = await operation();
    return result;
  } catch (e) {
    return e;
  }
};

const runWithRetryAndErrorHandling = (operation: () => Promise<any>) => {
  return runWithErrorHandling(wrapWithRetry(operation));
};

export const createResourceGroupService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  const client = new ResourceManagementClient(tokenCredentials, subscriptionId);

  const list = async () => {
    const listOperation = () => client.resourceGroups.list();
    return await runWithRetryAndErrorHandling(listOperation);
  };

  const get = async (resourceGroupName: string) => {
    const getOperation = () => client.resourceGroups.get(resourceGroupName);
    return await runWithRetryAndErrorHandling(getOperation);
  };

  const update = async () => {
    throwNotImplementedError();
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  const create = async () => {
    throwNotImplementedError();
  };

  const checkNameAvailability = async (resourceGroupName: string) => {
    const checkExistenceOperation = () => client.resourceGroups.checkExistence(resourceGroupName);
    return await runWithRetryAndErrorHandling(checkExistenceOperation);
  };

  return {
    checkNameAvailability,
    create,
    deleteMethod,
    get,
    list,
    update,
  };
};

export type ResourceGroupService = ReturnType<typeof createResourceGroupService>;
