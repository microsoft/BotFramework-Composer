// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import { CosmosDBManagementClient } from '@azure/arm-cosmosdb';

import {
  ProvisionServiceConfig,
  ProvisionMethod,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from '../types';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';

import { AZURE_HOSTING_GROUP_NAME, PAY_AS_YOU_GO_TIER } from './constants';

export const cosmosDbDefinition: ResourceDefinition = {
  key: 'cosmosDb',
  description:
    'Azure Cosmos DB is a fully managed, globally-distributed, horizontally scalable in storage and throughput, multi-model database service backed up by comprehensive SLAs. It will be used for bot state retrieving.',
  text: 'Azure Cosmos DB',
  tier: PAY_AS_YOU_GO_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
};

type CosmosDbProvisionResult = {
  authKey: string;
  cosmosDbEndpoint: string;
  databaseId: string;
  containerId: string;
  collectionId: string;
};

type CosmosDbConfig = ResourceConfig & {
  key: 'cosmosDb';
  resourceGroupName: string;
  displayName: string;
  databaseName: string;
  location: string;
  containerName: string;
};

const cosmosDbProvisionMethod = (provisionConfig: ProvisionServiceConfig): ProvisionMethod => {
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const cosmosDBManagementClient = new CosmosDBManagementClient(tokenCredentials, provisionConfig.subscriptionId);

  const createDbAccount = async (config: CosmosDbConfig) => {
    return await cosmosDBManagementClient.databaseAccounts.createOrUpdate(
      config.resourceGroupName,
      config.displayName,
      {
        location: config.location,
        locations: [
          {
            locationName: config.location,
            failoverPriority: 0,
          },
        ],
      }
    );
  };

  const createDb = async (config: CosmosDbConfig) => {
    await cosmosDBManagementClient.sqlResources.createUpdateSqlDatabase(
      config.resourceGroupName,
      config.displayName,
      config.databaseName,
      {
        resource: {
          id: config.databaseName,
        },
        options: {},
      }
    );
  };

  const createContainer = async (config: CosmosDbConfig) => {
    await cosmosDBManagementClient.sqlResources.createUpdateSqlContainer(
      config.resourceGroupName,
      config.displayName,
      config.databaseName,
      config.containerName,
      {
        resource: {
          id: config.containerName,
          indexingPolicy: {
            indexingMode: 'Consistent',
            automatic: true,
            includedPaths: [
              {
                path: '/*',
              },
            ],
            excludedPaths: [
              {
                path: '/"_etag"/?',
              },
            ],
          },
          partitionKey: {
            paths: ['/id'],
            kind: 'Hash',
          },
          conflictResolutionPolicy: {
            mode: 'LastWriterWins',
            conflictResolutionPath: '/_ts',
          },
        },
        options: {},
      }
    );
  };

  const getAuthKey = async (config: CosmosDbConfig) => {
    return await cosmosDBManagementClient.databaseAccounts.listKeys(config.resourceGroupName, config.displayName);
  };

  const provision = () => async (
    config: CosmosDbConfig,
    workingSet: ProvisionWorkingSet
  ): Promise<ProvisionWorkingSet> => {
    try {
      const { documentEndpoint } = await createDbAccount(config);
      await createDb(config);
      await createContainer(config);
      const { primaryMasterKey } = await getAuthKey(config);

      const provisionResult: CosmosDbProvisionResult = {
        authKey: primaryMasterKey,
        cosmosDbEndpoint: documentEndpoint,
        databaseId: config.databaseName,
        containerId: config.containerName,
        collectionId: 'botstate-collection',
      };

      return {
        ...workingSet,
        cosmosDb: provisionResult,
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.CREATE_COSMOSDB_ERROR, stringifyError(err));
    }
  };

  return provision();
};

export const getCosmosDbProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => 'optional',
    provision: cosmosDbProvisionMethod(config),
    canPollStatus: true,
  };
};
