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
            "label": "Prompt for a file or an attachment",
            "subtitle": [Function],
          },
          "Microsoft.BeginDialog": Object {
            "helpLink": "https://aka.ms/bfc-understanding-dialogs",
            "label": "Begin a new dialog",
            "order": Array [
              "dialog",
              "options",
              "resultProperty",
              "includeActivity",
              "*",
            ],
            "subtitle": [Function],
          },
          "Microsoft.BreakLoop": Object {
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.CancelAllDialogs": Object {
            "helpLink": "https://aka.ms/bfc-understanding-dialogs",
            "label": [Function],
            "order": Array [
              "dialog",
              "property",
              "*",
            ],
            "subtitle": [Function],
          },
          "Microsoft.ChoiceInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.ConfirmInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.ContinueLoop": Object {
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.DateTimeInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.DebugBreak": Object {
            "label": [Function],
          },
          "Microsoft.DeleteProperties": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.DeleteProperty": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.EditActions": Object {
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.EditArray": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.EmitEvent": Object {
            "helpLink": "https://aka.ms/bfc-custom-events",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.EndDialog": Object {
            "helpLink": "https://aka.ms/bfc-understanding-dialogs",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.EndTurn": Object {
            "helpLink": "https://aka.ms/bfc-understanding-dialogs",
            "label": [Function],
            "subtitle": [Function],
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
            "subtitle": [Function],
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
            "subtitle": [Function],
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
            "subtitle": [Function],
          },
          "Microsoft.IRecognizer": Object {
            "field": [Function],
            "helpLink": "https://aka.ms/BFC-Using-LU",
          },
          "Microsoft.IfCondition": Object {
            "helpLink": "https://aka.ms/bfc-controlling-conversation-flow",
            "hidden": Array [
              "actions",
              "elseActions",
            ],
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.LogAction": Object {
            "helpLink": "https://aka.ms/bfc-debugging-bots",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.NumberInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.OAuthInput": Object {
            "helpLink": "https://aka.ms/bfc-using-oauth",
            "label": [Function],
            "order": Array [
              "connectionName",
              "*",
            ],
            "subtitle": [Function],
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
            "subtitle": [Function],
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
            "subtitle": [Function],
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
            "subtitle": [Function],
          },
          "Microsoft.SendActivity": Object {
            "helpLink": "https://aka.ms/bfc-send-activity",
            "label": [Function],
            "order": Array [
              "activity",
              "*",
            ],
            "subtitle": [Function],
          },
          "Microsoft.SetProperties": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.SetProperty": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.SkillDialog": Object {
            "helpLink": "https://aka.ms/bfc-call-skill",
            "label": [Function],
            "subtitle": [Function],
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
            "subtitle": [Function],
          },
          "Microsoft.TextInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
            "subtitle": [Function],
          },
          "Microsoft.TraceActivity": Object {
            "helpLink": "https://aka.ms/bfc-debugging-bots",
            "label": [Function],
            "subtitle": [Function],
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
