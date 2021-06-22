// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ProvisionMethod,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from '../provisionService';
import { AZURE_HOSTING_GROUP_NAME } from '../getResources';
import { parseRuntimeKey } from '../../../../../Composer/packages/lib/shared';

type WebAppConfig = ResourceConfig & {
  key: 'webApp';
  name: string;
  location: string;
  resourceGroupName: string;
};

export type WebAppResult = {
  key: 'webApp';
  endpoint: string;
  hostname: string;
};

export const webAppResourceDefinition: ResourceDefinition = {
  key: 'webApp',
  description:
    'App Service Web Apps lets you quickly build, deploy, and scale enterprise-grade web, mobile, and API apps running on any platform. Hosting for your bot.',
  text: AZURE_HOSTING_GROUP_NAME,
  tier: 'S1 Standard',
  group: AZURE_HOSTING_GROUP_NAME,
};

const getWebAppProvisionMethod = (): ProvisionMethod => {
  return <TConfig>(config: TConfig, workingSet: ProvisionWorkingSet): ProvisionWorkingSet => {
    const appRegistrationResult = workingSet.appRegistration;
    const result = { hostname: '', endpoint: '' };
    return {
      ...workingSet,
      webAppResult: result,
    };
  };
};

export const getWebAppProvisionService = (): ResourceProvisionService => {
  return {
    getDependencies: () => ['appRegistration', 'servicePlan'],
    getRecommendationForProject: (project) => {
      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);
      return runtimeType !== 'functions' ? 'required' : 'invalid';
    },
    provision: getWebAppProvisionMethod(),
  };
};
