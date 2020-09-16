// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resolveRef } from '../resolveRef';

describe('resolveRef', () => {
  it('returns the schema if no $ref is defined', () => {
    const schema = { type: 'string' };
    // @ts-expect-error
    expect(resolveRef(schema)).toEqual({ type: 'string' });
  });

  it('throws an error if a definition is missing', () => {
    const schema = { $ref: '#/definitions/MyDef' };
    expect(() => resolveRef(schema)).toThrowError('Missing definition for MyDef');
  });

  it('throws an error if a definition is is not an object', () => {
    const schema = { $ref: '#/definitions/MyDef' };
    const defs = { MyDef: true };
    expect(() => resolveRef(schema, defs)).toThrowError('Missing definition for MyDef');
  });
});
