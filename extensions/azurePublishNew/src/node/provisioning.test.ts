// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getResourceConfigs, ProvisionConfig2 } from './provisioning';

const testConfig: ProvisionConfig2 = {
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
  appRegistration: {
    key: 'appRegistration',
    hostname: testConfig.hostname,
  },
  resourceGroup: {
    key: 'resourceGroup',
    name: testConfig.resourceGroup,
  },
};

describe('provisioning', () => {
  describe('getResourceConfigs', () => {
    it.each([
      {
        externalResources: [{ key: 'appRegistration' }],
        expected: [expectedTestResources.resourceGroup, expectedTestResources.appRegistration],
      },
    ])('returns correct resources %#', ({ externalResources, expected }) => {
      const config: ProvisionConfig2 = {
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
    const config: ProvisionConfig2 = {
      ...testConfig,
      externalResources: [{ key: 'webApp' }, { key: 'azureFunctions' }],
    };

    expect(() => getResourceConfigs(config)).toThrow();
  });

  it('throw if unknown resource key requested', () => {
    const config: ProvisionConfig2 = {
      ...testConfig,
      externalResources: [{ key: 'invalidResource' }],
    };

    expect(() => getResourceConfigs(config)).toThrow();
  });
});
