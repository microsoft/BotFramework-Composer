// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const getDefaultDialogSchema = (schemaUrl, title: string) => ({
  $schema: schemaUrl,
  $role: 'implements(Microsoft.IDialog)',
  title,
  type: 'object',
  properties: {},
  $result: {
    type: 'object',
    properties: {},
  },
});
