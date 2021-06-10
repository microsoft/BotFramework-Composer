// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Entity, ListEntity } from '../types';
import { getDuplicateName } from '../../utils/luUtils';

const getListEntityLuDefinition = (listEntity: ListEntity, entityNames: string[]): string => {
  const entityName = getDuplicateName(listEntity.name, entityNames);
  const definition = `@ list ${entityName} =\n`;

  return listEntity.items.reduce((acc, item) => {
    acc += `\t- ${item.normalizedValue} :${item.synonyms.length ? '\n' : ''}`;
    if (item.synonyms.length) {
      acc += item.synonyms.map((s) => `\t\t- ${s}`).join('\n');
    }
    return `${acc}\n`;
  }, definition);
};

export const getEntityLuDefinition = (entity: Entity, entityNames: string[] = []): string => {
  switch (entity.entityType) {
    case 'list':
      return getListEntityLuDefinition(entity, entityNames);
    default:
      throw `converting "${entity.entityType}" to LU definition is not implemented!`;
  }
};
