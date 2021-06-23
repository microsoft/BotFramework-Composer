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
export type ResourceDefinition = {
  key: string;
  text: string;
  description: string;
  tier: string;
  group: string;
};
export type GetResourcesResult = ResourceDefinition & {
  required: boolean;
};
export type ProvisionConfig = {
  key: string;
};
export type ProvisionCredentials = {
  token: string;
  graphToken: string;
  subscriptionId: string;
};
export type ResourceConfig = {
  key: string;
};
