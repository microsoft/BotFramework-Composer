// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { S1_STANDARD_TIER, AZURE_HOSTING_GROUP_NAME } from './constants';
import { AzureFunctionConfig } from './types';

export const azureFunctionDefinition: ResourceDefinition = {
  key: 'azureFunctions',
  description: 'Azure Functions hosting your bot services.',
  text: 'Azure Functions',
  tier: S1_STANDARD_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
};

const getAzureFunctionsProvisionMethod = (): ProvisionMethod => {
  return (config: AzureFunctionConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    const provisionResult = { hostname: '' };
    return {
      ...workingSet,
      azureFunctions: provisionResult,
    };
  };
};

export const getAzureFunctionsProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration'],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType === 'functions' ? 'required' : 'notAllowed';
    },
    provision: getAzureFunctionsProvisionMethod(),
    canPollStatus: false,
  };
};
