// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../provisionService';
import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import { AZURE_HOSTING_GROUP_NAME } from '../getResources';

export const servicePlanDefinition = {
  key: 'servicePlan',
  description:
    'App Service plans give you the flexibility to allocate specific apps to a given set of resources and further optimize your Azure resource utilization. This way, if you want to save money on your testing environment you can share a plan across multiple apps.',
  text: 'Microsoft App Service Plan',
  tier: 'S1 Standard',
  group: AZURE_HOSTING_GROUP_NAME,
};

const getAppServiceProvisionMethod = (): ProvisionMethod => {
  return <TConfig>(config: TConfig, workingSet: ProvisionWorkingSet): ProvisionWorkingSet => {
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
      return runtimeType !== 'functions' ? 'required' : 'invalid';
    },
    provision: getAppServiceProvisionMethod(),
  };
};
