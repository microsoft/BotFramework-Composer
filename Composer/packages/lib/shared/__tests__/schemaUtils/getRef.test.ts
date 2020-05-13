// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getRef } from '../../src/schemaUtils/getRef';
import { dereference } from '../../src/schemaUtils/dereference';
import { SchemaDefinitions } from '../../src/schemaUtils/types';

jest.mock('../../src/schemaUtils/dereference', () => ({
  dereference: jest.fn(),
}));

const defs: SchemaDefinitions = {
  'Microsoft.IDialog': {
    oneOf: [
      {
        $ref: '#/definitions/Microsoft.Foo',
      },
      {
        $ref: '#/definitions/Microsoft.Bar',
      },
    ],
  },
  'Microsoft.Foo': {
    properties: {
      actions: {
        type: 'array',
        items: {
          $ref: '#/definitions/Microsoft.IDialog',
        },
      },
    },
  },
  'Microsoft.Bar': {
    properties: {
      name: {
        type: 'string',
      },
    },
  },
};

beforeEach(() => {
  (dereference as jest.Mock).mockClear();
});

describe('getRef', () => {
  describe('when there is a cache hit', () => {
    const cache = new Map([['Microsoft.Bar', 'cache value']]);

    it('returns the item in the cache', () => {
      expect(getRef('#/definitions/Microsoft.Bar', defs, cache)).toEqual('cache value');
    });

    it('does not attempt to dereference', () => {
      getRef('#/definitions/Microsoft.Bar', defs, cache);
      expect(dereference).not.toHaveBeenCalled();
    });
  });

  describe('when there is a cache miss', () => {
    const emptyCache = new Map();

    it('throws an error when the definition does not exist', () => {
      expect(() => getRef('#/definitions/Foobar', defs, emptyCache)).toThrow('Definition not found for Foobar');
    });

    describe('when a definition is found', () => {
      it('dereferences if def is not a circular reference', () => {
        (dereference as jest.Mock).mockReturnValue('dereferenced def');
        expect(getRef('#/definitions/Microsoft.Foo', defs, emptyCache)).toEqual('dereferenced def');
      });

      it('updates the cache with the resolved ref', () => {
        (dereference as jest.Mock).mockReturnValue('dereferenced def');
        getRef('#/definitions/Microsoft.Foo', defs, emptyCache);
        expect(emptyCache.get('Microsoft.Foo')).toEqual('dereferenced def');
      });

      it('does not attempt to dereference if def is a circular reference', () => {
        getRef('#/definitions/Microsoft.IDialog', defs, emptyCache);
        expect(dereference).not.toHaveBeenCalled();
      });
    });
  });
});
