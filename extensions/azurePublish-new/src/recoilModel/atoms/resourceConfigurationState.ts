// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import { tenantIdSelector } from '../selectors/tenants';
import { UserInfo } from '../types';

export const defaultUserInfo: UserInfo = {
  email: undefined,
  expiration: undefined,
  name: undefined,
  sessionExpired: undefined,
  token: undefined,
};
export const tenantSelectionState = atom<string>({
  key: 'resourceConfiguration_tenant',
  default: tenantIdSelector,
});
export const userInfoState = atom<UserInfo>({
  key: 'resourceConfiguration_accessToken',
  default: defaultUserInfo,
});
export const subscriptionSelectionState = atom<string>({
  key: 'resourceConfiguration_subscription',
  default: '',
});
export const resourceGroupSelectionState = atom<string>({
  key: 'resourceConfiguration_rg',
  default: '',
});
