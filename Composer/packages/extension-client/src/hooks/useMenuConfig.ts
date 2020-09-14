// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { MenuUISchema } from '../types';

export function useMenuConfig(): MenuUISchema {
  const { plugins } = useContext(EditorExtensionContext);

  return useMemo(() => mapValues(plugins.uiSchema, 'menu'), [plugins.uiSchema]);
}
