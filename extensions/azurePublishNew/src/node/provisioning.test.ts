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
};

const expectedTestResources = {
  appInsights: {
    key: 'appInsights',
    hostname: testConfig.hostname,
    location: testConfig.location,
  },
  appRegistration: {
    key: 'appRegistration',
    hostname: testConfig.hostname,
  },
  azureFunctions: {
    key: 'azureFunctions',
    location: testConfig.location,
    name: testConfig.hostname,
    workerRuntime: testConfig.workerRuntime,
    operatingSystem: testConfig.appServiceOperatingSystem,
  },
  blobStorage: {
    key: 'blobStorage',
    containerName: 'transcripts',
    hostname: testConfig.hostname,
    location: testConfig.location,
  },
  botRegistration: {
    key: 'botRegistration',
    hostname: testConfig.hostname,
    location: testConfig.location,
  },
  cosmosDb: {
    key: 'cosmosDb',
    containerName: 'botstate-container',
    databaseName: 'botstate-db',
    hostname: testConfig.hostname,
    location: testConfig.location,
  },
  luisAuthoring: {
    key: 'luisAuthoring',
    hostname: testConfig.hostname,
    location: testConfig.location,
  },
  luisPrediction: {
    key: 'luisPrediction',
    hostname: testConfig.hostname,
    location: testConfig.location,
  },
  qna: {
    key: 'qna',
    hostname: testConfig.hostname,
    location: testConfig.location,
  },
  resourceGroup: {
    key: 'resourceGroup',
    name: testConfig.resourceGroup,
    location: testConfig.location,
  },
  servicePlan: {
    key: 'servicePlan',
    name: testConfig.hostname,
    location: testConfig.location,
    operatingSystem: testConfig.appServiceOperatingSystem,
  },
  webApp: {
    key: 'webApp',
    hostname: testConfig.hostname,
    location: testConfig.location,
    operatingSystem: testConfig.appServiceOperatingSystem,
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
          expectedTestResources.qna,
          expectedTestResources.luisPrediction,
          expectedTestResources.luisAuthoring,
          expectedTestResources.cosmosDb,
          expectedTestResources.blobStorage,
          expectedTestResources.appRegistration,
          expectedTestResources.azureFunctions,
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
