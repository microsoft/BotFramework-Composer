// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { valueTypeDefinitions } from '../schema';
import { getDefinitions } from '../utils/getDefinitions';

describe('getDefinitions', () => {
  it('returns empty', () => {
    const definitions = getDefinitions([], valueTypeDefinitions);
    expect(definitions).toMatchObject({});
  });

  it('returns definitions', () => {
    const definitions = getDefinitions(
      [{ type: 'integer' }, { $ref: '#/definitions/booleanExpression' }],
      valueTypeDefinitions
    );

    expect(definitions).toEqual(
      expect.objectContaining({
        booleanExpression: expect.any(Object),
      })
    );
  });

  it('returns nested definitions', () => {
    const definitions = getDefinitions([{ $ref: '#/definitions/valueExpression' }], valueTypeDefinitions);

    expect(definitions).toEqual(
      expect.objectContaining({
        equalsExpression: expect.any(Object),
        valueExpression: expect.any(Object),
      })
    );
  });
});
