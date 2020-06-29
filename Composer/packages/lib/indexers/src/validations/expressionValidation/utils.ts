// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import values from 'lodash/values';
import { FieldNames } from '@bfc/shared';

import { ExpressionType } from './types';

export const createPath = (path: string, type: string): string => {
  let list = path.split('.');
  const matches = list.filter((x) => {
    if (/\[|\]/.test(x)) {
      const reg = /\[.*\]/;
      x = x.replace(reg, '');
      return values(FieldNames).includes(x);
    }
  });

  const focused = matches.join('.');
  list = path.split(`${focused}.`);
  if (list.length !== 2) return `${path}#${type}`;

  return `${list[0]}${focused}#${type}#${list[1]}`;
};

export function findRequiredProperties(schema: any): { [key: string]: boolean } {
  if (!schema) return {};
  const types = schema.anyOf?.filter((x) => x.title === 'Type');
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

export function findTypes(schema: any): string[] {
  if (!schema) return [];
  let types: string[] = [];
  if (schema.type) {
    if (Array.isArray(schema.type)) {
      types = [...types, ...schema.type];
    } else {
      types.push(schema.type);
    }
  } else {
    types = schema.oneOf?.filter((item) => !!ExpressionType[item.type]).map((item) => item.type);
  }

  return Array.from(new Set<string>(types));
}
