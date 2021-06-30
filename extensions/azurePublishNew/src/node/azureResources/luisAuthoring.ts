// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { FREE_COGNITIVE_SERVICES_TIER, COGNITIVE_SERVICES_GROUP_NAME } from './constants';
import { LuisAuthoringConfig } from './types';

export const luisAuthoringDefinition: ResourceDefinition = {
  key: 'luisAuthoring',
  description:
    'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis app authoring.',
  text: 'Microsoft Language Understanding Authoring Account',
  tier: FREE_COGNITIVE_SERVICES_TIER,
  group: COGNITIVE_SERVICES_GROUP_NAME,
};

const getLuisAuthoringProvisionMethod = (): ProvisionMethod => {
  return (config: LuisAuthoringConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    return workingSet;
  };
};

export const getLuisAuthoringProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => {
      return project.requiresLuisAuthoring; // tbd
    },
    provision: getLuisAuthoringProvisionMethod(),
    canPollStatus: false,
  };
};
