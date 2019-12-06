// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import has from 'lodash/has';
import keys from 'lodash/keys';

import { VisitorFunc, JsonWalk } from '../utils/jsonWalk';

import { IDefinition, IExpressionProperties } from './types';

function findAllProperties(obj: any, searchTarget: (value: any) => boolean): string[] {
  const properties: string[] = [];

  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    if (searchTarget(value)) {
      const parents = path.split('.');
      properties.push(parents[parents.length - 1]);
    }
    return false;
  };
  JsonWalk('$', obj, visitor);
  return properties;
}

function findAllRequiredType(definition: IDefinition): { [key: string]: boolean } {
  const types = definition.anyOf?.filter(x => x.title === 'Type');
  if (types && types.length) {
    return types[0].required.reduce((result: { [key: string]: boolean }, t: string) => {
      result[t] = true;
      return result;
    }, {});
  }
  return {};
}

export function getExpressionProperties(schema: any): IExpressionProperties {
  const definitions = schema.definitions;

  const expressionProperties: IExpressionProperties = {};

  keys(definitions).forEach((key: string) => {
    const definition = definitions[key];
    const requiredTypes = findAllRequiredType(definition);
    const properties = findAllProperties(definition.properties, value => {
      return has(value, '$role') && value.$role === 'expression';
    });

    if (properties.length) {
      expressionProperties[key] = { properties, requiredTypes };
    }
  });

  return expressionProperties;
}
