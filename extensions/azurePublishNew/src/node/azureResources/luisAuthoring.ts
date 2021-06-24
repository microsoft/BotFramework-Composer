// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { LuisAuthoringConfig } from './types';

const getLuisAuthoringProvisionMethod = (): ProvisionMethod => {
  return (config: LuisAuthoringConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    return workingSet;
  };
};

export const getLuisAuthoringProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration'],
    getRecommendationForProject: (project) => {
      return project.requiresLuisAuthoring; // tbd
    },
    provision: getLuisAuthoringProvisionMethod(),
  };
};
