// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { DataStore } from 'src/app/stores/dataStore';
import { Dispatcher } from 'src/app/dispatcher/dispatcher';
import { SettingsStore } from 'src/app/stores/settingsStore';

export type ContextValue = {
  dataStore: DataStore;
  settingsStore: SettingsStore;
  templates: string[];
  dispatcher: Dispatcher;
};

export const Context = React.createContext<ContextValue>(null);

type Props = React.PropsWithChildren<ContextValue>;

export const ContextProvider = (props: Props) => {
  const { children, ...contextValue } = props;

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};
