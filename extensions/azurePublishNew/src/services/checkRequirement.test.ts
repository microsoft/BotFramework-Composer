// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createCustomizeError, ProvisionErrors } from '../../../azurePublish/src/node/utils/errorHandler';

import { checkRequirement } from './checkRequirement';

jest.mock('../../../azurePublish/src/node/utils/errorHandler');

describe('checkRequirement', () => {
  it('should throw error for failed requirement', async () => {
    try {
      checkRequirement(false, ProvisionErrors.CREATE_APP_REGISTRATION, 'OH NO');
      fail('Should have thrown error');
    } catch {
      expect(createCustomizeError).toHaveBeenCalled();
    }
  });

  it('should not throw error if requirement fulfilled', async () => {
    try {
      checkRequirement(true, ProvisionErrors.CREATE_APP_REGISTRATION, 'NOT AGAIN');
    } catch (err) {
      fail(`Should have passed. Error: ${err}`);
    }
  });
});
