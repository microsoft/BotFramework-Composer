// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from './throwNotImplementedError';

const createAppInsightsService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(tokenCredentials, subscriptionId);

  /**
   * Creates (or updates) an Application Insights component.
   * */
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

  /**
   * Provisions an App Insights component in the given resource group. If the service already
   * exists, all properties will be updated with the given values.
   * @returns Promise<ComponentsCreateOrUpdateResponse>
   */
  const provision = async () => {
    throwNotImplementedError();
  };

  return {
    createOrUpdate,
    deleteMethod,
    get,
    list,
    listByResourceGroup,
    provision,
  };
};

export type AppInsightsService = ReturnType<typeof createAppInsightsService>;
