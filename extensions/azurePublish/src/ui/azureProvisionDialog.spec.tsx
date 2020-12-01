// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, waitFor } from '@botframework-composer/test-utils';

import { AzureProvisionDialog } from './azureProvisionDialog';
jest.mock('@bfc/extension-client', () => {
  return {
    getType: () => 'azurePublish',
    getAccessToken: () => 'accessToken',
    setTitle: (title) => null,
    getAccessTokensFromStorage: () => { return { access_token: 'accessToken', graph_token: 'graphToken' } },
    getCurrentUser: () => 'testUser',
    currentProjectId: () => 'testId',
  };
});
jest.mock('./api', () => {
  return {
    getResourceList: (id, type) => [],
    getSubscriptions: (token) => {
      return Promise.resolve([]);
    },
    getResourceGroups: (token, subscriptionId) => [],
  }
})
it('should render', async () => {
  const { getByText } = render(<AzureProvisionDialog />);
  const option1 = await waitFor(() => getByText('Create new Azure resources'));
  expect(option1).toBeTruthy();

  const option2 = await waitFor(() => getByText('Import existing Azure resources'));
  expect(option2).toBeTruthy();
});
