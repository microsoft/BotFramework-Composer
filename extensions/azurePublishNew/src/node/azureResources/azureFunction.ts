// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import { AZURE_HOSTING_GROUP_NAME } from '../getResources';
import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { AzureFunctionConfig } from './types';

export const azureFunctionsDefinition: ResourceDefinition = {
  key: 'azureFunctions',
  description: 'Azure Functions hosting your bot services.',
  text: 'Azure Functions',
  tier: 'S1 Standard',
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
  };
};
