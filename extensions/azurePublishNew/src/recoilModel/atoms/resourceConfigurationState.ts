// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import { UserInfo, ResourceGroup, LuisRegion } from '../../types';

export const subscriptionState = atom<string>({
  key: 'resourceConfiguration_subscription',
  default: '',
});

export const tenantState = atom<string>({
  key: 'resourceConfiguration_tenant',
  default: '',
});

export const luisRegionState = atom<LuisRegion>({
  key: 'resourceConfiguration_luisRegion',
  default: undefined,
});

export const deployLocationState = atom<string>({
  key: 'resourceConfiguration_deployLocation',
  default: '',
});

export const resourceGroupState = atom<ResourceGroup>({
  key: 'resourceConfiguration_resourceGroup',
  default: { name: '', isNew: false },
});

export const hostNameState = atom<string>({
  key: 'resourceConfiguration_hostName',
  default: '',
});

export const userInfoState = atom<UserInfo>({
  key: 'userInfo',
  default: undefined,
});
