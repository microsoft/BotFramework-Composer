// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from '@botframework-composer/types';

export type ProvisionWorkingSet = Record<string, object>;

export type OnProvisionProgress = (status: number, message: string) => void;

export type ProvisionMethod = (
  config: ResourceConfig,
  workingSet: ProvisionWorkingSet,
  onProgress?: OnProvisionProgress
) => Promise<ProvisionWorkingSet>;

export type ResourceProvisionService = {
  getDependencies: () => string[];
  getRecommendationForProject: (project: IBotProject) => 'required' | 'optional' | 'notAllowed';
  provision: ProvisionMethod;
  canPollStatus: boolean;
};

type ResourceDefinitionGroup = 'App Services' | 'Cognitive Services';

export type ResourceDefinition = {
  key: string;
  text: string;
  description: string;
  tier: string;
  group: ResourceDefinitionGroup;
  dependencies: string[];
};

export type GetResourcesResult = ResourceDefinition & {
  required: boolean;
};

export type ProvisionConfig = {
  key: string;
  accessToken: string;
  subscriptionId: string;
  graphToken: string;
};

export type ResourceConfig = {
  key: string;
};
