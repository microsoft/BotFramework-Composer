// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { throwNotImplementedError } from './throwNotImplementedError';

/* Use Graph Client
https://www.npmjs.com/package/@microsoft/microsoft-graph-client
*/
export const createAppRegistrationService = () => {
  const checkExistence = async () => {
    throwNotImplementedError();
  };

  const listApps = async () => {
    throwNotImplementedError();
  };

  const getApp = async () => {
    throwNotImplementedError();
  };

  const createApp = async () => {
    throwNotImplementedError();
  };

  const updateApp = async () => {
    throwNotImplementedError();
  };

  const deleteApp = async () => {
    throwNotImplementedError();
  };

  const addPassword = async () => {
    throwNotImplementedError();
  };

  const updatePassword = async () => {
    throwNotImplementedError();
  };

  const deletePassword = async () => {
    throwNotImplementedError();
  };

  /**
   * Registers App. If the App is already registered,
   * all properties will be updated with the given values.
   * Registration Steps:
   * - Creates or updates App Registration
   * - Creates or updates the App Password
   * returns App Registration
   */
  const provision = async () => {
    throwNotImplementedError();
  };

  return {
    addPassword,
    checkExistence,
    createApp,
    deleteApp,
    deletePassword,
    getApp,
    listApps,
    provision,
    updateApp,
    updatePassword,
  };
};

export type AppRegistrationService = ReturnType<typeof createAppRegistrationService>;
