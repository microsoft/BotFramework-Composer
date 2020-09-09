// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';

import ExtensionContext from '../extensionContext';
import { FlowUISchema } from '../types';

export function useFlowConfig() {
  const { plugins } = useContext(ExtensionContext);

  const config: FlowUISchema = useMemo(() => mapValues(plugins.uiSchema, 'flow'), [plugins.uiSchema]);
  return config;
}
