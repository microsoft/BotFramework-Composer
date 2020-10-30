// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// This is a copy of the JSON that defines the EchoBot sample plus some
// additional dialogs and triggers, including a trigger with a syntax
// error for use with testing error messages.

export const SAMPLE_DIALOG = {
  isRoot: true,
  displayName: 'EchoBot-1',
  id: 'echobot-1',
  content: {
    $kind: 'Microsoft.AdaptiveDialog',
    $designer: { id: '433224', description: '', name: 'EchoBot-1' },
    autoEndDialog: true,
    defaultResultProperty: 'dialog.result',
    triggers: [
      {
        $kind: 'Microsoft.OnUnknownIntent',
        $designer: { id: '821845' },
        actions: [
          { $kind: 'Microsoft.SendActivity', $designer: { id: '003038' }, activity: '${SendActivity_003038()}' },
        ],
      },
      {
        $kind: 'Microsoft.OnConversationUpdateActivity',
        $designer: { id: '376720' },
        actions: [
          {
            $kind: 'Microsoft.Foreach',
            $designer: { id: '518944', name: 'Loop: for each item' },
            itemsProperty: 'turn.Activity.membersAdded',
            actions: [
              {
                $kind: 'Microsoft.IfCondition',
                $designer: { id: '641773', name: 'Branch: if/else' },
                condition: 'string(dialog.foreach.value.id) != string(turn.Activity.Recipient.id)',
                actions: [
                  {
                    $kind: 'Microsoft.SendActivity',
                    $designer: { id: '859266', name: 'Send a response' },
                    activity: '${SendActivity_Welcome()}',
                  },
                ],
              },
            ],
          },
        ],
      },
      { $kind: 'Microsoft.OnError', $designer: { id: 'XVSGCI' } },
      {
        $kind: 'Microsoft.OnIntent',
        $designer: { id: 'QIgTMy', name: 'more errors' },
        intent: 'test',
        actions: [{ $kind: 'Microsoft.SetProperty', $designer: { id: 'VyWC7G' }, value: '=[' }],
      },
    ],
    generator: 'echobot-1.lg',
    $schema:
      'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/stable/Composer/packages/server/schemas/sdk.schema',
    id: 'EchoBot-1',
    recognizer: 'echobot-1.lu.qna',
  },
  diagnostics: [
    {
      message:
        "must be an expression: syntax error at line 1:1 mismatched input '<EOF>' expecting {STRING_INTERPOLATION_START, '+', '-', '!', '(', '[', ']', '{', NUMBER, IDENTIFIER, STRING}",
      source: 'echobot-1',
      severity: 0,
      path: 'echobot-1.triggers[3].actions[0]#Microsoft.SetProperty#value',
    },
  ],
  referredDialogs: [],
  lgTemplates: [
    { name: 'SendActivity_003038', path: 'echobot-1.triggers[0].actions[0]' },
    { name: 'SendActivity_Welcome', path: 'echobot-1.triggers[1].actions[0].actions[0].actions[0]' },
  ],
  referredLuIntents: [{ name: 'test', path: 'echobot-1.triggers[3]#Microsoft.OnIntent' }],
  luFile: 'echobot-1',
  qnaFile: 'echobot-1',
  lgFile: 'echobot-1',
  triggers: [
    { id: 'triggers[0]', displayName: '', type: 'Microsoft.OnUnknownIntent', isIntent: false },
    { id: 'triggers[1]', displayName: '', type: 'Microsoft.OnConversationUpdateActivity', isIntent: false },
    { id: 'triggers[2]', displayName: '', type: 'Microsoft.OnError', isIntent: false },
    { id: 'triggers[3]', displayName: 'more errors', type: 'Microsoft.OnIntent', isIntent: true },
  ],
  intentTriggers: [
    { intent: 'test', dialogs: [] },
    { intent: 'test', dialogs: [] },
  ],
  skills: [],
};

export const SAMPLE_DIALOG_2 = {
  isRoot: false,
  displayName: 'EchoBot-1b',
  id: 'echobot-1b',
  content: {
    $kind: 'Microsoft.AdaptiveDialog',
    $designer: { id: '433224', description: '', name: 'EchoBot-1' },
    autoEndDialog: true,
    defaultResultProperty: 'dialog.result',
    triggers: [
      {
        $kind: 'Microsoft.OnUnknownIntent',
        $designer: { id: '821845' },
        actions: [
          { $kind: 'Microsoft.SendActivity', $designer: { id: '003038' }, activity: '${SendActivity_003038()}' },
        ],
      },
      { $kind: 'Microsoft.OnError', $designer: { id: 'XVSGCI' } },
      {
        $kind: 'Microsoft.OnIntent',
        $designer: { id: 'QIgTMy', name: 'more errors' },
        intent: 'test',
        actions: [{ $kind: 'Microsoft.SetProperty', $designer: { id: 'VyWC7G' }, value: '=[' }],
      },
    ],
    generator: 'echobot-1b.lg',
    $schema:
      'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/stable/Composer/packages/server/schemas/sdk.schema',
    id: 'EchoBot-1',
    recognizer: 'echobot-1b.lu.qna',
  },
  diagnostics: [],
  referredDialogs: [],
  lgTemplates: [
    { name: 'SendActivity_003038', path: 'echobot-1.triggers[0].actions[0]' },
    { name: 'SendActivity_Welcome', path: 'echobot-1.triggers[1].actions[0].actions[0].actions[0]' },
  ],
  referredLuIntents: [{ name: 'test', path: 'echobot-1.triggers[3]#Microsoft.OnIntent' }],
  luFile: 'echobot-1',
  qnaFile: 'echobot-1',
  lgFile: 'echobot-1',
  triggers: [
    { id: 'triggers[0]', displayName: '', type: 'Microsoft.OnUnknownIntent', isIntent: false },
    { id: 'triggers[1]', displayName: '', type: 'Microsoft.OnConversationUpdateActivity', isIntent: false },
    { id: 'triggers[2]', displayName: '', type: 'Microsoft.OnError', isIntent: false },
    { id: 'triggers[3]', displayName: 'more errors', type: 'Microsoft.OnIntent', isIntent: true },
  ],
  intentTriggers: [
    { intent: 'test', dialogs: [] },
    { intent: 'test', dialogs: [] },
  ],
  skills: [],
};
