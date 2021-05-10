// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import values from 'lodash/values';
import { FieldNames, JSONSchema7 } from '@bfc/shared';

import { StringMapExpressionType } from './types';

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
  if (types?.length) {
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

/*
  case:
    json filed type is string;
    the $role is expression;
    there is no oneOf;

    we don't know which return type is correct,
    so we think the expression support all return types.

  case:
    the $role is expression;
    the oneOf has some normal types and there is no expression in oneOf

    the return type is one of the types in oneOf filed.

  case:
    the $role is expression;
    the oneOf has some normal types and there is a expression role in oneOf

    the filed maybe a string expression and the expression return type is one of the types in oneOf filed besides the type with expression role.
*/
export function findTypes(schema: JSONSchema7): number[] {
  if (!schema) return [];
  let types: number[] = [];

  if (schema.type === 'string' && schema.$role === 'expression') {
    return [StringMapExpressionType.all];
  }

  if (schema.type && Array.isArray(schema.type)) {
    types = schema.type.map((item: string) => StringMapExpressionType[item]);
  }

  if (schema.oneOf) {
    types = schema.oneOf?.reduce((result: number[], item) => {
      if (item.$role === 'expression') return result;

      if (item.type) {
        if (Array.isArray(item.type)) {
          result.push(...item.type.map((i: string) => StringMapExpressionType[i]));
        } else {
          result.push(StringMapExpressionType[item.type]);
        }
      }

      return result;
    }, []);
    if (types.length === 0) types.push(StringMapExpressionType.all);
  }

  return Array.from(new Set<number>(types));
}
