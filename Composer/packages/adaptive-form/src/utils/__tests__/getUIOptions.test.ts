// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema, JSONSchema7, RoleSchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { getUIOptions } from '../getUIOptions';

describe('getUIOptions', () => {
  it('returns empty object when type schema not found', () => {
    // @ts-ignore - Intentionally passing in an invalid value
    expect(getUIOptions('SomeDialog')).toEqual({});
  });

  it('returns UI schema for $kind', () => {
    const schema: JSONSchema7 = {
      properties: {
        $kind: {
          const: SDKKinds.AdaptiveDialog,
        },
      },
    };
    expect(getUIOptions(schema)).toMatchInlineSnapshot(`Object {}`);
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
    expect(getUIOptions(schema, uiSchema)).toMatchInlineSnapshot(`
      Object {
        "label": "First Label",
        "order": Array [
          "*",
          "recognizer",
        ],
      }
    `);
  });

  it('merges overrides and a plugin into default schema', () => {
    const schema: JSONSchema7 = {
      $role: 'expression',
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

    const plugin: RoleSchema = {
      expression: {
        helpLink: 'https://example.com/plugin',
      },
    };

    expect(getUIOptions(schema, uiSchema, plugin)).toMatchInlineSnapshot(`
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
