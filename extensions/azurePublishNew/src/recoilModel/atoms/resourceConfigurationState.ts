// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import { ResourceConfigurationState, UserInfo } from '../types';

export const resourceConfigurationState = atom<ResourceConfigurationState>({
  key: 'resourceConfiguration',
  default: {
    resourceGroupName: '',
    subscriptionId: '',
    tenantId: '',
    deployLocation: '',
    luisRegion: '',
  } as ResourceConfigurationState,
});

export const userInfoState = atom<UserInfo>({
  key: 'userInfo',
  default: undefined,
});
