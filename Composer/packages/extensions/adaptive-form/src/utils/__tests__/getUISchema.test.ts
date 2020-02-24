// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema4 } from 'json-schema';
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { getUISchema } from '../getUISchema';

describe('getUISchema', () => {
  it('returns empty object when type schema not found', () => {
    // @ts-ignore - Intentionally passing in an invalid value
    expect(getUISchema('SomeDialog')).toEqual({});
  });

  it('returns UI schema for $type', () => {
    const schema: JSONSchema4 = {
      properties: {
        $kind: {
          const: SDKTypes.AdaptiveDialog,
        },
      },
    };
    expect(getUISchema(schema)).toMatchInlineSnapshot(`Object {}`);
  });

  it('merges overrides into default schema', () => {
    const schema: JSONSchema4 = {
      properties: {
        $kind: {
          const: SDKTypes.AdaptiveDialog,
        },
      },
    };

    const uiSchema: UISchema = {
      [SDKTypes.AdaptiveDialog]: {
        order: ['*', 'recognizer'],
        label: 'First Label',
      },
    };
    expect(getUISchema(schema, uiSchema)).toMatchInlineSnapshot(`
Object {
  "label": "First Label",
  "order": Array [
    "*",
    "recognizer",
  ],
}
`);
  });
});
