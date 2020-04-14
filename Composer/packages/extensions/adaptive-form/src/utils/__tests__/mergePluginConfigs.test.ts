// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds, SDKRoles } from '@bfc/shared';

import { mergePluginConfigs } from '../mergePluginConfigs';
import DefaultUISchema from '../../defaultUiSchema';
import DefaultRoleSchema from '../../defaultRoleSchema';
import DefaultRecognizers from '../../defaultRecognizers';

describe('mergePluginConfigs', () => {
  it('returns default ui schema when no overrides', () => {
    expect(mergePluginConfigs()).toEqual({
      formSchema: DefaultUISchema,
      roleSchema: DefaultRoleSchema,
      recognizers: DefaultRecognizers,
    });
  });

  it('merges overrides into the defaults', () => {
    const overrides = {
      formSchema: {
        [SDKKinds.AdaptiveDialog]: {
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
    };

    expect(mergePluginConfigs(overrides)).toMatchInlineSnapshot(`
Object {
  "formSchema": Object {
    "Microsoft.AdaptiveDialog": Object {
      "description": [Function],
      "helpLink": "https://aka.ms/botframework",
      "hidden": Array [
        "recognizer",
      ],
      "label": "Adaptive dialog",
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
    "Microsoft.AttachmentInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
      "label": "Prompt for Attachment",
    },
    "Microsoft.BeginDialog": Object {
      "helpLink": "https://aka.ms/bfc-understanding-dialogs",
      "label": "Begin a Dialog",
      "order": Array [
        "dialog",
        "options",
        "resultProperty",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.CancelAllDialogs": Object {
      "helpLink": "https://aka.ms/bfc-understanding-dialogs",
      "label": [Function],
      "order": Array [
        "dialog",
        "property",
        "*",
      ],
    },
    "Microsoft.ChoiceInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
      "label": [Function],
    },
    "Microsoft.ConfirmInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
      "label": [Function],
    },
    "Microsoft.DateTimeInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
      "label": [Function],
    },
    "Microsoft.DebugBreak": Object {
      "label": [Function],
    },
    "Microsoft.DeleteProperties": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": [Function],
    },
    "Microsoft.DeleteProperty": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": [Function],
    },
    "Microsoft.EditActions": Object {
      "label": [Function],
    },
    "Microsoft.EditArray": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": [Function],
    },
    "Microsoft.EmitEvent": Object {
      "helpLink": "https://aka.ms/bfc-custom-events",
      "label": [Function],
    },
    "Microsoft.EndDialog": Object {
      "helpLink": "https://aka.ms/bfc-understanding-dialogs",
      "label": [Function],
    },
    "Microsoft.EndTurn": Object {
      "helpLink": "https://aka.ms/bfc-understanding-dialogs",
      "label": [Function],
    },
    "Microsoft.Foreach": Object {
      "helpLink": "https://aka.ms/bfc-controlling-conversation-flow",
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "itemsProperty",
        "*",
      ],
    },
    "Microsoft.ForeachPage": Object {
      "helpLink": "https://aka.ms/bfc-controlling-conversation-flow",
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "itemsProperty",
        "pageSize",
        "*",
      ],
    },
    "Microsoft.HttpRequest": Object {
      "helpLink": "https://aka.ms/bfc-using-http",
      "label": [Function],
      "order": Array [
        "method",
        "url",
        "body",
        "headers",
        "*",
      ],
    },
    "Microsoft.IfCondition": Object {
      "helpLink": "https://aka.ms/bfc-controlling-conversation-flow",
      "hidden": Array [
        "actions",
        "elseActions",
      ],
      "label": [Function],
    },
    "Microsoft.LogAction": Object {
      "helpLink": "https://aka.ms/bfc-debugging-bots",
      "label": [Function],
    },
    "Microsoft.NumberInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
      "label": [Function],
    },
    "Microsoft.OAuthInput": Object {
      "helpLink": "https://aka.ms/bfc-using-oauth",
      "label": [Function],
      "order": Array [
        "connectionName",
        "*",
      ],
    },
    "Microsoft.OnActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnBeginDialog": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
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
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnConversationUpdateActivity": Object {
      "description": [Function],
      "helpLink": "https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-conversations?view=azure-bot-service-4.0#conversation-lifetime",
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnCustomEvent": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnDialogEvent": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnEndOfConversationActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnError": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnEventActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnHandoffActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnIntent": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "intent",
        "condition",
        "entities",
        "*",
      ],
      "properties": Object {
        "intent": Object {
          "field": [Function],
        },
      },
      "subtitle": [Function],
    },
    "Microsoft.OnInvokeActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnMessageActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnMessageDeleteActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnMessageReactionActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnMessageUpdateActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnRepromptDialog": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnTypingActivity": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.OnUnknownIntent": Object {
      "hidden": Array [
        "actions",
      ],
      "label": [Function],
      "order": Array [
        "condition",
        "*",
      ],
      "subtitle": [Function],
    },
    "Microsoft.QnAMakerDialog": Object {
      "helpLink": "https://aka.ms/bfc-using-QnA",
      "label": [Function],
    },
    "Microsoft.Recognizer": Object {
      "field": [Function],
      "helpLink": "https://aka.ms/BFC-Using-LU",
    },
    "Microsoft.RegexRecognizer": Object {
      "hidden": Array [
        "entities",
      ],
    },
    "Microsoft.RepeatDialog": Object {
      "helpLink": "https://aka.ms/bfc-understanding-dialogs",
      "label": [Function],
      "order": Array [
        "options",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.ReplaceDialog": Object {
      "helpLink": "https://aka.ms/bfc-understanding-dialogs",
      "label": [Function],
      "order": Array [
        "dialog",
        "options",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.SendActivity": Object {
      "helpLink": "https://aka.ms/bfc-send-activity",
      "label": [Function],
      "order": Array [
        "activity",
        "*",
      ],
    },
    "Microsoft.SetProperties": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": [Function],
    },
    "Microsoft.SetProperty": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
      "label": [Function],
    },
    "Microsoft.SkillDialog": Object {
      "helpLink": "https://aka.ms/bfc-call-skill",
      "label": [Function],
    },
    "Microsoft.SwitchCondition": Object {
      "helpLink": "https://aka.ms/bfc-controlling-conversation-flow",
      "hidden": Array [
        "default",
      ],
      "label": [Function],
      "properties": Object {
        "cases": Object {
          "hidden": Array [
            "actions",
          ],
        },
      },
    },
    "Microsoft.TextInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
      "label": [Function],
    },
    "Microsoft.TraceActivity": Object {
      "helpLink": "https://aka.ms/bfc-debugging-bots",
      "label": [Function],
    },
  },
  "recognizers": Array [
    Object {
      "displayName": [Function],
      "handleRecognizerChange": [Function],
      "id": "none",
      "isSelected": [Function],
    },
    Object {
      "displayName": [Function],
      "editor": [Function],
      "handleRecognizerChange": [Function],
      "id": "Microsoft.RegexRecognizer",
      "isSelected": [Function],
    },
  ],
  "roleSchema": Object {
    "expression": Object {
      "label": "expression label",
    },
  },
}
`);
  });
});
