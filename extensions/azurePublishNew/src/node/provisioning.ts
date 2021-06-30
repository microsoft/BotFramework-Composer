// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import toposort from 'toposort';
import { ResourceConfig } from './types';

// --------------------------------------------------------------------------------
// In this section are things that need to be moved and have overlaps resolved.
// --------------------------------------------------------------------------------

// This is what we have to remain compatible with
export type ProvisionConfig2 = {
  accessToken: string;
  graphToken: string;
  tenantId?: string;
  hostname: string; // for previous bot, it's ${name}-${environment}
  externalResources: { key: string }[];
  location: string;
  luisLocation: string;
  appServiceOperatingSystem?: string;
  subscription: string;
  resourceGroup?: string;
  logger?: (string) => any;
  name: string; // profile name
  type: string; // webapp or function
  /**
   * The worker runtime language for Azure functions.
   * Currently documented values: dotnet, node, java, python, or powershell
   */
  workerRuntime?: string;
  choice?: string;
  [key: string]: any;
};

export type AppInsightsResourceConfig2 = ResourceConfig & {
  key: 'applicationInsights';
  hostname: string;
  location?: string;
};

export type AppRegistrationResourceConfig2 = ResourceConfig & {
  key: 'appRegistration';
  hostname: string;
};

export type AzureFunctionResourceConfig2 = ResourceConfig & {
  key: 'azureFunctions';
  location?: string;
  name: string;
  operatingSystem: string;
  workerRuntime: string;
};

export type BlobStorageResourceConfig2 = ResourceConfig & {
  key: 'blobStorage';
  containerName: string;
  hostname: string;
  location?: string;
};

export type BotRegistrationResourceConfig2 = ResourceConfig & {
  key: 'botRegistration';
  displayName: string;
  hostname: string;
  location?: string;
};

export type CosmosDbResourceConfig2 = ResourceConfig & {
  key: 'cosmosDb';
  containerName: string;
  databaseName: string;
  hostname: string;
  location?: string;
};

export type LuisAuthoringResourceConfig2 = ResourceConfig & {
  key: 'luisAuthoring';
  hostname: string;
  location?: string;
};

export type LuisPredictionResourceConfig2 = ResourceConfig & {
  key: 'luisPrediction';
  hostname: string;
  location?: string;
};

export type QnAResourceConfig2 = ResourceConfig & {
  key: 'qna';
  hostname: string;
  location?: string;
};

export type ResourceGroupResourceConfig2 = ResourceConfig & {
  key: 'resourceGroup';
  name: string;
};

export type ServicePlanResourceConfig2 = ResourceConfig & {
  key: 'servicePlan';
  location?: string;
  name: string;
  operatingSystem: string;
};

export type WebAppResourceConfig2 = ResourceConfig & {
  key: 'webApp';
  hostname: string;
  location?: string;
  operatingSystem: string;
};

// TODO: These need to be put in the resource definitions rather than the services
const getResourceDependencies = (key: string) => {
  switch (key) {
    case 'applicationInsights':
      return ['botRegistration'];
    case 'appRegistration':
      return ['resourceGroup'];
    case 'azureFunctions':
      return ['appRegistration', 'resourceGroup'];
    case 'blobStorage':
      return ['resourceGroup'];
    case 'botRegistration':
      return ['appRegistration', 'resourceGroup', 'webApp'];
    case 'cosmosDb':
      return ['resourceGroup'];
    case 'luisAuthoring':
      return ['resourceGroup'];
    case 'luisPrediction':
      return ['resourceGroup'];
    case 'qna':
      return ['resourceGroup'];
    case 'servicePlan':
      return ['resourceGroup'];
    case 'webApp':
      return ['resourceGroup', 'servicePlan'];
    case 'resourceGroup':
    default:
      return [];
  }
};

// --------------------------------------------------------------------------------
// End of section
// --------------------------------------------------------------------------------

/**
 * Given a provisioning config this returns an ordered list of resource configurations.
 */
export const getResourceConfigs = (config: ProvisionConfig2): ResourceConfig[] => {
  const resources: ResourceConfig[] = [];

  const resourceKeys = config.externalResources.map((r) => r.key).concat('resourceGroup');

  console.log(resourceKeys);

  var dependencies: ReadonlyArray<[string, string | undefined]> = resourceKeys.reduce((result, key) => {
    const deps = getResourceDependencies(key);
    deps.length > 0 ? deps.forEach((d) => result.push([key, d])) : result.push([key, undefined]);
    return result;
  }, []);

  console.log(dependencies);

  const order = toposort(dependencies).filter(Boolean);

  console.log(order);

  order.forEach((key) => {
    switch (key) {
      case 'applicationInsights':
        resources.push({
          key,
          location: config.location,
          hostname: config.hostname,
        } as AppInsightsResourceConfig2);
        break;
      case 'appRegistration':
        resources.push({
          key,
          hostname: config.hostname,
        } as AppRegistrationResourceConfig2);
        break;
      case 'azureFunctions':
        resources.push({
          location: config.location,
          name: config.hostname,
          workerRuntime: config.workerRuntime,
          operatingSystem: config.appServiceOperatingSystem,
        } as AzureFunctionResourceConfig2);
        break;
      case 'blobStorage':
        resources.push({
          key,
          containerName: 'transcripts',
          hostname: config.hostname,
          location: config.location,
        } as BlobStorageResourceConfig2);
        break;
      case 'botRegistration':
        resources.push({
          key,
          location: config.location,
          hostname: config.hostname,
          displayName: config.hostname,
        } as BotRegistrationResourceConfig2);
        break;
      case 'cosmosDb':
        resources.push({
          key,
          containerName: 'botstate-container',
          databaseName: 'botstate-db',
          hostname: config.hostname,
          location: config.location,
        } as CosmosDbResourceConfig2);
        break;
      case 'luisAuthoring':
        resources.push({
          key,
          hostname: config.hostname,
          location: config.location,
        } as LuisAuthoringResourceConfig2);
        break;
      case 'luisPrediction':
        resources.push({
          key,
          hostname: config.hostname,
          location: config.location,
        } as LuisPredictionResourceConfig2);
        break;
      case 'qna':
        resources.push({
          key,
          hostname: config.hostname,
          location: config.location,
        } as QnAResourceConfig2);
        break;
      case 'resourceGroup':
        resources.push({
          key: 'resourceGroup',
          name: config.resourceGroup ?? config.hostname,
        } as ResourceGroupResourceConfig2);
        break;
      case 'servicePlan':
        resources.push({
          key,
          name: config.hostname,
          location: config.location,
          operatingSystem: config.appServiceOperatingSystem,
        } as ServicePlanResourceConfig2);
        break;
      case 'webApp':
        resources.push({
          key,
          hostname: config.hostname,
          location: config.location,
          operatingSystem: config.appServiceOperatingSystem,
        } as WebAppResourceConfig2);
        break;
      default:
        break;
    }
  });

  return resources;
};
