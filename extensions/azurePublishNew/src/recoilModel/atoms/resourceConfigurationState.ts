// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import { UserInfo, ResourceGroup, LuisRegion, ResourcesItem } from '../../types';

export const subscriptionState = atom<string>({
  key: 'resourceConfigurationSubscription',
  default: '',
});

export const tenantState = atom<string>({
  key: 'resourceConfigurationTenant',
  default: '',
});

export const luisRegionState = atom<LuisRegion>({
  key: 'resourceConfigurationLuisRegion',
  default: undefined,
});

export const deployLocationState = atom<string>({
  key: 'resourceConfigurationDeployLocation',
  default: '',
});

export const resourceGroupState = atom<ResourceGroup>({
  key: 'resourceConfigurationResourceGroup',
  default: { name: '', isNew: false },
});

export const hostNameState = atom<string>({
  key: 'resourceConfigurationHostName',
  default: '',
});

export const userInfoState = atom<UserInfo>({
  key: 'userInfo',
  default: undefined,
});

export const operatingSystemState = atom<string>({
  key: 'resourceConfigurationOperatingSystem',
  default: '',
});

export const enabledResourcesState = atom<ResourcesItem[] | undefined>({
  key: 'resourceConfigurationOptionalResources',
  default: undefined,
});

export const requiredResourcesState = atom<ResourcesItem[]>({
  key: 'resourceConfigurationRequiredResources',
  default: [],
});
