// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { throwNotImplementedError } from '../throwNotImplementedError';

/*
 * Service for managing an Azure App with the Microsoft identity platform
 * The provisioning of an App Registration provides an integrated identity configuration for the app with the Microsoft identity platform
 * Relies on the Microsoft Graph API - Azure Active Directory API
 * https://docs.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0
 */
export const createAppRegistrationService = () => {
  const checkNameAvailability = async () => {
    throwNotImplementedError();
  };

  const list = async () => {
    throwNotImplementedError();
  };

  const listByResourceGroup = async () => {
    throwNotImplementedError();
  };

  const get = async () => {
    throwNotImplementedError();
  };

  const create = async () => {
    throwNotImplementedError();
  };

  const update = async () => {
    throwNotImplementedError();
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  /**
   * Provisions App. If the App is already registered,
   * all properties will be updated with the given values.
   * Provision Steps:
   * - Creates or updates App Registration
   * - Creates or updates the App Password
   * returns App Registration
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

export type AppRegistrationService = ReturnType<typeof createAppRegistrationService>;
