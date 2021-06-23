// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AZURE_HOSTING_GROUP_NAME } from '../getResources';
import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { BlobStorageConfigNew } from './types';

export const blobStorageDefinition: ResourceDefinition = {
  key: 'blobStorage',
  description:
    'Azure blob storage provides scalable cloud storage, backup and recovery solutions for any data, including bot transcript logs.',
  text: 'Azure Blob Storage',
  tier: 'Standard_LRS',
  group: AZURE_HOSTING_GROUP_NAME,
};

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
    getDependencies: () => ['appRegistration'],
    getRecommendationForProject: (project) => 'optional',
    provision: getBlobStorageProvisionMethod(),
  };
};
