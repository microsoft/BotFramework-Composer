// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
let mock = jest.createMockFromModule('@azure/arm-subscriptions');

function SubscriptionClient() {
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
}
mock.SubscriptionClient = SubscriptionClient;

module.exports = mock;
