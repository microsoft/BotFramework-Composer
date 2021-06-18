// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
let mock = jest.createMockFromModule('@azure/arm-subscriptions');

mock.SubscriptionClient = () => {
  return {
    subscriptions: {
      list: async () => {
        return {
          _response: {
            parsedBody: [
              {
                subscriptionId: 'mockSubscription',
                displayName: 'mockSubscription',
              },
            ],
          },
        };
      },
      listLocations: async () => {
        return [{ name: 'westus', displayName: 'West US' }];
      },
    },
  };
};

module.exports = mock;
