// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { BlobStorageConfigNew } from './types';

const getBlobStorageProvisionMethod = (): ProvisionMethod => {
  return (config: BlobStorageConfigNew, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    const provisionResult = {};

    return {
      ...workingSet,
      blobStorage: provisionResult,
    };
  };
};

export const getBlogStorageProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => 'optional',
    provision: getBlobStorageProvisionMethod(),
    canPollStatus: false,
  };
};
