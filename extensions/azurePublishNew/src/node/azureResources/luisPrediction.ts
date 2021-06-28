// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { SO_STANDARD_TIER, COGNITIVE_SERVICES_GROUP_NAME } from './constants';
import { LuisPredictionConfig } from './types';

export const luisPredictionDefinition: ResourceDefinition = {
  key: 'luisPrediction',
  description:
    'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis endpoint hitting.',
  text: 'Microsoft Language Understanding Prediction Account',
  tier: SO_STANDARD_TIER,
  group: COGNITIVE_SERVICES_GROUP_NAME,
};

const getLuisPredictionProvisionMethod = (): ProvisionMethod => {
  return (config: LuisPredictionConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    return workingSet;
  };
};

export const getLuisPredictionProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => {
      return project.requiresLuisPrediction; // tbd
    },
    provision: getLuisPredictionProvisionMethod(),
    canPollStatus: false,
  };
};
