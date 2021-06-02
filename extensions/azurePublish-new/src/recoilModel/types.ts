// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export type ResourceConfigurationState = {
  tenantId: string;
  accessToken: string;
  subscriptionId: string;
  resourceGroupId: string;
};

export type UserInfo = {
  token: string;
  email: string;
  name: string;
  expiration: number;
  sessionExpired: boolean;
};
