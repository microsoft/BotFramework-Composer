// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';

import ExtensionContext from '../extensionContext';
import { FormUISchema } from '../types';

export function useFormConfig() {
  const { plugins } = useContext(ExtensionContext);

  const formConfig: FormUISchema = useMemo(() => mapValues(plugins.uiSchema, 'form'), [plugins.uiSchema]);
  return formConfig;
}
