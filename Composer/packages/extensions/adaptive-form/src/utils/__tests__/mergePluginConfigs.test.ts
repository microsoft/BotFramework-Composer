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
  "uiSchema": Object {
    "Microsoft.AdaptiveDialog": Object {
      "description": "This configures a data driven dialog via a collection of events and actions.",
      "helpLink": "https://aka.ms/botframework",
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
    "Microsoft.AttachmentInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
    },
    "Microsoft.BeginDialog": Object {
      "helpLink": "https://aka.ms/bfc-understanding-dialogs",
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
      "order": Array [
        "dialog",
        "property",
        "*",
      ],
    },
    "Microsoft.ChoiceInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
    },
    "Microsoft.ConfirmInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
    },
    "Microsoft.DateTimeInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
    },
    "Microsoft.DebugBreak": Object {
      "label": [Function],
    },
    "Microsoft.DeleteProperties": Object {
      "helpLink": "https://aka.ms/bfc-using-memory",
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
    },
    "Microsoft.Foreach": Object {
      "helpLink": "https://aka.ms/bfc-controlling-conversation-flow",
      "hidden": Array [
        "actions",
      ],
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
      "order": Array [
        "itemsProperty",
        "pageSize",
        "*",
      ],
    },
    "Microsoft.HttpRequest": Object {
      "helpLink": "https://aka.ms/bfc-using-http",
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
    },
    "Microsoft.LogAction": Object {
      "helpLink": "https://aka.ms/bfc-debugging-bots",
    },
    "Microsoft.LuisRecognizer": Object {
      "helpLink": "https://aka.ms/BFC-Using-LU",
    },
    "Microsoft.MultiLanguageRecognizer": Object {
      "helpLink": "https://aka.ms/BFC-Using-LU",
    },
    "Microsoft.NumberInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
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
      "description": "Handle the events fired when a user begins a new conversation with the bot.",
      "helpLink": "https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-conversations?view=azure-bot-service-4.0#conversation-lifetime",
      "hidden": Array [
        "actions",
      ],
      "label": "Greeting",
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
      "properties": Object {
        "intent": Object {
          "field": [Function],
        },
      },
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
    "Microsoft.QnAMakerDialog": Object {
      "helpLink": "https://aka.ms/bfc-using-QnA",
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
      "order": Array [
        "options",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.ReplaceDialog": Object {
      "helpLink": "https://aka.ms/bfc-understanding-dialogs",
      "order": Array [
        "dialog",
        "options",
        "includeActivity",
        "*",
      ],
    },
    "Microsoft.SendActivity": Object {
      "helpLink": "https://aka.ms/bfc-send-activity",
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
    },
    "Microsoft.SwitchCondition": Object {
      "helpLink": "https://aka.ms/bfc-controlling-conversation-flow",
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
    "Microsoft.TextInput": Object {
      "helpLink": "https://aka.ms/bfc-ask-for-user-input",
    },
    "Microsoft.TraceActivity": Object {
      "helpLink": "https://aka.ms/bfc-debugging-bots",
    },
  },
}
`);
  });
});
