// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import { Dispatcher } from '../dispatchers';

export const dispatcherState = atom<Dispatcher>({
  key: 'azurePublishDispatcherState',
  default: {} as Dispatcher,
});
