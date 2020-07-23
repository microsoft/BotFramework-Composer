// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MenuUISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

const SubmenuNames = {
  AskQuestion: 'Ask a question',
  CreateCondition: 'Create a condition',
  Looping: 'Looping',
  DialogManagement: 'Dialog management',
  PropertyManagement: 'Manage properties',
  AccessExternalResources: 'Access external resources',
  Debugging: 'Debugging options',
};

export const DefaultMenuSchema: MenuUISchema = {
  // Send a response
  [SDKKinds.SendActivity]: {
    label: 'Send a response',
    submenu: false,
  },
  // Ask a question
  [SDKKinds.TextInput]: {
    label: 'Text',
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.NumberInput]: {
    label: 'Number',
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.ConfirmInput]: {
    label: 'Confirmation',
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.ChoiceInput]: {
    label: 'Multi-choice',
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.AttachmentInput]: {
    label: 'File or attachment',
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.DateTimeInput]: {
    label: 'Date or time',
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.OAuthInput]: {
    label: 'OAuth login',
    submenu: [SubmenuNames.AskQuestion],
  },
  // Create a condition
  [SDKKinds.IfCondition]: {
    label: 'Branch: If/else',
    submenu: [SubmenuNames.CreateCondition],
  },
  [SDKKinds.SwitchCondition]: {
    label: 'Branch: Switch (multiple options)',
    submenu: [SubmenuNames.CreateCondition],
  },
  // Looping
  [SDKKinds.Foreach]: {
    label: 'Loop: For each item',
    submenu: [SubmenuNames.Looping],
  },
  [SDKKinds.ForeachPage]: {
    label: 'Loop: For each page (multiple items)',
    submenu: [SubmenuNames.Looping],
  },
  [SDKKinds.ContinueLoop]: {
    label: 'Continue loop',
    submenu: [SubmenuNames.Looping],
  },
  [SDKKinds.BreakLoop]: {
    label: 'Break out of loop',
    submenu: [SubmenuNames.Looping],
  },
  // Dialog management
  [SDKKinds.BeginDialog]: {
    label: 'Begin a new dialog',
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.EndDialog]: {
    label: 'End this dialog',
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.CancelAllDialogs]: {
    label: 'Cancel all active dialogs',
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.EndTurn]: {
    label: 'End turn',
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.RepeatDialog]: {
    label: 'Repeat this dialog',
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.ReplaceDialog]: {
    label: 'Replace this dialog',
    submenu: [SubmenuNames.DialogManagement],
  },
  // Manage properties
  [SDKKinds.SetProperty]: {
    label: 'Set a property',
    submenu: [SubmenuNames.PropertyManagement],
  },
  [SDKKinds.SetProperties]: {
    label: 'Set properties',
    submenu: [SubmenuNames.PropertyManagement],
  },
  [SDKKinds.DeleteProperty]: {
    label: 'Delete a property',
    submenu: [SubmenuNames.PropertyManagement],
  },
  [SDKKinds.DeleteProperties]: {
    label: 'Delete properties',
    submenu: [SubmenuNames.PropertyManagement],
  },
  [SDKKinds.EditArray]: {
    label: 'Edit an array property',
    submenu: [SubmenuNames.PropertyManagement],
  },
  // Access external resources
  [SDKKinds.BeginSkill]: {
    label: 'Connect to a skill',
    submenu: [SubmenuNames.AccessExternalResources],
  },
  [SDKKinds.HttpRequest]: {
    label: 'Send an HTTP request',
    submenu: [SubmenuNames.AccessExternalResources],
  },
  [SDKKinds.EmitEvent]: {
    label: 'Emit a custom event',
    submenu: [SubmenuNames.AccessExternalResources],
  },
  [SDKKinds.OAuthInput]: {
    label: 'OAuth login',
    submenu: [SubmenuNames.AccessExternalResources],
  },
  [SDKKinds.QnAMakerDialog]: {
    label: 'Connect to QnA Knowledgebase',
    submenu: [SubmenuNames.AccessExternalResources],
  },
  [SDKKinds.SignOutUser]: {
    label: 'Sign out user',
    submenu: [SubmenuNames.AccessExternalResources],
  },
  // Debugging options
  [SDKKinds.LogAction]: {
    label: 'Log to console',
    submenu: [SubmenuNames.Debugging],
  },
  [SDKKinds.TraceActivity]: {
    label: 'Emit a trace event',
    submenu: [SubmenuNames.Debugging],
  },
};
