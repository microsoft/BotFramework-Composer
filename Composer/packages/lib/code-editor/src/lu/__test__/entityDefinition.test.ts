// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ListEntity, Entity } from '../types';
import { getEntityLuDefinition } from '../utils/entityDefinition';

const listEntity: ListEntity = {
  name: 'listEntity',
  entityType: 'list',
  items: [
    {
      id: 0,
      normalizedValue: '123',
      synonyms: ['1', '2', '3'],
    },
    {
      id: 1,
      normalizedValue: '456',
      synonyms: [],
    },
    {
      id: 2,
      normalizedValue: '987',
      synonyms: ['9', '8', '7'],
    },
  ],
};

const listEntityWithoutSynonyms: ListEntity = {
  name: 'listEntityWithoutSynonyms',
  entityType: 'list',
  items: [
    {
      id: 0,
      normalizedValue: '1',
      synonyms: [],
    },
    {
      id: 1,
      normalizedValue: '2',
      synonyms: [],
    },
    {
      id: 2,
      normalizedValue: '3',
      synonyms: [],
    },
  ],
};

const listEntityDefinition =
  '@ list listEntity =\n\t- 123 :\n\t\t- 1\n\t\t- 2\n\t\t- 3\n\t- 456 :\n\t- 987 :\n\t\t- 9\n\t\t- 8\n\t\t- 7\n';
const listEntityWithoutSynonymsDefinition = '@ list listEntityWithoutSynonyms =\n\t- 1 :\n\t- 2 :\n\t- 3 :\n';

const unsupportedEntity = {
  entityType: 'ml',
};

describe('entityDefinition', () => {
  it('Should return correct definition for list entity', () => {
    const definition = getEntityLuDefinition(listEntity);

    expect(definition).toBe(listEntityDefinition);
  });

  it('Should return correct definition for list entity without any synonyms', () => {
    const definition = getEntityLuDefinition(listEntityWithoutSynonyms);

    expect(definition).toBe(listEntityWithoutSynonymsDefinition);
  });

  it('Should throw for unsupported entity', () => {
    expect(() => getEntityLuDefinition(unsupportedEntity as Entity)).toThrowError();
  });
});
