// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ProvisionMethod,
  ProvisionWorkingSet,
  ResourceDefinition,
  ResourceProvisionService,
} from '../provisionService';
import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import { AZURE_HOSTING_GROUP_NAME } from '../getResources';

export const azureFunctionsDefinition: ResourceDefinition = {
  key: 'azureFunctions',
  description: 'Azure Functions hosting your bot services.',
  text: 'Azure Functions',
  tier: 'S1 Standard',
  group: AZURE_HOSTING_GROUP_NAME,
};

const getAzureFunctionsProvisionMethod = (): ProvisionMethod => {
  return <TConfig>(config: TConfig, workingSet: ProvisionWorkingSet): ProvisionWorkingSet => {
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
      return runtimeType === 'functions' ? 'required' : 'invalid';
    },
    provision: getAzureFunctionsProvisionMethod(),
  };
};
