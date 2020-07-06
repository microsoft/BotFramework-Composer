// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { applicationDispatcher } from '../application';
import { AppUpdaterStatus } from '../../../constants';

const dispatcher = applicationDispatcher();

describe('the application dispatcher', () => {
  describe('setAppUpdateStatus', async () => {
    const status = AppUpdaterStatus.IDLE;
    const version = '1.2.3';
    const callback = await dispatcher.setAppUpdateStatus(status, version);
  });
});
