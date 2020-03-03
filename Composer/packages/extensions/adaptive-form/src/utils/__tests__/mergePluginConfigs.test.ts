// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes, SDKRoles, SDKKinds } from '@bfc/shared';

import { mergePluginConfigs } from '../mergePluginConfigs';
import DefaultUISchema from '../../defaultUiSchema';
import DefaultRoleSchema from '../../defaultRoleSchema';
import DefaultRecognizers from '../../defaultRecognizers';

describe('mergePluginConfigs', () => {
  it('returns default ui schema when no overrides', () => {
    expect(mergePluginConfigs()).toEqual({
      uiSchema: DefaultUISchema,
      roleSchema: DefaultRoleSchema,
      recognizers: DefaultRecognizers,
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
      "hidden": Array [
        "foo",
      ],
    },
  },
  "recognizers": Array [
    Object {
      "displayName": [Function],
      "handleChange": [Function],
      "id": "none",
    },
    Object {
      "displayName": [Function],
      "editor": [Function],
      "handleChange": [Function],
      "id": "Microsoft.RegexRecognizer",
    },
  ],
  "roleSchema": Object {
    "expression": Object {
      "label": "expression label",
    },
  },
  "uiSchema": Object {
    "Microsoft.AdaptiveDialog": Object {
      "hidden": Array [
        "recognizer",
      ],
      "order": Array [
        "recognizer",
        "*",
      ],
      "properties": Object {
        "recognizer": Object {
          "description": [Function],
          "label": [Function],
        },
        "triggers": Object {
          "label": "Foo",
        },
      },
    },
    "Microsoft.BeginDialog": Object {
      "order": Array [
        "dialog",
        "options",
        "resultProperty",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.CancelAllDialogs": Object {
      "order": Array [
        "dialog",
        "property",
        "*",
      ],
    },
    "Microsoft.DebugBreak": Object {
      "label": "Debug Breack",
    },
    "Microsoft.DeleteProperties": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": "Delete Properties",
    },
    "Microsoft.DeleteProperty": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": "Delete a Property",
    },
    "Microsoft.EditActions": Object {
      "label": "Modify active dialog",
    },
    "Microsoft.EditArray": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": "Edit an Array Property",
    },
    "Microsoft.EmitEvent": Object {
      "helpLink": "https://aka.ms/bfc-custom-events",
      "label": "Emit a custom event",
    },
    "Microsoft.Foreach": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "itemsProperty",
        "*",
      ],
    },
    "Microsoft.ForeachPage": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "itemsProperty",
        "pageSize",
        "*",
      ],
    },
    "Microsoft.HttpRequest": Object {
      "order": Array [
        "method",
        "url",
        "body",
        "headers",
        "*",
      ],
    },
    "Microsoft.IfCondition": Object {
      "hidden": Array [
        "actions",
        "elseActions",
      ],
    },
    "Microsoft.OAuthInput": Object {
      "order": Array [
        "connectionName",
        "*",
      ],
    },
    "Microsoft.OnActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnBeginDialog": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnCancelDialog": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnCondition": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnConversationUpdateActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnCustomEvent": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnDialogEvent": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnEndOfConversationActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnError": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnEventActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnHandoffActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnIntent": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "intent",
        "condition",
        "entities",
        "*",
      ],
    },
    "Microsoft.OnInvokeActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnMessageActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnMessageDeleteActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnMessageReactionActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnMessageUpdateActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnRepromptDialog": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnTypingActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.OnUnknownIntent": Object {
      "hidden": Array [
        "actions",
      ],
      "order": Array [
        "condition",
        "*",
      ],
    },
    "Microsoft.Recognizer": Object {
      "field": [Function],
    },
    "Microsoft.RegexRecognizer": Object {
      "hidden": Array [
        "entities",
      ],
    },
    "Microsoft.RepeatDialog": Object {
      "order": Array [
        "options",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.ReplaceDialog": Object {
      "order": Array [
        "dialog",
        "options",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.SendActivity": Object {
      "order": Array [
        "activity",
        "*",
      ],
    },
    "Microsoft.SetProperties": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": "Set Properties",
    },
    "Microsoft.SetProperty": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": "Set a Property",
    },
    "Microsoft.SwitchCondition": Object {
      "hidden": Array [
        "default",
      ],
      "properties": Object {
        "cases": Object {
          "hidden": Array [
            "actions",
          ],
        },
      },
    },
  },
}
`);
  });
});
