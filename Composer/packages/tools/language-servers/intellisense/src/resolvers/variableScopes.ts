// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

export const variableScopesResolver = (): CompletionItem[] => {
  return [
    {
      label: 'user.',
      kind: CompletionItemKind.Enum,
      insertText: 'user.',
      documentation: 'user is associated with a specific user. Properties in the user scope are retained forever.',
    },
    {
      label: 'conversation.',
      kind: CompletionItemKind.Enum,
      insertText: 'conversation.',
      documentation:
        'conversation is associated with the conversation id. Properties in the conversation scope are retained forever and may be accessed by multiple users within the same conversation (for example, multiple users together in a Microsoft Teams channel).',
    },
    {
      label: 'dialog.',
      kind: CompletionItemKind.Enum,
      insertText: 'dialog.',
      documentation:
        'dialog is associated with the active dialog and any child or parent dialogs. Properties in the dialog scope are retained until the last active dialog ends.',
    },
    {
      label: 'turn.',
      kind: CompletionItemKind.Enum,
      insertText: 'turn.',
      documentation:
        'turn is associated with a single turn. You can also think of this as the bot handling a single message from the user. Properties in the turn scope are discarded at the end of the turn.',
    },
    {
      label: 'this.',
      kind: CompletionItemKind.Enum,
      insertText: 'this.',
      documentation:
        "this is associated with the active action's properties. It is helpful for input actions that last beyond a single turn of the conversation. Two properties already on the scope are this.value and this.turnCount.",
    },
    {
      label: 'settings.',
      kind: CompletionItemKind.Enum,
      insertText: 'settings.',
      documentation:
        'settings is associated with any information that is made available to the bot via the platform specific settings configuration system, for example if you are developing your bot using C#, these settings will appear in the appsettings.json file.',
    },
  ];
};
