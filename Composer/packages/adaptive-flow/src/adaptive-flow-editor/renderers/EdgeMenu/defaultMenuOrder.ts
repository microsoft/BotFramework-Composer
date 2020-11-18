// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const defaultMenuOrder = [
  // root level
  'Send a response',
  'Ask a question',
  'Create a condition',
  'Looping',
  'Dialog management',
  'Manage properties',
  'Access external resources',
  'Debugging options',
  // submenu - Ask a question
  'Text',
  'Number',
  'Confirmation',
  'Multi-choice',
  'File or attachment',
  'Date or time',
  // submenu - Create a condition
  'Branch: If/else',
  'Branch: Switch (multiple options)',
  'Loop: For each item',
  'Loop: For each page (multiple items)',
  'Continue loop',
  'Break out of loop',
  // submenu - Dialog management,
  'Begin a new dialog',
  'End this dialog',
  'Cancel all active dialogs',
  'End turn',
  'Repeat this dialog',
  'Replace this dialog',
  // submenu - Manage properties
  'Set a property',
  'Set properties',
  'Delete a property',
  'Delete properties',
  'Edit an array property',
  // submenu - Access external resources
  'Connect to a skill',
  'Send an HTTP request',
  'Emit a custom event',
  'OAuth login',
  'Connect to QnA Knowledgebase',
  'Sign out user',
  // submenu - debugging options
  'Log to console',
  'Emit a trace event',
];

export const menuOrderMap: { [label: string]: number } = defaultMenuOrder.reduce((result, label, index) => {
  result[label] = index;
  return result;
}, {});
