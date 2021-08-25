// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const PVADefs = {
  'Microsoft.VirtualAgents.Question': {
    title: 'Ask a question',
    type: 'object',
    properties: {
      $kind: {
        const: 'Microsoft.VirtualAgents.Question',
      },
      type: {
        title: 'Question Type',
        type: 'string',
        enum: ['text', 'number', 'confirm', 'choice'],
        default: 'choice',
      },
      prompt: {
        $kind: 'Microsoft.IActivityTemplate',
        title: 'Initial prompt',
        description: 'Message to send to collect information.',
        examples: ['What is your birth date?'],
        $ref: '#/definitions/Microsoft.IActivityTemplate',
      },
      property: {
        $ref: '#/definitions/stringExpression',
        title: 'Property',
        description:
          "Property to store collected information. Input will be skipped if property has value (unless 'Always prompt' is true).",
        examples: ['$birthday', 'dialog.${user.name}', '=f(x)'],
      },
      choices: {
        title: 'Array of choices',
        description: 'Choices to choose from.',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
              title: 'Simple choice',
              description: 'One choice for choice input.',
            },
          },
        },
      },
      cases: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            isDefault: {
              type: 'boolean',
            },
            value: {
              type: ['number', 'integer', 'boolean', 'string'],
              title: 'Value',
              description: 'The value to compare the condition with.',
              examples: ['red', 'true', '13'],
            },
            actions: {
              type: 'array',
              title: 'Actions',
              description: 'Actions to execute.',
              items: {
                $kind: 'Microsoft.IDialog',
                $ref: '#/definitions/Microsoft.IDialog',
              },
            },
          },
        },
        default: [
          {
            isDefault: true,
            actions: [],
          },
        ],
      },
    },
  },
};
