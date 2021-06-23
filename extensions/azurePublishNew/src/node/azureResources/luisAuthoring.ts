// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { COGNITIVE_SERVICES_GROUP_NAME } from '../getResources';
import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { LuisAuthoringConfig } from './types';

export const luisAuthoringDefinition: ResourceDefinition = {
  key: 'luisAuthoring',
  description:
    'Language Understanding (LUIS) is a natural language processing service that enables you to understand human language in your own application, website, chatbot, IoT device, and more. Used for Luis app authoring.',
  text: 'Microsoft Language Understanding Authoring Account',
  tier: 'F0',
  group: COGNITIVE_SERVICES_GROUP_NAME,
};

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
