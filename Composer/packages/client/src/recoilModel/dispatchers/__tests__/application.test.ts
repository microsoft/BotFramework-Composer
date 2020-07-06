// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { applicationDispatcher } from '../application';
import { AppUpdaterStatus } from '../../../constants';

import { mockCallback } from './testUtils';

describe('the application dispatcher', () => {
  describe('setAppUpdateStatus', async () => {
    const status = AppUpdaterStatus.IDLE;
    const version = '1.2.3';
    applicationDispatcher.setAppUpdateStatus(mockCallback)(status, version);
  });
});
