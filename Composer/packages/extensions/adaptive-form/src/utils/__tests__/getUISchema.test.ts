// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { getUISchema } from '../getUISchema';

describe('getUISchema', () => {
  it('returns empty object when type schema not found', () => {
    // @ts-ignore - Intentionally passing in an invalid value
    expect(getUISchema('SomeDialog')).toEqual({});
  });

  it('returns UI schema for $type', () => {
    expect(getUISchema(SDKTypes.AdaptiveDialog)).toMatchInlineSnapshot(`Object {}`);
  });

  it('merges overrides into default schema', () => {
    const schema1: UISchema = {
      [SDKTypes.AdaptiveDialog]: {
        order: ['*', 'recognizer'],
        label: 'First Label',
      },
    };
    expect(getUISchema(SDKTypes.AdaptiveDialog, schema1)).toMatchInlineSnapshot(`
Object {
  "ui:label": "First Label",
  "ui:order": Array [
    "*",
    "recognizer",
  ],
}
`);
  });
});
