// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
// this is just a type import
// eslint-disable-next-line lodash/import-scope
import type { MergeWithCustomizer } from 'lodash';

import { PluginConfig } from '../types';

const mergeArrays: MergeWithCustomizer = (objValue, srcValue, key) => {
  if (isArray(objValue)) {
    // merge recognizers into defaults
    if (key === 'recognizers') {
      return srcValue.concat(objValue);
    }

    // otherwise override other arrays
    return srcValue;
  }
};

const defaultPlugin: Required<PluginConfig> = {
  uiSchema: {},
  recognizers: [],
  flowWidgets: {},
};

export function mergePluginConfigs(...plugins: PluginConfig[]): Required<PluginConfig> {
  return mergeWith({}, defaultPlugin, ...plugins, mergeArrays);
}
