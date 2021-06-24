// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { AzureFunctionConfig } from './types';

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
