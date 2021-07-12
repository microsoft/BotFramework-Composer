// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getResourceConfigs, ProvisioningConfig } from './provisioning';

const testConfig: ProvisioningConfig = {
  accessToken: 'test-accessToken',
  graphToken: 'test-graphToken',
  externalResources: [],
  hostname: 'test-hostname',
  location: 'test-location',
  luisLocation: 'test-luisLocation',
  name: 'test-name',
  resourceGroup: 'test-resourceGroup',
  subscription: 'test-subscription',
  type: 'test-type',
  appServiceOperatingSystem: 'test-operatingSystem',
  workerRuntime: 'test-workerRuntime',
  instrumentationKey: 'test-instrumentationKey',
};

const expectedTestResources = {
  appInsights: {
    key: 'appInsights',
    name: testConfig.hostname,
    location: testConfig.location,
    resourceGroupName: testConfig.resourceGroup,
  },
  appRegistration: {
    key: 'appRegistration',
    appName: testConfig.hostname,
  },
  azureFunctions: {
    key: 'azureFunctions',
    location: testConfig.location,
    name: testConfig.hostname,
    workerRuntime: testConfig.workerRuntime,
    operatingSystem: testConfig.appServiceOperatingSystem,
    resourceGroupName: testConfig.resourceGroup,
    instrumentationKey: testConfig.instrumentationKey,
  },
  blobStorage: {
    key: 'blobStorage',
    location: testConfig.location,
    name: 'testhostname',
    resourceGroupName: testConfig.resourceGroup,
  },
  botRegistration: {
    key: 'botRegistration',
    hostname: testConfig.hostname,
    resourceGroupName: testConfig.resourceGroup,
  },
  cosmosDb: {
    key: 'cosmosDb',
    containerName: 'botstate-container',
    databaseName: 'botstate-db',
    displayName: testConfig.hostname,
    location: testConfig.location,
    resourceGroupName: testConfig.resourceGroup,
  },
  luisAuthoring: {
    key: 'luisAuthoring',
    resourceGroupName: testConfig.resourceGroup,
    location: testConfig.luisLocation,
    name: 'test-hostname-luis-authoring',
  },
  luisPrediction: {
    key: 'luisPrediction',
    resourceGroupName: testConfig.resourceGroup,
    location: testConfig.luisLocation,
    name: 'test-hostname-luis',
  },
  qna: {
    key: 'qna',
    resourceGroupName: testConfig.resourceGroup,
    location: testConfig.location,
    name: 'test-hostname-qna',
    sku: testConfig.sku,
  },
  resourceGroup: {
    key: 'resourceGroup',
    name: testConfig.resourceGroup,
    location: testConfig.location,
  },
  servicePlan: {
    key: 'servicePlan',
    appServicePlanName: testConfig.hostname,
    location: testConfig.location,
    operatingSystem: testConfig.appServiceOperatingSystem,
    resourceGroupName: testConfig.resourceGroup,
  },
  webApp: {
    key: 'webApp',
    webAppName: testConfig.hostname,
    location: testConfig.location,
    operatingSystem: testConfig.appServiceOperatingSystem,
    resourceGroupName: testConfig.resourceGroup,
  },
};

