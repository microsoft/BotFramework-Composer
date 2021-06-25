// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { PAY_AS_YOU_GO_TIER, AZURE_HOSTING_GROUP_NAME } from './constants';
import { CosmosDbConfig } from './types';

export const cosmosDbDefinition: ResourceDefinition = {
  key: 'cosmosDb',
  description:
    'Azure Cosmos DB is a fully managed, globally-distributed, horizontally scalable in storage and throughput, multi-model database service backed up by comprehensive SLAs. It will be used for bot state retrieving.',
  text: 'Azure Cosmos DB',
  tier: PAY_AS_YOU_GO_TIER,
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
    getDependencies: () => [],
    getRecommendationForProject: (project) => 'optional',
    provision: getCosmosDbProvisionMethod(),
  };
};
