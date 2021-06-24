// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { LuisPredictionConfig } from './types';

const getLuisPredictionProvisionMethod = (): ProvisionMethod => {
  return (config: LuisPredictionConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    return workingSet;
  };
};

export const getLuisPredictionProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration'],
    getRecommendationForProject: (project) => {
      return project.requiresLuisPrediction; // tbd
    },
    provision: getLuisPredictionProvisionMethod(),
  };
};
