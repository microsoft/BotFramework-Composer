// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import useDispatchers, { Dispatcher } from '../dispatchers';
import { ResourceConfigurationState, UserInfo } from '../types';

export const defaultUserInfo: UserInfo = {
  email: undefined,
  expiration: undefined,
  name: undefined,
  sessionExpired: undefined,
  token: undefined,
};

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
