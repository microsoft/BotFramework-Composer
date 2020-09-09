// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';

import ExtensionContext from '../extensionContext';
import { MenuUISchema } from '../types';

export function useMenuConfig(): MenuUISchema {
  const { plugins } = useContext(ExtensionContext);

  return useMemo(() => mapValues(plugins.uiSchema, 'menu'), [plugins.uiSchema]);
}
