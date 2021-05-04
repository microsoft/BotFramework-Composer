// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

jest.mock('electron', () => ({
  app: {
    getVersion: jest.fn().mockReturnValue('v1.0.0'),
  },
}));
