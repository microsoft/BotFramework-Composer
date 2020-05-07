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
<<<<<<< HEAD
            "label": "Prompt for a file or an attachment",
            "subtitle": [Function],
          },
          "Microsoft.BeginDialog": Object {
            "helpLink": "https://aka.ms/bfc-understanding-dialogs",
            "label": "Begin a new dialog",
=======
            "label": "Prompt for Attachment",
          },
          "Microsoft.BeginDialog": Object {
            "helpLink": "https://aka.ms/bfc-understanding-dialogs",
            "label": "Begin a Dialog",
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
            "order": Array [
              "dialog",
              "options",
              "resultProperty",
              "includeActivity",
              "*",
            ],
<<<<<<< HEAD
            "subtitle": [Function],
          },
          "Microsoft.BreakLoop": Object {
            "label": [Function],
            "subtitle": [Function],
=======
          },
          "Microsoft.BreakLoop": Object {
            "label": [Function],
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.CancelAllDialogs": Object {
            "helpLink": "https://aka.ms/bfc-understanding-dialogs",
            "label": [Function],
            "order": Array [
              "dialog",
              "property",
              "*",
            ],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.ChoiceInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.ConfirmInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
          },
          "Microsoft.ContinueLoop": Object {
            "label": [Function],
            "subtitle": [Function],
=======
          },
          "Microsoft.ContinueLoop": Object {
            "label": [Function],
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.DateTimeInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.DebugBreak": Object {
            "label": [Function],
          },
          "Microsoft.DeleteProperties": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.DeleteProperty": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
          },
          "Microsoft.EditActions": Object {
            "label": [Function],
            "subtitle": [Function],
=======
          },
          "Microsoft.EditActions": Object {
            "label": [Function],
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.EditArray": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.EmitEvent": Object {
            "helpLink": "https://aka.ms/bfc-custom-events",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.EndDialog": Object {
            "helpLink": "https://aka.ms/bfc-understanding-dialogs",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.EndTurn": Object {
            "helpLink": "https://aka.ms/bfc-understanding-dialogs",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
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
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
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
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
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
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
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
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.LogAction": Object {
            "helpLink": "https://aka.ms/bfc-debugging-bots",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.NumberInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.OAuthInput": Object {
            "helpLink": "https://aka.ms/bfc-using-oauth",
            "label": [Function],
            "order": Array [
              "connectionName",
              "*",
            ],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
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
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
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
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
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
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.SendActivity": Object {
            "helpLink": "https://aka.ms/bfc-send-activity",
            "label": [Function],
            "order": Array [
              "activity",
              "*",
            ],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.SetProperties": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.SetProperty": Object {
            "helpLink": "https://aka.ms/bfc-using-memory",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.SkillDialog": Object {
            "helpLink": "https://aka.ms/bfc-call-skill",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
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
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.TextInput": Object {
            "helpLink": "https://aka.ms/bfc-ask-for-user-input",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
          },
          "Microsoft.TraceActivity": Object {
            "helpLink": "https://aka.ms/bfc-debugging-bots",
            "label": [Function],
<<<<<<< HEAD
            "subtitle": [Function],
=======
>>>>>>> a9da501221c9976a25e2e740948b3ff311742cd5
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
