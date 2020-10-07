// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { FormUISchema } from '../types';

export function useFormConfig() {
  const { plugins } = useContext(EditorExtensionContext);

  const formConfig: FormUISchema = useMemo(() => mapValues(plugins.uiSchema, 'form'), [plugins.uiSchema]);
  return formConfig;
}
