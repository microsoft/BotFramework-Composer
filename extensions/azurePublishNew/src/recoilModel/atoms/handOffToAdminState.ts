// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import { ResourcesItem } from '../../types';

export const enabledHandOffResourcesState = atom<ResourcesItem[] | undefined>({
  key: 'hor_optional_resources',
  default: undefined,
});

export const requiredHandOffResourcesState = atom<ResourcesItem[]>({
  key: 'hor_required_resources',
  default: [],
});
