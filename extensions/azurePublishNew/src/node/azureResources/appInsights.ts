// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { AppInsightsConfigNew } from './types';

const getAppInsightsProvisionMethod = (): ProvisionMethod => {
  return (config: AppInsightsConfigNew, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    const provisionResult = { instrumentationKey: '', connectionString: '' };
    return {
      ...workingSet,
      appInsights: provisionResult,
    };
  };
};

export const getAppInsightsProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => ['botRegistration'],
    getRecommendationForProject: (project) => 'optional',
    provision: getAppInsightsProvisionMethod(),
  };
};
