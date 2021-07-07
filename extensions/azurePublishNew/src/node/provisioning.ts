// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import toposort from 'toposort';
import { ResourceConfig } from './types';
import { getResourceDependencies, provisionConfigToResourceConfigMap } from './availableResources';
import { AzureResourceTypes } from './constants';

// TODO: This is what we have to remain compatible with
export type ProvisioningConfig = {
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

const dependencyPair = (key: string, dependency: string | undefined) => {
  return [key, dependency];
};

type DependencyPair = ReturnType<typeof dependencyPair>;

/**
 * Given a provisioning config this returns an ordered list of resource configurations.
 */
export const getResourceConfigs = (config: ProvisioningConfig): ResourceConfig[] => {
  const resources: ResourceConfig[] = [];

  const resourceKeys = config.externalResources.map((r) => r.key).concat(AzureResourceTypes.RESOURCE_GROUP);

  const hasWebAppResource = config.externalResources.some((r) => r.key === 'webApp');
  const hasAzureFunctionResource = config.externalResources.some((r) => r.key === 'azureFunctions');

  if (hasWebAppResource && hasAzureFunctionResource) {
    throw new Error('The App Service cannot be both a web application and an azure function.');
  }

  const dependencies: Array<DependencyPair> = [];

  const discoverDependencies = (key: string) => {
    // if a key was already handled, return
    if (dependencies.some((d) => d[0] === key)) {
      return;
    }

    const deps = getResourceDependencies(key);
    if (deps.length === 0) {
      dependencies.push(dependencyPair(key, undefined));
    } else {
      deps.forEach((d) => {
        dependencies.push(dependencyPair(key, d));
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
