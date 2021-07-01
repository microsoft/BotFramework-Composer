// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import toposort from 'toposort';
import { ResourceConfig } from './types';

// TODO: This is what we have to remain compatible with
export type ProvisionConfig2 = {
  accessToken: string;
  graphToken: string;
  tenantId?: string;
  hostname: string; // for previous bot, it's ${name}-${environment}
  externalResources: { key: string; [key: string]: any }[];
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

// TODO: These types should be moved into their respective resource modules

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

// TODO: Maybe these need to be put in the resource definitions rather than the services?
// I think for now this should also go in availableResource.ts
const getResourceDependencies = (key: string, isWebApp: boolean) => {
  switch (key) {
    case 'applicationInsights':
      return ['resourceGroup', 'botRegistration'];
    case 'appRegistration':
      return ['resourceGroup'];
    case 'azureFunctions':
      return ['resourceGroup', 'appRegistration'];
    case 'blobStorage':
      return ['resourceGroup'];
    case 'botRegistration':
      return ['resourceGroup', 'appRegistration', isWebApp ? 'webApp' : 'azureFunctions'];
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

// TODO: I think this should be moved to the central place resources are registered (availableResources.ts)
// It could be part of the provisioning service, but then each resource module ends up knowing about ProvisionConfig2
const provisionConfigToResourceConfigMap = {
  applicationInsights: (config: ProvisionConfig2): AppInsightsResourceConfig2 => {
    return {
      key: 'applicationInsights',
      location: config.location,
      hostname: config.hostname,
    };
  },
  appRegistration: (config: ProvisionConfig2): AppRegistrationResourceConfig2 => {
    return {
      key: 'appRegistration',
      hostname: config.hostname,
    };
  },
  azureFunctions: (config: ProvisionConfig2): AzureFunctionResourceConfig2 => {
    return {
      key: 'azureFunctions',
      location: config.location,
      name: config.hostname,
      workerRuntime: config.workerRuntime,
      operatingSystem: config.appServiceOperatingSystem,
    };
  },
  blobStorage: (config: ProvisionConfig2): BlobStorageResourceConfig2 => {
    return {
      key: 'blobStorage',
      containerName: 'transcripts',
      hostname: config.hostname,
      location: config.location,
    };
  },
  botRegistration: (config: ProvisionConfig2): BotRegistrationResourceConfig2 => {
    return {
      key: 'botRegistration',
      hostname: config.hostname,
      location: config.location,
    };
  },
  cosmosDb: (config: ProvisionConfig2): CosmosDbResourceConfig2 => {
    return {
      key: 'cosmosDb',
      containerName: 'botstate-container',
      databaseName: 'botstate-db',
      hostname: config.hostname,
      location: config.location,
    };
  },
  luisAuthoring: (config: ProvisionConfig2): LuisAuthoringResourceConfig2 => {
    return {
      key: 'luisAuthoring',
      hostname: config.hostname,
      location: config.location,
    };
  },
  luisPrediction: (config: ProvisionConfig2): LuisPredictionResourceConfig2 => {
    return {
      key: 'luisPrediction',
      hostname: config.hostname,
      location: config.location,
    };
  },
  qna: (config: ProvisionConfig2): QnAResourceConfig2 => {
    return {
      key: 'qna',
      hostname: config.hostname,
      location: config.location,
    };
  },
  resourceGroup: (config: ProvisionConfig2): ResourceGroupResourceConfig2 => {
    return {
      key: 'resourceGroup',
      name: config.resourceGroup || config.hostname,
    };
  },
  servicePlan: (config: ProvisionConfig2): ServicePlanResourceConfig2 => {
    return {
      key: 'servicePlan',
      name: config.hostname,
      location: config.location,
      operatingSystem: config.appServiceOperatingSystem,
    };
  },
  webApp: (config: ProvisionConfig2): WebAppResourceConfig2 => {
    return {
      key: 'webApp',
      hostname: config.hostname,
      location: config.location,
      operatingSystem: config.appServiceOperatingSystem,
    };
  },
};

// getResourceConfigs should remain in provisioning.ts

/**
 * Given a provisioning config this returns an ordered list of resource configurations.
 */
export const getResourceConfigs = (config: ProvisionConfig2): ResourceConfig[] => {
  const resources: ResourceConfig[] = [];

  const resourceKeys = config.externalResources.map((r) => r.key).concat('resourceGroup');

  const hasWebAppResource = config.externalResources.some((r) => r.key === 'webApp');
  const hasAzureFunctionResource = config.externalResources.some((r) => r.key === 'azureFunctions');

  if (hasWebAppResource && hasAzureFunctionResource) {
    throw new Error('The App Service cannot be both a web application and an azure function.');
  }

  const isWebApp = hasWebAppResource || !hasAzureFunctionResource;

  const dependencies: Array<[string, string | undefined]> = [];

  const discoverDependencies = (key: string) => {
    // if a key was already handled, return
    if (dependencies.some((d) => d[0] === key)) {
      return;
    }

    const deps = getResourceDependencies(key, isWebApp);
    if (deps.length === 0) {
      dependencies.push([key, undefined]);
    } else {
      deps.forEach((d) => {
        dependencies.push([key, d]);
        discoverDependencies(d);
      });
    }
  };

  resourceKeys.forEach(discoverDependencies);
  const order = toposort(dependencies).reverse().filter(Boolean);
  order.forEach((key) => {
    const mapper = provisionConfigToResourceConfigMap[key];
    if (mapper) {
      resources.push(mapper(config));
    } else {
      throw new Error(`Could not create resource configuration for provisioning for unexpected key ${key}`);
    }
  });

  return resources;
};
