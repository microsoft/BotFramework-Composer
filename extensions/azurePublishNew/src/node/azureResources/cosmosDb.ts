// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { CosmosDbConfig } from './types';

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
