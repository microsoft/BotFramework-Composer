// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HandlerDependencies, Action } from 'src/app/dispatcher/types';
import { getDispatcher as getDispatcherUtil } from 'src/app/dispatcher/dispatcherUtil';
import { MutableDataStore } from 'src/app/stores/dataStore';
import { MutableSettingsStore } from 'src/app/stores/settingsStore';

export const getDispatcher = (dataStore: MutableDataStore, settingsStore: MutableSettingsStore) => {
  return getDispatcherUtil<HandlerDependencies, Action>(() => {
    return {
      dataStore,
      settingsStore,
    };
  });
};

export type Dispatcher = ReturnType<typeof getDispatcher>;
