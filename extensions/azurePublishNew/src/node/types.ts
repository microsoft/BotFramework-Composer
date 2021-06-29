// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from '@botframework-composer/types';

export type ProvisionWorkingSet = Record<string, object>;
export type ProvisionMethod = (config: ResourceConfig, workingSet: ProvisionWorkingSet) => Promise<ProvisionWorkingSet>;
export type ResourceProvisionService = {
  getDependencies: () => string[];
  getRecommendationForProject: (project: IBotProject) => 'required' | 'optional' | 'notAllowed';
  provision: ProvisionMethod;
};

type ResourceDefinitionGroup = 'App Services' | 'Cognitive Services';

export type ResourceDefinition = {
  key: string;
  text: string;
  description: string;
  tier: string;
  group: ResourceDefinitionGroup;
};

export type GetResourcesResult = ResourceDefinition & {
  required: boolean;
};

export type ProvisionConfig = {
  key: string;
  credentials: ProvisionCredentials;
  subscriptionId: string;
  resourceGroupName: string;
  location: string;
  webAppName: string;
  serverFarm: string;
};

export type ProvisionCredentials = {
  token: string;
  graphToken?: string;
};

export type ResourceConfig = {
  key: string;
};
