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
    expect(getUISchema(SDKTypes.AdaptiveDialog)).toMatchInlineSnapshot(`
Object {
  "properties": Object {
    "recognizer": Object {
      "properties": Object {
        "intents": Object {
          "properties": Object {
            "intent": Object {
              "ui:field": [Function],
              "ui:label": false,
            },
            "pattern": Object {
              "ui:field": [Function],
              "ui:label": false,
            },
          },
        },
      },
      "ui:hidden": Array [
        "entities",
      ],
    },
  },
  "ui:hidden": Array [
    "triggers",
    "autoEndDialog",
    "generator",
    "selector",
    "$type",
    "$id",
    "$copy",
    "$designer",
    "id",
  ],
  "ui:order": Array [
    "recognizer",
    "*",
  ],
}
`);
  });

  it('merges overrides into default schema', () => {
    const schema1: UISchema = {
      [SDKTypes.AdaptiveDialog]: {
        'ui:order': ['*', 'recognizer'],
        'ui:label': 'First Label',
      },
    };
    const schema2: UISchema = {
      [SDKTypes.AdaptiveDialog]: {
        'ui:label': 'Second Label',
      },
    };
    expect(getUISchema(SDKTypes.AdaptiveDialog, schema1, schema2)).toMatchInlineSnapshot(`
Object {
  "properties": Object {
    "recognizer": Object {
      "properties": Object {
        "intents": Object {
          "properties": Object {
            "intent": Object {
              "ui:field": [Function],
              "ui:label": false,
            },
            "pattern": Object {
              "ui:field": [Function],
              "ui:label": false,
            },
          },
        },
      },
      "ui:hidden": Array [
        "entities",
      ],
    },
  },
  "ui:hidden": Array [
    "triggers",
    "autoEndDialog",
    "generator",
    "selector",
    "$type",
    "$id",
    "$copy",
    "$designer",
    "id",
  ],
  "ui:label": "Second Label",
  "ui:order": Array [
    "*",
    "recognizer",
  ],
}
`);
  });
});
