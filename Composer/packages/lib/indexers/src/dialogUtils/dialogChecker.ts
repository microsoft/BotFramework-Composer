// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { FieldNames, Diagnostic } from '@bfc/shared';
import values from 'lodash/values';

import { ExpressionType } from './validation';
import { validate } from './validation';

type CheckerFunc = (path: string, value: any, type: string, schema: any) => Diagnostic[] | null; // error msg

export const createPath = (path: string, type: string): string => {
  let list = path.split('.');
  const matches = list.filter(x => {
    if (/\[|\]/.test(x)) {
      const reg = /\[.*\]/;
      x = x.replace(reg, '');
      return ~values(FieldNames).indexOf(x);
    }
  });

  const focused = matches.join('.');
  list = path.split(`${focused}.`);
  if (list.length !== 2) return `${path}#${type}`;

  return `${list[0]}${focused}#${type}#${list[1]}`;
};

function findAllRequiredProperties(schema: any): { [key: string]: boolean } {
  if (!schema) return {};
  const types = schema.anyOf?.filter(x => x.title === 'Type');
  const required = {};
  if (types && types.length) {
    types[0].required.forEach((element: string) => {
      required[element] = true;
    });
  }

  if (schema.required) {
    schema.required.forEach((element: string) => {
      required[element] = true;
    });
  }
  return required;
}

function findAllTypes(schema: any): string[] {
  if (!schema) return [];
  let types: string[] = [];
  if (schema.type) {
    if (Array.isArray(schema.type)) {
      types = [...types, ...schema.type];
    } else {
      types.push(schema.type);
    }
  } else {
    types = schema.oneOf?.filter(item => !!ExpressionType[item.type]).map(item => item.type);
  }

  return Array.from(new Set<string>(types));
}

export const IsExpression: CheckerFunc = (path, value, type, schema) => {
  if (!schema) return [];
  const diagnostics: Diagnostic[] = [];
  const requiredProperties = findAllRequiredProperties(schema);
  Object.keys(value).forEach(key => {
    const property = value[key];
    if (Array.isArray(property)) {
      const itemsSchema = get(schema, ['properties', key, 'items'], null);
      if (itemsSchema?.$role === 'expression') {
        property.forEach((child, index) => {
          const diagnostic = validate(
            child,
            !!requiredProperties[key],
            createPath(`${path}.${key}[${index}]`, type),
            findAllTypes(itemsSchema)
          );
          if (diagnostic) diagnostics.push(diagnostic);
        });
      } else if (itemsSchema?.type === 'object') {
        property.forEach((child, index) => {
          const result = IsExpression(`${path}.${key}[${index}]`, child, type, itemsSchema);
          if (result) diagnostics.splice(0, 0, ...result);
        });
      }
    } else if (get(schema.properties[key], '$role') === 'expression') {
      const diagnostic = validate(
        property,
        !!requiredProperties[key],
        createPath(`${path}.${key}`, type),
        findAllTypes(schema.properties[key])
      );
      if (diagnostic) diagnostics.push(diagnostic);
    }
  });
  return diagnostics;
};

export const checkerFuncs: { [type: string]: CheckerFunc[] } = {
  '.': [IsExpression], //this will check all types
};
