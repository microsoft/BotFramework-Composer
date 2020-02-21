// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PluginConfig } from '@bfc/extension';
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
// this is just a type import
// eslint-disable-next-line lodash/import-scope
import { MergeWithCustomizer } from 'lodash';

import DefaultUISchema from '../defaultUiSchema';
import DefaultRoleSchema from '../defaultRoleSchema';
import DefaultKindSchema from '../defaultKindSchema';
import DefaultRecognizers from '../defaultRecognizers';

const defaults: PluginConfig = {
  uiSchema: DefaultUISchema,
  roleSchema: DefaultRoleSchema,
  kindSchema: DefaultKindSchema,
  recognizers: DefaultRecognizers,
};

const mergeArrays: MergeWithCustomizer = (objValue, srcValue, key) => {
  if (isArray(objValue)) {
    // merge recognizers into defaults
    if (key === 'recognizers') {
      return objValue.concat(srcValue);
    }

    // otherwise override other arrays
    return srcValue;
  }
};

export function mergePluginConfigs(...plugins: PluginConfig[]): Required<PluginConfig> {
  return mergeWith({}, defaults, ...plugins, mergeArrays);
}
