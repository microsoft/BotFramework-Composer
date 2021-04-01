// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from '@botframework-composer/types';

export const AdaptiveDialogSchema: JSONSchema7 = {
  $schema: 'https://schemas.botframework.com/schemas/component/v1.0/component.schema',
  $role: 'implements(Microsoft.IDialog)',
  title: 'Adaptive dialog',
  description: 'Flexible, data driven dialog that can adapt to the conversation.',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^(?!(=)).*',
      title: 'Id',
      description: 'Optional dialog ID.',
    },
    autoEndDialog: {
      $ref: 'schema:#/definitions/booleanExpression',
      title: 'Auto end dialog',
      description:
        'If set to true the dialog will automatically end when there are no further actions.  If set to false, remember to manually end the dialog using EndDialog action.',
      default: true,
    },
    defaultResultProperty: {
      type: 'string',
      title: 'Default result property',
      description: 'Value that will be passed back to the parent dialog.',
      default: 'dialog.result',
    },
    dialogs: {
      type: 'array',
      title: 'Dialogs added to DialogSet',
      items: {
        $kind: 'Microsoft.IDialog',
        title: 'Dialog',
        description: 'Dialogs will be added to DialogSet.',
      },
    },
    recognizer: {
      $kind: 'Microsoft.IRecognizer',
      title: 'Recognizer',
      description: 'Input recognizer that interprets user input into intent and entities.',
    },
    generator: {
      $kind: 'Microsoft.ILanguageGenerator',
      title: 'Language generator',
      description: 'Language generator that generates bot responses.',
    },
    selector: {
      $kind: 'Microsoft.ITriggerSelector',
      title: 'Selector',
      description: "Policy to determine which trigger is executed. Defaults to a 'best match' selector (optional).",
    },
    triggers: {
      type: 'array',
      description: 'List of triggers defined for this dialog.',
      title: 'Triggers',
      items: {
        $kind: 'Microsoft.ITrigger',
        title: 'Event triggers',
        description: 'Event triggers for handling events.',
      },
    },
    schema: {
      title: 'Schema',
      description: 'Schema to fill in.',
      anyOf: [
        {
          $ref: 'http://json-schema.org/draft-07/schema#',
        },
        {
          type: 'string',
          title: 'Reference to JSON schema',
          description: 'Reference to JSON schema .dialog file.',
        },
      ],
    },
  },
};

export const IfConditionSchema: JSONSchema7 = {
  $schema: 'https://schemas.botframework.com/schemas/component/v1.0/component.schema',
  $role: 'implements(Microsoft.IDialog)',
  title: 'If condition',
  description: 'Two-way branch the conversation flow based on a condition.',
  type: 'object',
  required: ['condition'],
  properties: {
    id: {
      type: 'string',
      title: 'Id',
      description: 'Optional id for the dialog',
    },
    condition: {
      $ref: 'schema:#/definitions/condition',
      title: 'Condition',
      description: 'Expression to evaluate.',
      examples: ['user.age > 3'],
    },
    disabled: {
      $ref: 'schema:#/definitions/booleanExpression',
      title: 'Disabled',
      description: 'Optional condition which if true will disable this action.',
      examples: [true, '=user.age > 3'],
    },
    actions: {
      type: 'array',
      items: {
        $kind: 'Microsoft.IDialog',
      },
      title: 'Actions',
      description: 'Actions to execute if condition is true.',
    },
    elseActions: {
      type: 'array',
      items: {
        $kind: 'Microsoft.IDialog',
      },
      title: 'Else',
      description: 'Actions to execute if condition is false.',
    },
  },
};

export const OnConvUpdateSchema: JSONSchema7 = {
  $schema: 'https://schemas.botframework.com/schemas/component/v1.0/component.schema',
  $role: ['implements(Microsoft.ITrigger)', 'extends(Microsoft.OnCondition)'],
  title: 'On ConversationUpdate activity',
  description: "Actions to perform on receipt of an activity with type 'ConversationUpdate'.",
  type: 'object',
  required: [],
};
export const OnDialogEventSchema: JSONSchema7 = {
  $schema: 'https://schemas.botframework.com/schemas/component/v1.0/component.schema',
  $role: ['implements(Microsoft.ITrigger)', 'extends(Microsoft.OnCondition)'],
  title: 'On dialog event',
  description: 'Actions to perform when a specific dialog event occurs.',
  type: 'object',
  properties: {
    event: {
      type: 'string',
      title: 'Dialog event name',
      description: 'Name of dialog event.',
    },
  },
  required: ['event'],
};

export const SwitchConditionSchema: JSONSchema7 = {
  $schema: 'https://schemas.botframework.com/schemas/component/v1.0/component.schema',
  $role: 'implements(Microsoft.IDialog)',
  title: 'Switch condition',
  description: 'Execute different actions based on the value of a property.',
  type: 'object',
  required: ['condition'],
  properties: {
    id: {
      type: 'string',
      title: 'Id',
      description: 'Optional id for the dialog',
    },
    condition: {
      $ref: 'schema:#/definitions/stringExpression',
      title: 'Condition',
      description: 'Property to evaluate.',
      examples: ['user.favColor'],
    },
    disabled: {
      $ref: 'schema:#/definitions/booleanExpression',
      title: 'Disabled',
      description: 'Optional condition which if true will disable this action.',
      examples: [true, '=user.age > 3'],
    },
    cases: {
      type: 'array',
      title: 'Cases',
      description: 'Actions for each possible condition.',
      items: {
        type: 'object',
        title: 'Case',
        description: 'Case and actions.',
        properties: {
          value: {
            type: ['number', 'integer', 'boolean', 'string'],
            title: 'Value',
            description: 'The value to compare the condition with.',
            examples: ['red', 'true', '13'],
          },
          actions: {
            type: 'array',
            items: {
              $kind: 'Microsoft.IDialog',
            },
            title: 'Actions',
            description: 'Actions to execute.',
          },
        },
        required: ['value'],
      },
    },
    default: {
      type: 'array',
      items: {
        $kind: 'Microsoft.IDialog',
      },
      title: 'Default',
      description: 'Actions to execute if none of the cases meet the condition.',
    },
  },
};
