// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';

import ExtensionContext from '../extensionContext';

export function useMenuConfig() {
  const { plugins } = useContext(ExtensionContext);

  return useMemo(() => mapValues(plugins.uiSchema, 'menu'), [plugins.uiSchema]);
}
