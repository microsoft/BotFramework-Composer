// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//TODO: Delete this file when the api layer is ready

import { ResourceGroup } from '@azure/arm-resources/esm/models';
import { DeployLocation, Subscription } from '@botframework-composer/types';
import { ResourceNameAvailability } from '@azure/arm-appservice/esm/models';

export const getSubscriptions = (accessToken: string): Promise<Subscription[]> => {
  return new Promise((resolve) => {
    resolve([]);
  });
};

export const getResourceGroups = (accessToken: string, subscription: string): Promise<ResourceGroup[]> => {
  return new Promise((resolve) => {
    resolve([]);
  });
};

export const getDeployLocations = (accessToken: string, subscription: string): Promise<DeployLocation[]> => {
  return new Promise((resolve) => {
    resolve([]);
  });
};

export const CheckWebAppNameAvailability = async (
  token: string,
  webAppName: string,
  subscriptionId: string
): Promise<ResourceNameAvailability> => {
  return {
    nameAvailable: true,
    message: '',
  } as ResourceNameAvailability;
};
