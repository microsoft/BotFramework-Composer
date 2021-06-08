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

export const userInfoState = atom<UserInfo | undefined>({
  key: 'resourceConfiguration_accessToken',
  default: undefined,
});

export const subscriptionSelectionState = atom<string>({
  key: 'resourceConfiguration_subscription',
  default: '',
});

export const resourceGroupSelectionState = atom<string>({
  key: 'resourceConfiguration_rg',
  default: '',
});

export const hostNameState = atom<string>({
  key: 'resourceConfiguration_hostname',
  default: '',
});

export const deployLocationSelectionState = atom<string>({
  key: 'resourceConfiguration_dl',
  default: '',
});

export const luisLocationSelectionState = atom<string>({
  key: 'resourceConfiguration_luis_location',
  default: '',
});
