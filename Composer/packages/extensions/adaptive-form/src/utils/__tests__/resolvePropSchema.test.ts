// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resolvePropSchema } from '../resolvePropSchema';
import { resolveRef } from '../resolveRef';

jest.mock('../resolveRef', () => ({
  resolveRef: jest.fn().mockImplementation((obj) => ({
    ...obj,
    resolved: true,
  })),
}));

describe('resolvePropSchema', () => {
  const definitions = {
    foo: {
      title: 'Foo Title',
    },
  };

  it('returns undefined if the schema does not have properties', () => {
    expect(resolvePropSchema({}, 'foo', definitions)).toBe(undefined);
  });

  it('resolves the property schema', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'object',
          properties: {
            bar: {
              type: 'string',
            },
          },
        },
      },
    };

    // @ts-ignore
    const resolved = resolvePropSchema(schema, 'foo', definitions);
    expect(resolveRef).toBeCalledWith(schema.properties.foo, definitions);

    expect(resolved).toMatchObject({
      ...schema.properties.foo,
      resolved: true,
    });
  });
});
