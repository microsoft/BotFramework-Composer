// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ProvisionMethod, ProvisionWorkingSet, ResourceDefinition, ResourceProvisionService } from '../types';

import { PAY_AS_YOU_GO_TIER, AZURE_HOSTING_GROUP_NAME } from './constants';
import { AppInsightsConfigNew } from './types';

export const appInsightsDefinition: ResourceDefinition = {
  key: 'appInsights',
  description: 'Application Insights allows you to monitor and analyze usage and performance of your bot.',
  text: 'Application Insights',
  tier: PAY_AS_YOU_GO_TIER,
  group: AZURE_HOSTING_GROUP_NAME,
};

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
    canPollStatus: false,
  };
};
