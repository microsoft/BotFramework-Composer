// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AZURE_HOSTING_GROUP_NAME } from '../getResources';
import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { CosmosDbConfig } from './types';

const getCosmosDbConfig: CosmosDbConfig = () => {
  return {
    name: '',
    location: '',
    resourceGroupName: '',
  };
};

export const cosmosDbDefinition = {
  key: 'cosmosDb',
  description:
    'Azure Cosmos DB is a fully managed, globally-distributed, horizontally scalable in storage and throughput, multi-model database service backed up by comprehensive SLAs. It will be used for bot state retrieving.',
  text: 'Azure Cosmos DB',
  tier: 'Pay as you go',
  group: AZURE_HOSTING_GROUP_NAME,
};

const getCosmosDbProvisionMethod = (): ProvisionMethod => {
  return (config: CosmosDbConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    const provisionResult = {};

    return {
      ...workingSet,
      cosmosDb: provisionResult,
    };
  };
};

export const getCosmosDbProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration'],
    getRecommendationForProject: (project) => 'optional',
    provision: getCosmosDbProvisionMethod(),
  };
};
