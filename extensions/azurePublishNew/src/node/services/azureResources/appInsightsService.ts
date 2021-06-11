// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from '../throwNotImplementedError';

const createAppInsightsService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(tokenCredentials, subscriptionId);

  const checkNameAvailability = async () => {
    throwNotImplementedError();
  };

  /**
   * Creates (or updates) an Application Insights component.
   * */
  const create = async () => {
    throwNotImplementedError();
  };

  const update = async () => {
    throwNotImplementedError();
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  const get = async () => {
    throwNotImplementedError();
  };

  /**
   * List by subscription
   * */
  const list = async () => {
    throwNotImplementedError();
  };

  /**
   * List by resource group
   * */
  const listByResourceGroup = async () => {
    throwNotImplementedError();
  };

  /**
   * Provisions an App Insights component in the given resource group. If the service already
   * exists, all properties will be updated with the given values.
   * Connects to the Bot Registration
   * @returns Promise<ComponentsCreateOrUpdateResponse>
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

export type AppInsightsService = ReturnType<typeof createAppInsightsService>;
