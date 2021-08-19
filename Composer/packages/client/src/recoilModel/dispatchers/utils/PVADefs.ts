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
        default: 'text',
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
        $role: 'expression',
        title: 'Array of choices',
        description: 'Choices to choose from.',
        type: 'array',
        items: [
          {
            type: 'string',
            title: 'Simple choice',
            description: 'One choice for choice input.',
          },
        ],
      },
      cases: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            condition: {
              $ref: '#/definitions/condition',
              title: 'Condition',
              description: 'Expression to evaluate.',
              examples: ['user.age > 3'],
            },
          },
          actions: {
            type: 'array',
            title: 'Actions',
            description: 'Actions to execute if condition is true.',
            items: {
              $kind: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
        },
      },
    },
  },
};
