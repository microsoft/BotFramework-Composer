// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export type ResourceConfigurationState = {
  tenantId: string;
  accessToken: string;
  subscriptionId: string;
  resourceGroupName: string;
  luisRegion: string;
  deployLocation: string;
  hostName: string;
  isNewResourceGroup: boolean;
};

export type UserInfo = {
  token: string;
  email: string;
  name: string;
  expiration: number;
  sessionExpired: boolean;
};
