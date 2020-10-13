// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
// this is just a type import
// eslint-disable-next-line lodash/import-scope
import type { MergeWithCustomizer } from 'lodash';
import type { PluginConfig } from '@bfc/extension-client';
import composer from '@bfc/ui-plugin-composer';
import prompts from '@bfc/ui-plugin-prompts';
import schemaEditor from '@bfc/ui-plugin-dialog-schema-editor';
import selectDialog from '@bfc/ui-plugin-select-dialog';
import selectSkillDialog from '@bfc/ui-plugin-select-skill-dialog';
import lg from '@bfc/ui-plugin-lg';
import lu from '@bfc/ui-plugin-luis';
import crossTrained from '@bfc/ui-plugin-cross-trained';

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
  widgets: {},
};

export function mergePluginConfigs(...plugins: PluginConfig[]): Required<PluginConfig> {
  return mergeWith({}, defaultPlugin, ...plugins, mergeArrays);
}

export default mergePluginConfigs(
  composer,
  prompts,
  selectDialog,
  selectSkillDialog,
  lg,
  lu,
  crossTrained,
  schemaEditor
);
