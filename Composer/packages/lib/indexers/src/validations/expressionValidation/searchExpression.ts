// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import get from 'lodash/get';
import { MicrosoftIDialog } from '@bfc/shared';
import { SchemaDefinitions } from '@bfc/shared/lib/schemaUtils/types';

import { ExpressionProperty } from './types';
import { findRequiredProperties, findTypes, createPath } from './utils';

export const searchExpressions = (path: string, value: MicrosoftIDialog, type: string, schema: SchemaDefinitions) => {
  if (!schema) return [];
  const expressions: ExpressionProperty[] = [];
  const requiredProperties = findRequiredProperties(schema);
  Object.keys(value).forEach((key) => {
    const property = value[key];
    if (Array.isArray(property)) {
      const itemsSchema = get(schema, ['properties', key, 'items'], null);
      if (itemsSchema?.$role === 'expression') {
        property.forEach((child, index) => {
          expressions.push({
            value: child,
            required: !!requiredProperties[key],
            path: createPath(`${path}.${key}[${index}]`, type),
            types: findTypes(itemsSchema),
          });
        });
      } else if (itemsSchema?.type === 'object') {
        property.forEach((child, index) => {
          const result = searchExpressions(`${path}.${key}[${index}]`, child, type, itemsSchema);
          if (result) expressions.splice(0, 0, ...result);
        });
      }
    } else if (get(schema.properties[key], '$role') === 'expression') {
      expressions.push({
        value: property,
        required: !!requiredProperties[key],
        path: createPath(`${path}.${key}`, type),
        types: findTypes(schema.properties[key]),
      });
    }
  });
  return expressions;
};
