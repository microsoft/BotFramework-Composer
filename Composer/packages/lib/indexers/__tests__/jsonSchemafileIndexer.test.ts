// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { jsonSchemaFileIndexer } from '../src/jsonSchemaFileIndexer';
import { FileInfo } from '../src/type';
import { getBaseName } from '../src/utils/help';

const { index } = jsonSchemaFileIndexer;

describe('jsonSchemaFileIndexer', () => {
  describe('index', () => {
    it('should return json schema files', () => {
      const input: FileInfo[] = [
        {
          name: 'test1.json',
          relativePath: './test1.json',
          content: '{ "$schema":"http://json-schema.org/draft/schema" }',
          path: '/',
        },
        {
          name: 'test2.json',
          relativePath: './test2.json',
          content: '{ "$schema":"http://json-schema.org/draft-07/schema" }',
          path: '/',
        },
        {
          name: 'test3.json',
          relativePath: './test3.json',
          content: '{ "$schema":"http://json-schema.org/draft-07/schemav2" }',
          path: '/',
        },
      ];

      const expected = input.map((item) => {
        return {
          name: getBaseName(item.name),
          content: JSON.parse(item.content),
        };
      });

      const actual = index(input);

      expect(actual).toHaveLength(expected.length);

      for (let i = 0; i < actual.length; i++) {
        expect(actual[i].id).toEqual(expected[i].name);
        expect(actual[i].content.$schema).toEqual(expected[i].content.$schema);
      }
    });

    it('should not return other json files', () => {
      const input: FileInfo[] = [
        {
          name: 'test1',
          relativePath: './test1.json',
          content: '{ "$schema":"http://microsoft.org/wsp" }',
          path: '/',
        },
        {
          name: 'test2',
          relativePath: './test2.json',
          content: '{ "$schema":"http://json-schema.org/draft-07/schema" }',
          path: '/',
        },
        {
          name: 'test3',
          relativePath: './test3.json',
          content: '{ "$schema":"http://microsoft.org/wsp" }',
          path: '/',
        },
      ];

      const expected = [
        {
          name: 'test2',
          content: JSON.parse(input[1].content),
        },
      ];

      const actual = index(input);

      expect(actual).toHaveLength(expected.length);

      for (let i = 0; i < actual.length; i++) {
        expect(actual[i].id).toEqual(expected[i].name);
        expect(actual[i].content.$schema).toEqual(expected[i].content.$schema);
      }
    });
  });
});
