// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { StorageManagementClient } from '@azure/arm-storage';

import {
  ProvisionMethod,
  ProvisionServiceConfig,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from '../types';
import { AzureResourceTypes } from '../constants';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';

import { AZURE_HOSTING_GROUP_NAME, STANDARD_LRS_TIER } from './constants';

export const blobStorageDefinition: ResourceDefinition = {
  key: 'blobStorage',
  description:
    'Azure blob storage provides scalable cloud storage, backup and recovery solutions for any data, including bot transcript logs.',
  text: 'Azure Blob Storage',
  tier: STANDARD_LRS_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
  dependencies: [AzureResourceTypes.RESOURCE_GROUP],
};

type SkuName =
  | 'Standard_LRS'
  | 'Standard_GRS'
  | 'Standard_RAGRS'
  | 'Standard_ZRS'
  | 'Premium_LRS'
  | 'Premium_ZRS'
  | 'Standard_GZRS'
  | 'Standard_RAGZRS';

export type BlobStorageConfig = ResourceConfig & {
  key: 'blobStorage';
  resourceGroupName: string;
  name: string;
  location: string;
  skuName?: SkuName;
};

const blobStorageProvisionMethod = (provisionConfig: ProvisionServiceConfig): ProvisionMethod => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const storageManagementClient = new StorageManagementClient(tokenCredentials, provisionConfig.subscriptionId);

  return async (config: BlobStorageConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    try {
      await storageManagementClient.storageAccounts.create(config.resourceGroupName, config.name, {
        location: config.location,
        kind: 'StorageV2',
        sku: {
          name: config.skuName ?? 'Standard_LRS',
        },
      });

      const accountKeysResult = await storageManagementClient.storageAccounts.listKeys(
        config.resourceGroupName,
        config.name
      );
      const connectionString = accountKeysResult?.keys?.[0]?.value ?? '';

      const provisionResult = { name: config.name, connectionString, container: 'transcripts' };

      return {
        ...workingSet,
        blobStorage: provisionResult,
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.CREATE_BLOB_STORAGE_ERROR, stringifyError(err));
    }
  };
};

export const getBlogStorageProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => 'optional',
    provision: blobStorageProvisionMethod(config),
    canPollStatus: false,
  };
};
