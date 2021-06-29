// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { S1_STANDARD_TIER, AZURE_HOSTING_GROUP_NAME } from './constants';
import { AppServiceConfig } from './types';

export const servicePlanDefinition: ResourceDefinition = {
  key: 'servicePlan',
  description:
    'App Service plans give you the flexibility to allocate specific apps to a given set of resources and further optimize your Azure resource utilization. This way, if you want to save money on your testing environment you can share a plan across multiple apps.',
  text: 'Microsoft App Service Plan',
  tier: S1_STANDARD_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
};

const getAppServiceProvisionMethod = (): ProvisionMethod => {
  return (config: AppServiceConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    const provisionResult = {};

    return {
      ...workingSet,
      appService: provisionResult,
    };
  };
};

export const getAppServiceProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration'],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType !== 'functions' ? 'required' : 'notAllowed';
    },
    provision: getAppServiceProvisionMethod(),
  };
};
