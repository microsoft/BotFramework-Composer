// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { FlowUISchema } from '../types';

export function useFlowConfig() {
  const { plugins } = useContext(EditorExtensionContext);

  const config: FlowUISchema = useMemo(() => mapValues(plugins.uiSchema, 'flow'), [plugins.uiSchema]);
  return config;
}
