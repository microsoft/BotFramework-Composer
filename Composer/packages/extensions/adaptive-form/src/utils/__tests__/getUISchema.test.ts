// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema, JSONSchema7 } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { getUISchema } from '../getUISchema';

describe('getUISchema', () => {
  it('returns empty object when type schema not found', () => {
    // @ts-ignore - Intentionally passing in an invalid value
    expect(getUISchema('SomeDialog')).toEqual({});
  });

  it('returns UI schema for $kind', () => {
    const schema: JSONSchema7 = {
      properties: {
        $kind: {
          const: SDKKinds.AdaptiveDialog,
        },
      },
    };
    expect(getUISchema(schema)).toMatchInlineSnapshot(`Object {}`);
  });

  it('merges overrides into default schema', () => {
    const schema: JSONSchema7 = {
      properties: {
        $kind: {
          const: SDKKinds.AdaptiveDialog,
        },
      },
    };

    const uiSchema: UISchema = {
      [SDKKinds.AdaptiveDialog]: {
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
