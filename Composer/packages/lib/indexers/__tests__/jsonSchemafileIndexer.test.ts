// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { jsonSchemaFileIndexer } from '../src/jsonSchemaFileIndexer';
import { FileInfo } from '../src/type';

const { index } = jsonSchemaFileIndexer;

describe('jsonSchemaFileIndexer', () => {
  describe('index', () => {
    it('should return json schema files', () => {
      const input: FileInfo[] = [
        {
          name: 'test1.json',
          relativePath: './test1.lg',
          content: '{ "$schema":"http://json-schema.org/draft/schema" }',
          path: '/',
        },
        {
          name: 'test2.json',
          relativePath: './test2.lg',
          content: '{ "$schema":"http://json-schema.org/draft-07/schema" }',
          path: '/',
        },
        {
          name: 'test3.json',
          relativePath: './test3.lg',
          content: '{ "$schema":"http://json-schema.org/draft-07/schemav2" }',
          path: '/',
        },
      ];

      const expected = input.map((i) => {
        return {
          name: i.name,
          content: JSON.parse(i.content),
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
          name: 'test1.json',
          relativePath: './test1.lg',
          content: '{ "$schema":"http://microsoft.org/wsp" }',
          path: '/',
        },
        {
          name: 'test2.json',
          relativePath: './test2.lg',
          content: '{ "$schema":"http://json-schema.org/draft-07/schema" }',
          path: '/',
        },
        {
          name: 'test3.json',
          relativePath: './test3.lg',
          content: '{ "$schema":"http://microsoft.org/wsp" }',
          path: '/',
        },
      ];

      const expected = [
        {
          name: input[1].name,
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
