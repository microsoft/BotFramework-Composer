// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import has from 'lodash/has';
import get from 'lodash/get';

import { VisitorFunc, JsonWalk } from '../utils/jsonWalk';

import { ISearchTarget, ISearchResult } from './types';

const defaultExpressionSearchTargets = [
  {
    type: '$role',
    value: 'expression',
  },
];

function findAllProperties(definition: any, searchTarget: ISearchTarget[]): string[] {
  let properties: string[] = [];

  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    const result = searchTarget.reduce((result: string[], target) => {
      if (has(value, target.type) && value[target.type] === target.value) {
        const parents = path.split('.');
        result.push(parents[parents.length - 1]);
      }
      return result;
    }, []);
    properties = [...properties, ...result];
    return false;
  };
  JsonWalk('$', definition, visitor);
  return properties;
}

/**
 * @param schema schema.
 * @param definitionPath The path of the definition in schema.
 * @param searchTargets
 * @returns all types.
 */
export function extractExpressionDefinitions(
  schema: any,
  definitionPath: string,
  searchTargets?: ISearchTarget[]
): ISearchResult {
  if (!schema) return {};
  const definitions = get(schema, definitionPath);
  if (!definitions) return {};
  const result = Object.keys(definitions).reduce((result: ISearchResult, key: string) => {
    const properties = findAllProperties(definitions[key], searchTargets || defaultExpressionSearchTargets);
    if (properties.length) {
      result[key] = properties;
    }
    return result;
  }, {});
  return result;
}
