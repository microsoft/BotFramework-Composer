// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getDeployLocations,
  getLuisAuthoringRegions,
  getLuisPredictionRegions,
  getPreview,
  getResourceGroups,
  getResources,
  getSubscriptions,
} from './api';

jest.mock('@azure/arm-subscriptions', () => {
  return {
    SubscriptionClient: jest.fn().mockImplementation(() => {
      return {
        subscriptions: {
          list: jest.fn().mockImplementation(() => {
            return {
              _response: {
                status: 200,
                parsedBody: [
                  {
                    subscriptionId: 'test_subscription_id',
                    id: 'test_id',
                    displayName: 'test_name',
                  },
                ],
              },
            };
          }),
        },
      };
    }),
  };
});

jest.mock('@azure/arm-resources', () => {
  return {
    ResourceManagementClient: jest.fn().mockImplementation(() => {
      return {
        resourceGroups: {
          list: jest.fn().mockImplementation(() => {
            return {
              _response: {
                status: 200,
                parsedBody: [
                  {
                    location: 'test_location',
                    id: 'test_id',
                    name: 'test_name',
                  },
                ],
              },
            };
          }),
        },
        resources: {
          listByResourceGroup: jest.fn().mockImplementation(() => {
            return {
              _response: {
                status: 200,
                parsedBody: [
                  {
                    kind: 'test_kind',
                    managedBy: 'test_manage',
                  },
                ],
              },
            };
          }),
        },
      };
    }),
  };
});

jest.mock('axios', () => {
  return {
    get: jest.fn().mockImplementation((url: string) => {
      if (url.startsWith('https://management.azure.com/subscriptions/')) {
        return {
          data: {
            value: ['westus', 'eastus'],
          },
        };
      }
    }),
  };
});

beforeEach(() => {});

describe('provision api', () => {
  it('subscription api should return valid subscriptions', async () => {
    const token = 'test_token';
    const result = await getSubscriptions(token);
    expect(result[0].displayName).toEqual('test_name');
    expect(result[0].id).toEqual('test_id');
    expect(result[0].subscriptionId).toEqual('test_subscription_id');
  });

  it('resource group api should return valid resource groups', async () => {
    const token = 'test_token';
    const subscriptionId = 'test_subscription_id';
    const result = await getResourceGroups(token, subscriptionId);
    expect(result[0].name).toEqual('test_name');
    expect(result[0].id).toEqual('test_id');
    expect(result[0].location).toEqual('test_location');
  });

  it('resource api should return valid resource', async () => {
    const token = 'test_token';
    const subscriptionId = 'test_subscription_id';
    const resourceGroup = 'test_resource_group';
    const result = await getResources(token, subscriptionId, resourceGroup);
    expect(result[0].kind).toEqual('test_kind');
    expect(result[0].managedBy).toEqual('test_manage');
  });

  it('get locations api should return right locations', async () => {
    const token = 'test_token';
    const subscriptionId = 'test_subscription_id';
    const result = await getDeployLocations(token, subscriptionId);
    expect(result[0]).toEqual('westus');
    expect(result[1]).toEqual('eastus');
  });

  it('get preview list api should work properly', async () => {
    const hostname = 'test_hostname';
    const result = getPreview(hostname);
    // return list won't be empty
    expect(result.length).toBeTruthy();
    // test list structure
    const firstObj = result[0];
    expect(firstObj.name).toBeDefined();
    expect(firstObj.key).toBeDefined();
    expect(firstObj.icon).toBeDefined();
  });

  it('get luis authoring regions should work properly', async () => {
    const result = getLuisAuthoringRegions();
    expect(result.length).toBeTruthy();
  });

  it('get luis prediction regions should work properly', async () => {
    const result = getLuisPredictionRegions();
    expect(result).toBeTruthy();
  });
});
