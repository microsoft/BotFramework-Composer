// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { MenuUISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

const SubmenuNames = {
  AskQuestion: formatMessage('Ask a question'),
  CreateCondition: formatMessage('Create a condition'),
  Looping: formatMessage('Looping'),
  DialogManagement: formatMessage('Dialog management'),
  PropertyManagement: formatMessage('Manage properties'),
  AccessExternalResources: formatMessage('Access external resources'),
  Debugging: formatMessage('Debugging options'),
};

export const DefaultMenuSchema: MenuUISchema = {
  // Send a response
  [SDKKinds.SendActivity]: {
    label: formatMessage('Send a response'),
    submenu: false,
  },
  // Ask a question
  [SDKKinds.TextInput]: {
    label: formatMessage('Text'),
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.NumberInput]: {
    label: formatMessage('Number'),
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.ConfirmInput]: {
    label: formatMessage('Confirmation'),
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.ChoiceInput]: {
    label: formatMessage('Multi-choice'),
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.AttachmentInput]: {
    label: formatMessage('File or attachment'),
    submenu: [SubmenuNames.AskQuestion],
  },
  [SDKKinds.DateTimeInput]: {
    label: formatMessage('Date or time'),
    submenu: [SubmenuNames.AskQuestion],
  },
  // OAuthInput appears twice
  [SDKKinds.OAuthInput]: [
    {
      label: formatMessage('OAuth login'),
      submenu: [SubmenuNames.AskQuestion],
    },
    {
      label: formatMessage('OAuth login'),
      submenu: [SubmenuNames.AccessExternalResources],
    },
  ],
  // Create a condition
  [SDKKinds.IfCondition]: {
    label: formatMessage('Branch: If/else'),
    submenu: [SubmenuNames.CreateCondition],
  },
  [SDKKinds.SwitchCondition]: {
    label: formatMessage('Branch: Switch (multiple options)'),
    submenu: [SubmenuNames.CreateCondition],
  },
  // Looping
  [SDKKinds.Foreach]: {
    label: formatMessage('Loop: For each item'),
    submenu: [SubmenuNames.Looping],
  },
  [SDKKinds.ForeachPage]: {
    label: formatMessage('Loop: For each page (multiple items)'),
    submenu: [SubmenuNames.Looping],
  },
  [SDKKinds.ContinueLoop]: {
    label: formatMessage('Continue loop'),
    submenu: [SubmenuNames.Looping],
  },
  [SDKKinds.BreakLoop]: {
    label: formatMessage('Break out of loop'),
    submenu: [SubmenuNames.Looping],
  },
  // Dialog management
  [SDKKinds.BeginDialog]: {
    label: formatMessage('Begin a new dialog'),
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.EndDialog]: {
    label: formatMessage('End this dialog'),
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.CancelAllDialogs]: {
    label: formatMessage('Cancel all active dialogs'),
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.EndTurn]: {
    label: formatMessage('End turn'),
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.RepeatDialog]: {
    label: formatMessage('Repeat this dialog'),
    submenu: [SubmenuNames.DialogManagement],
  },
  [SDKKinds.ReplaceDialog]: {
    label: formatMessage('Replace this dialog'),
    submenu: [SubmenuNames.DialogManagement],
  },
  // Manage properties
  [SDKKinds.SetProperty]: {
    label: formatMessage('Set a property'),
    submenu: [SubmenuNames.PropertyManagement],
  },
  [SDKKinds.SetProperties]: {
    label: formatMessage('Set properties'),
    submenu: [SubmenuNames.PropertyManagement],
  },
  [SDKKinds.DeleteProperty]: {
    label: formatMessage('Delete a property'),
    submenu: [SubmenuNames.PropertyManagement],
  },
  [SDKKinds.DeleteProperties]: {
    label: formatMessage('Delete properties'),
    submenu: [SubmenuNames.PropertyManagement],
  },
  [SDKKinds.EditArray]: {
    label: formatMessage('Edit an array property'),
    submenu: [SubmenuNames.PropertyManagement],
  },
  // Access external resources
  [SDKKinds.BeginSkill]: {
    label: formatMessage('Connect to a skill'),
    submenu: [SubmenuNames.AccessExternalResources],
  },
  [SDKKinds.HttpRequest]: {
    label: formatMessage('Send an HTTP request'),
    submenu: [SubmenuNames.AccessExternalResources],
  },
  [SDKKinds.EmitEvent]: {
    label: formatMessage('Emit a custom event'),
    submenu: [SubmenuNames.AccessExternalResources],
  },
  [SDKKinds.QnAMakerDialog]: {
    label: formatMessage('Connect to QnA Knowledgebase'),
    submenu: [SubmenuNames.AccessExternalResources],
  },
  [SDKKinds.SignOutUser]: {
    label: formatMessage('Sign out user'),
    submenu: [SubmenuNames.AccessExternalResources],
  },
  // Debugging options
  [SDKKinds.LogAction]: {
    label: formatMessage('Log to console'),
    submenu: [SubmenuNames.Debugging],
  },
  [SDKKinds.TraceActivity]: {
    label: formatMessage('Emit a trace event'),
    submenu: [SubmenuNames.Debugging],
  },
};
