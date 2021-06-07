/* eslint-disable @typescript-eslint/no-unused-vars */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { throwNotImplementedError } from './throwNotImplementedError';

/* Use Graph Client
https://www.npmjs.com/package/@microsoft/microsoft-graph-client
*/
export const createAppRegistrationService = (graphToken: string) => {
  const checkExistence = async (displayName: string) => {
    throwNotImplementedError();
  };

  const listApps = async () => {
    throwNotImplementedError();
  };

  const getApp = async (displayName: string) => {
    throwNotImplementedError();
  };

  const createApp = async (displayName: string) => {
    throwNotImplementedError();
  };

  const updateApp = async (displayName: string) => {
    throwNotImplementedError();
  };

  const deleteApp = async (displayName: string) => {
    throwNotImplementedError();
  };

  const addPassword = async (displayName: string, appCreatedId: string) => {
    throwNotImplementedError();
  };

  const updatePassword = async (displayName: string) => {
    throwNotImplementedError();
  };

  const deletePassword = async (displayName: string) => {
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
  const provision = async (displayName: string) => {
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
