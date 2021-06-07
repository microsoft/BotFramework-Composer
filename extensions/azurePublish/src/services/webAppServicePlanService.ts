// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebSiteManagementClient } from '@azure/arm-appservice';
import { TokenCredentials } from '@azure/ms-rest-js';

import { WebAppConfig } from '../azureResourceManager/azureResourceManagerConfig';

import { throwNotImplementedError } from './throwNotImplementedError';

const createWebAppServicePlanService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, subscriptionId);

  const createOrUpdate = async (config: WebAppConfig) => {
    return await webSiteManagementClient.appServicePlans.createOrUpdate(config.resourceGroupName, config.name, {
      location: config.location,
      sku: {
        name: 'S1',
        tier: 'Standard',
        size: 'S1',
        family: 'S',
        capacity: 1,
      },
    });
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

  return {
    createOrUpdate,
    deleteMethod,
    get,
    list,
    listByResourceGroup,
    update,
  };
};

export type createWebAppServicePlanService = ReturnType<typeof createWebAppServicePlanService>;
