// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';
import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { AppServiceConfig } from './types';

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
