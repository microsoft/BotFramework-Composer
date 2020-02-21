// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PluginConfig } from '@bfc/extension';
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';

import DefaultUISchema from '../defaultUiSchema';
import DefaultRoleSchema from '../defaultRoleSchema';
import DefaultKindSchema from '../defaultKindSchema';

const defaults = {
  uiSchema: DefaultUISchema,
  roleSchema: DefaultRoleSchema,
  kindSchema: DefaultKindSchema,
};

/** override arrays */
const mergeArrays = (objValue: any, srcValue: any) => {
  if (isArray(objValue)) {
    return srcValue;
  }
};

export function mergePluginConfigs(...plugins: PluginConfig[]): Required<PluginConfig> {
  return mergeWith({}, defaults, ...plugins, mergeArrays);
}
