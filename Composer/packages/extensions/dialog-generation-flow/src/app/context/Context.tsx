// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { DataStore } from 'src/app/stores/dataStore';
import { Dispatcher } from 'src/app/dispatcher/dispatcher';
import { SettingsStore } from 'src/app/stores/settingsStore';

export type ContextValue = {
  dataStore: DataStore;
  settingsStore: SettingsStore;
  dispatcher: Dispatcher;
};

export const Context = React.createContext<ContextValue>(null);

type Props = React.PropsWithChildren<{
  dataStore: DataStore;
  dispatcher: Dispatcher;
  settingsStore: SettingsStore;
}>;

export const ContextProvider = (props: Props) => {
  const { children, dataStore, settingsStore, ...value } = props;

  return <Context.Provider value={{ ...value, dataStore, settingsStore }}>{children}</Context.Provider>;
};
