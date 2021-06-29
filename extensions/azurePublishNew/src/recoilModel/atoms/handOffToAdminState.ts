// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import { ResourcesItem } from '../../types';

export const enabledHandOffResourcesState = atom<ResourcesItem[] | undefined>({
  key: 'handoffOptionalResources',
  default: undefined,
});

export const requiredHandOffResourcesState = atom<ResourcesItem[]>({
  key: 'handoffRequiredResources',
  default: [],
});
