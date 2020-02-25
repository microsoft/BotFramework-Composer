// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes, SDKRoles, SDKKinds } from '@bfc/shared';

import { mergePluginConfigs } from '../mergePluginConfigs';
import DefaultUISchema from '../../defaultUiSchema';
import DefaultRoleSchema from '../../defaultRoleSchema';
import DefaultKindSchema from '../../defaultKindSchema';

describe('mergePluginConfigs', () => {
  it('returns default ui schema when no overrides', () => {
    expect(mergePluginConfigs()).toEqual({
      uiSchema: DefaultUISchema,
      roleSchema: DefaultRoleSchema,
      kindSchema: DefaultKindSchema,
    });
  });

  it('merges overrides into the defaults', () => {
    const overrides = {
      uiSchema: {
        [SDKTypes.AdaptiveDialog]: {
          hidden: ['recognizer'],
          properties: {
            triggers: {
              label: 'Foo',
            },
          },
        },
      },
      roleSchema: {
        [SDKRoles.expression]: {
          label: 'expression label',
        },
      },
      kindSchema: {
        [SDKKinds.IDialog]: {
          hidden: ['foo'],
        },
      },
    };

    expect(mergePluginConfigs(overrides)).toMatchInlineSnapshot(`
Object {
  "kindSchema": Object {
    "Microsoft.IDialog": Object {
      "ui:hidden": Array [
        "foo",
      ],
    },
    "Microsoft.Recognizer": Object {
      "ui:field": [Function],
    },
  },
  "roleSchema": Object {
    "expression": Object {
      "ui:field": [Function],
      "ui:label": "expression label",
    },
  },
  "uiSchema": Object {
    "Microsoft.AdaptiveDialog": Object {
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
        "triggers": Object {
          "ui:label": "Foo",
        },
      },
      "ui:hidden": Array [
        "recognizer",
      ],
      "ui:order": Array [
        "recognizer",
        "*",
      ],
    },
    "Microsoft.BeginDialog": Object {
      "ui:order": Array [
        "dialog",
        "options",
        "resultProperty",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.CancelAllDialogs": Object {
      "ui:order": Array [
        "dialog",
        "property",
        "*",
      ],
    },
    "Microsoft.ConditionalSelector": Object {
      "ui:hidden": Array [
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
    },
    "Microsoft.EditActions": Object {},
    "Microsoft.Foreach": Object {
      "ui:hidden": Array [
        "actions",
      ],
      "ui:order": Array [
        "itemsProperty",
        "*",
      ],
    },
    "Microsoft.ForeachPage": Object {
      "ui:hidden": Array [
        "actions",
      ],
      "ui:order": Array [
        "itemsProperty",
        "pageSize",
        "*",
      ],
    },
    "Microsoft.HttpRequest": Object {
      "ui:order": Array [
        "method",
        "url",
        "body",
        "headers",
        "*",
      ],
    },
    "Microsoft.IfCondition": Object {
      "ui:hidden": Array [
        "actions",
        "elseActions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
    },
    "Microsoft.MostSpecificSelector": Object {
      "ui:hidden": Array [
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
    },
    "Microsoft.OAuthInput": Object {
      "ui:order": Array [
        "connectionName",
        "*",
      ],
    },
    "Microsoft.OnActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnBeginDialog": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnCancelDialog": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnCondition": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnConversationUpdateActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnCustomEvent": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnDialogEvent": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnEndOfConversationActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnError": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnEventActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnHandoffActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnIntent": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "intent",
        "condition",
        "entities",
        "*",
      ],
    },
    "Microsoft.OnInvokeActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnMessageActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnMessageDeleteActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnMessageReactionActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnMessageUpdateActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnRepromptDialog": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnTypingActivity": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnUnknownIntent": Object {
      "ui:hidden": Array [
        "actions",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.RepeatDialog": Object {
      "ui:hidden": Array [
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "options",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.ReplaceDialog": Object {
      "ui:hidden": Array [
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
      "ui:order": Array [
        "dialog",
        "options",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.SendActivity": Object {
      "ui:hidden": Array [
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
    },
    "Microsoft.SetProperties": Object {},
    "Microsoft.SwitchCondition": Object {
      "properties": Object {
        "cases": Object {
          "ui:hidden": Array [
            "actions",
          ],
        },
      },
      "ui:hidden": Array [
        "default",
        "$type",
        "$id",
        "$copy",
        "$designer",
        "id",
      ],
    },
  },
}
`);
  });
});
