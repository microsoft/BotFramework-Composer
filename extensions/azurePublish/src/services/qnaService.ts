// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { SearchManagementClient } from '@azure/arm-search';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

const createQNAService = (token: string, subscriptionId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokenCredentials = new TokenCredentials(token) as any;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchManagementClient = new SearchManagementClient(tokenCredentials, subscriptionId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, subscriptionId);

  const checkNameAvailability = async () => {
    throwNotImplementedError();
  };

  const createOrUpdate = async () => {
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
   * Provisions QNA service in the given resource group. If the QNA service already
   * exists, all properties will be updated with the given values.
   * Provisioning Steps:
   * - Creates or updates the QNA Servce
   * - Creates or updates the App Service Plan
   * - Creates or updates the App Insights Component
   * - Creates or updates the QNA Host WebApp
   * @returns Promise<Models.ServicesCreateOrUpdateResponse>
   */
  const provision = async () => {
    throwNotImplementedError();
  };

  return {
    checkNameAvailability,
    createOrUpdate,
    deleteMethod,
    get,
    list,
    listByResourceGroup,
    update,
    provision,
  };
};

export type QNAService = ReturnType<typeof createQNAService>;
