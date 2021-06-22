// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ProvisionMethod,
  ProvisionWorkingSet,
  ResourceDefinition,
  ResourceProvisionService,
} from '../provisionService';

type AppRegistrationConfig = ResourceConfig & {
  key: 'appRegistration';
  name: string;
  location: string;
  resourceGroupName: string;
};

export type AppRegistrationResult = {
  key: 'appRegistration';
  appId: string;
  appPassword: string;
};

export const appRegistrationDefinition: ResourceDefinition = {
  key: 'appRegistration',
  text: 'Microsoft Application Registration',
  description: 'Required registration allowing your bot to communicate with Azure services.',
  tier: 'Free',
  group: 'Azure Hosting',
};

const getAppRegistrationProvisionMethod = (): ProvisionMethod => {
  return <TConfig>(config: TConfig, workingSet: ProvisionWorkingSet): ProvisionWorkingSet => {
    // const displayName = config.hostname;
    const provisionResult = { appId: '', appPassword: '' };

    return {
      ...workingSet,
      appRegistration: provisionResult,
    };
  };
};

export const getAppRegistrationProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    getRecommendationForProject: (project) => 'required',
    provision: getAppRegistrationProvisionMethod(),
  };
};
