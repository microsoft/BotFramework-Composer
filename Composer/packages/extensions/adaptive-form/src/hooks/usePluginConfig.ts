// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext } from 'react';

import PluginContext from '../PluginContext';

export function usePluginConfig() {
  return useContext(PluginContext);
}
