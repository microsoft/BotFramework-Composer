// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, waitFor, fireEvent } from '@botframework-composer/test-utils';

import { DockerPublishingDialog } from '../dockerPublishingDialog';
import { RepositoryAPIProps } from '../../types';

jest.mock('@bfc/extension-client', () => ({
  usePublishApi: () => {
    return {
      getType: () => 'azurePublish',
      getAccessToken: async () => 'accessToken',
      getCurrentUser: () => 'testUser',
      currentProjectId: () => 'testId',

      publishConfig: {},
      closeDialog: () => {},
      onBack: () => {},
      savePublishConfig: (config: any) => {},
      setTitle: (value: any) => {},
      getTokenFromCache: () => {
        return { accessToken: 'accessToken', graphToken: 'graphToken' };
      },
      userShouldProvideTokens: () => true,
    };
  },
}));

jest.mock('../../backend/DockerEngine', () => {
  return {
    DockerEngine: jest.fn().mockImplementation(() => {
      return {
        UpdateProps: (props?: RepositoryAPIProps) => {},
        testEnvironment: async () => Promise.resolve(true),
        getTags: (imageName: string) => [],
      };
    }),
  };
});

it('Should Render', async () => {
  const { getByText } = render(<DockerPublishingDialog />);

  const localDocker = await waitFor(() => getByText('Local Docker'));
  expect(localDocker).toBeTruthy();

  const acr = await waitFor(() => getByText('Azure Container Registry'));
  expect(acr).toBeTruthy();

  const dockerhub = await waitFor(() => getByText('Docker Hub'));
  expect(dockerhub).toBeTruthy();

  const custom = await waitFor(() => getByText('Custom Registry'));
  expect(custom).toBeTruthy();
});
