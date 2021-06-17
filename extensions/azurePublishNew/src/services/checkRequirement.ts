// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createCustomizeError, ProvisionErrors } from '../../../azurePublish/src/node/utils/errorHandler';

export const checkRequirement = (fulfillsRequirement: boolean, errorType: ProvisionErrors, errorMsg: string): void => {
  if (!fulfillsRequirement) {
    throw createCustomizeError(errorType, errorMsg);
  }
};
