// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema4 } from 'json-schema';
import { UIOptions, FieldWidget, PluginConfig } from '@bfc/extension';

import * as DefaultFields from '../components/fields';

/**
 * Resolves field widget in this order:
 *   UISchema field override, schema.$role, schema.$kind, schema.type
 * @param schema
 * @param uiOptions
 */
export function resolveFieldWidget(
  schema?: JSONSchema4,
  uiOptions?: UIOptions,
  globalConfig?: Required<PluginConfig>
): FieldWidget {
  const FieldOverride = uiOptions?.field;

  if (typeof FieldOverride === 'function') {
    return FieldOverride;
  }

  if (schema) {
    if (globalConfig) {
      const RoleOverride = globalConfig?.roleSchema[schema.$role]?.field;

      if (RoleOverride) {
        return RoleOverride;
      }

      const KindOverride = globalConfig?.kindSchema[schema.$kind]?.field;

      if (KindOverride) {
        return KindOverride;
      }
    }

    switch (schema.type) {
      case 'string':
        return schema.enum ? DefaultFields.SelectField : DefaultFields.StringField;
      case 'integer':
      case 'number':
        return DefaultFields.NumberField;
      case 'boolean':
        return DefaultFields.BooleanField;
      case 'array': {
        const { items } = schema;

        if (Array.isArray(items) && items[0].type === 'object') {
          return DefaultFields.ObjectArrayField;
        } else if (!Array.isArray(items) && items?.type === 'object') {
          return DefaultFields.ObjectArrayField;
        }

        return DefaultFields.ArrayField;
      }
      case 'object':
        return schema.additionalProperties ? DefaultFields.OpenObjectField : DefaultFields.ObjectField;
    }
  }

  return DefaultFields.UnsupportedField;
}