describe('provisioning', () => {
  describe('getResourceConfigs', () => {
    it.each([
      {
        externalResources: [],
        expected: [expectedTestResources.resourceGroup],
      },
      {
        externalResources: [{ key: 'appInsights' }],
        expected: [
          expectedTestResources.resourceGroup,
          expectedTestResources.servicePlan,
          expectedTestResources.webApp,
          expectedTestResources.appRegistration,
          expectedTestResources.botRegistration,
          expectedTestResources.appInsights,
        ],
      },
      {
        externalResources: [{ key: 'appRegistration' }],
        expected: [expectedTestResources.resourceGroup, expectedTestResources.appRegistration],
      },
      {
        externalResources: [{ key: 'azureFunctions' }],
        expected: [
          expectedTestResources.resourceGroup,
          expectedTestResources.appRegistration,
          expectedTestResources.azureFunctions,
        ],
      },
      {
        externalResources: [{ key: 'blobStorage' }],
        expected: [expectedTestResources.resourceGroup, expectedTestResources.blobStorage],
      },
      {
        externalResources: [{ key: 'botRegistration' }],
        expected: [
          expectedTestResources.resourceGroup,
          expectedTestResources.servicePlan,
          expectedTestResources.webApp,
          expectedTestResources.appRegistration,
          expectedTestResources.botRegistration,
        ],
      },
      {
        externalResources: [{ key: 'cosmosDb' }],
        expected: [expectedTestResources.resourceGroup, expectedTestResources.cosmosDb],
      },
      {
        externalResources: [{ key: 'luisAuthoring' }],
        expected: [expectedTestResources.resourceGroup, expectedTestResources.luisAuthoring],
      },
      {
        externalResources: [{ key: 'luisPrediction' }],
        expected: [expectedTestResources.resourceGroup, expectedTestResources.luisPrediction],
      },
      {
        externalResources: [{ key: 'qna' }],
        expected: [expectedTestResources.resourceGroup, expectedTestResources.qna],
      },
      {
        externalResources: [{ key: 'servicePlan' }],
        expected: [expectedTestResources.resourceGroup, expectedTestResources.servicePlan],
      },
      {
        externalResources: [{ key: 'webApp' }],
        expected: [
          expectedTestResources.resourceGroup,
          expectedTestResources.servicePlan,
          expectedTestResources.webApp,
        ],
      },
      {
        externalResources: [
          { key: 'appInsights' },
          { key: 'appRegistration' },
          { key: 'blobStorage' },
          { key: 'botRegistration' },
          { key: 'cosmosDb' },
          { key: 'luisAuthoring' },
          { key: 'luisPrediction' },
          { key: 'qna' },
          { key: 'servicePlan' },
          { key: 'webApp' },
        ],
        expected: [
          expectedTestResources.resourceGroup,
          expectedTestResources.qna,
          expectedTestResources.luisPrediction,
          expectedTestResources.luisAuthoring,
          expectedTestResources.cosmosDb,
          expectedTestResources.blobStorage,
          expectedTestResources.servicePlan,
          expectedTestResources.webApp,
          expectedTestResources.appRegistration,
          expectedTestResources.botRegistration,
          expectedTestResources.appInsights,
        ],
      },
      {
        externalResources: [
          { key: 'appInsights' },
          { key: 'appRegistration' },
          { key: 'blobStorage' },
          { key: 'botRegistration' },
          { key: 'cosmosDb' },
          { key: 'luisAuthoring' },
          { key: 'luisPrediction' },
          { key: 'qna' },
          { key: 'azureFunctions' },
        ],
        expected: [
          expectedTestResources.resourceGroup,
          expectedTestResources.appRegistration,
          expectedTestResources.azureFunctions,
          expectedTestResources.qna,
          expectedTestResources.luisPrediction,
          expectedTestResources.luisAuthoring,
          expectedTestResources.cosmosDb,
          expectedTestResources.blobStorage,
          expectedTestResources.botRegistration,
          expectedTestResources.appInsights,
        ],
      },
    ])('returns correct resources %#', ({ externalResources, expected }) => {
      const config: ProvisioningConfig = {
        ...testConfig,
        externalResources,
      };

      const actual = getResourceConfigs(config);

      expect(actual).toBeDefined();
      expect(actual.length).toEqual(expected.length);
      expect(actual).toStrictEqual(expected);
    });
  });

  it('throw if both web app and azure function requested', () => {
    const config: ProvisioningConfig = {
      ...testConfig,
      externalResources: [{ key: 'webApp' }, { key: 'azureFunctions' }],
    };

    expect(() => getResourceConfigs(config)).toThrow();
  });

  it('throw if unknown resource key requested', () => {
    const config: ProvisioningConfig = {
      ...testConfig,
      externalResources: [{ key: 'invalidResource' }],
    };

    expect(() => getResourceConfigs(config)).toThrow();
  });
});
