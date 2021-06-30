// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getResourceConfigs, ProvisionConfig2, ResourceGroupResourceConfig2 } from '../provisioning';

describe('provisioning', () => {
  describe('getResourceConfigs', () => {
    it('returns resourceGroup when no other resource', () => {
      const config: ProvisionConfig2 = {
        accessToken: '',
        graphToken: '',
        externalResources: [],
        hostname: '',
        location: '',
        luisLocation: '',
        name: '',
        resourceGroup: 'resourceGroup',
        subscription: '',
        type: '',
        appServiceOperatingSystem: '',
      };

      const actual = getResourceConfigs(config);

      expect(actual).toBeDefined();
      expect(actual.length).toEqual(1);
      expect(actual[0].key).toEqual('resourceGroup');
      expect((actual[0] as ResourceGroupResourceConfig2).name).toEqual('resourceGroup');
    });
  });
});
