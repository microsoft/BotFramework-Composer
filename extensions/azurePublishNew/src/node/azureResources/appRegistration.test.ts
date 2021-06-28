// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getAppRegistrationProvisionService } from './appRegistration';
import { AppRegistrationConfig, AppRegistrationResult } from './types';

const mockSubscriptionId = 'mockSubId';
const mockToken = 'mockToken';
const mockGraphToken = 'mockGraphToken';

const mockProject = {} as any;

const mockCreateAppPost = jest.fn().mockResolvedValue({ appId: 'appId123', id: '123' });
const mockAddPasswordPost = jest.fn().mockResolvedValue({ secretText: 'secret' });

jest.mock('request-promise', () => {
  return {
    post: async (...args) => {
      return args[0].includes('addPassword') ? await mockAddPasswordPost(args) : await mockCreateAppPost(args);
    },
    RequestPromiseOptions: {},
  };
});

describe('appRegistration', () => {
  describe('getAppRegistrationProvisionService', () => {
    it('returns the app registration service', () => {
      const appRegistrationProvisionService = getAppRegistrationProvisionService({
        token: mockToken,
        graphToken: mockGraphToken,
        subscriptionId: mockSubscriptionId,
      });
      expect(appRegistrationProvisionService.getDependencies().length).toBe(0);
      expect(appRegistrationProvisionService.getRecommendationForProject(mockProject)).toBe('required');
    });
  });
  describe('provision', () => {
    it('should return appRegistration result on success', async () => {
      const appRegistrationProvisionService = getAppRegistrationProvisionService({
        token: mockToken,
        graphToken: mockGraphToken,
        subscriptionId: mockSubscriptionId,
      });

      const config: AppRegistrationConfig = {
        key: 'appRegistration',
        name: 'test-app',
      };

      try {
        const resultSet = await appRegistrationProvisionService.provision(config, {});
        const appRegistration = resultSet.appRegistration as AppRegistrationResult;
        expect(appRegistration?.appId).toBeDefined();
        expect(appRegistration?.appPassword).toBeDefined();
      } catch (e) {
        fail(`Should have succeeded. Error: ${e}`);
      }
    });
  });
});
