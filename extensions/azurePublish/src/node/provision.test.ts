// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotProjectProvision, ProvisionConfig } from './provision';

const mockConfig = {
  logger: console.log,
  accessToken: 'accessToken',
  graphToken: 'graphToken',
  hostname: 'hostname',
  externalResources: [],
  location: {
    id: 'local',
    name: 'local',
    displayName: 'westus',
  },
  luisLocation: '',
  name: 'profileName',
  type: 'azurepublish',
  subscription: 'test',
} as ProvisionConfig;
const azProvision = new BotProjectProvision(mockConfig);

const mockGet = jest.fn();
jest.mock('request-promise', () => {
  return { get: async (...args) => await mockGet(args), RequestPromiseOptions: {} };
});

describe('provision', () => {});
