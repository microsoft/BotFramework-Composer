// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { COGNITIVE_SERVICES_GROUP_NAME } from '../getResources';
import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { LuisPredictionConfig } from './types';

export const luisPredictionDefinition: ResourceDefinition = {
  key: 'luisPrediction',
  description:
    'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis endpoint hitting.',
  text: 'Microsoft Language Understanding Prediction Account',
  tier: 'S0 Standard',
  group: COGNITIVE_SERVICES_GROUP_NAME,
};

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
