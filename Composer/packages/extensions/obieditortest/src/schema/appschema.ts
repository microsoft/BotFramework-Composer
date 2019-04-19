import { JSONSchema6 } from 'json-schema';

import { DialogInfo } from '../types';

export const dialogGroups = {
  'Input/Prompt Dialogs': [
    'Microsoft.ConfirmInput',
    'Microsoft.FloatInput',
    'Microsoft.IntegerInput',
    'Microsoft.TextInput',
  ],
  'Dialog Steps': [
    'Microsoft.BeginDialog',
    'Microsoft.CancelDialog',
    'Microsoft.EndDialog',
    'Microsoft.EndTurn',
    'Microsoft.HttpRequest',
    'Microsoft.IfCondition',
    'Microsoft.ReplaceWithDialog',
    'Microsoft.SendActivity',
    'Microsoft.SendList',
    'Microsoft.SwitchCondition',
  ],
  Memory: ['Microsoft.DeleteProperty', 'Microsoft.EditArray', 'Microsoft.SaveEntity'],
  Rules: [
    'Microsoft.EventRule',
    'Microsoft.IfPropertyRule',
    'Microsoft.IntentRule',
    'Microsoft.NoMatchRule',
    'Microsoft.Rule',
    'Microsoft.WelcomeRule',
  ],
  Recognizers: [/* 'Microsoft.LuisRecognizer' */ 'Microsoft.MultiLanguageRecognizers', 'Microsoft.RegexRecognizer'],
  Other: ['Microsoft.AdaptiveDialog'],
};

export function getMergedSchema(dialogFiles: DialogInfo[] = []): JSONSchema6 {
  const dialogNames = dialogFiles.map(f => f.name.substring(0, f.name.lastIndexOf('.')));
  const dialogEnum = {
    enum: dialogNames,
    enumLabels: dialogNames,
  };

  return {
    $schema:
      'https://raw.githubusercontent.com/Microsoft/botbuilder-tools/SchemaGen/packages/DialogSchema/src/dialogSchema.schema',
    $id: 'app.schema',
    type: 'object',
    title: 'Component types',
    description: 'These are all of the types that can be created by the loader.',
    oneOf: [
      {
        title: 'Microsoft.AdaptiveDialog',
        description: 'Configures a data driven dialog via a collection of steps/dialogs.',
        $ref: '#/definitions/Microsoft.AdaptiveDialog',
      },
      {
        title: 'Microsoft.BeginDialog',
        description: 'Step which begins another dialog (and when that dialog is done, it will return the caller).',
        $ref: '#/definitions/Microsoft.BeginDialog',
      },
      {
        title: 'Microsoft.CancelDialog',
        description: 'Command to cancel the current dialog, trigging a cancelation event',
        $ref: '#/definitions/Microsoft.CancelDialog',
      },
      {
        title: 'Microsoft.ConfirmInput',
        description: 'This represents a dialog which gathers a yes/no style responses',
        $ref: '#/definitions/Microsoft.ConfirmInput',
      },
      {
        title: 'Microsoft.DeleteProperty',
        description: 'This is a step which allows you to remove a property from memory',
        $ref: '#/definitions/Microsoft.DeleteProperty',
      },
      {
        title: 'Microsoft.EditArray',
        description: 'This is a step which allows you to modify an array in memory',
        $ref: '#/definitions/Microsoft.EditArray',
      },
      {
        title: 'Microsoft.EndDialog',
        description: 'Command which ends the current dialog, returning the resultProperty as the result of the dialog.',
        $ref: '#/definitions/Microsoft.EndDialog',
      },
      {
        title: 'Microsoft.EndTurn',
        description: 'End the current turn without ending the dialog.',
        $ref: '#/definitions/Microsoft.EndTurn',
      },
      {
        title: 'Microsoft.EventRule',
        description: 'Defines a rule for an event which is triggered by some sourcy',
        $ref: '#/definitions/Microsoft.EventRule',
      },
      {
        title: 'Microsoft.FloatInput',
        description: 'This represents a dialog which gathers a number in a specified range',
        $ref: '#/definitions/Microsoft.FloatInput',
      },
      {
        title: 'Microsoft.HttpRequest',
        description: 'This is a step which replaces the current dialog with the target dialog',
        $ref: '#/definitions/Microsoft.HttpRequest',
      },
      {
        title: 'Microsoft.IfCondition',
        description: 'Step which conditionally decides which step to execute next.',
        $ref: '#/definitions/Microsoft.IfCondition',
      },
      {
        title: 'Microsoft.IfPropertyRule',
        description: '',
        $ref: '#/definitions/Microsoft.IfPropertyRule',
      },
      {
        title: 'Microsoft.IntegerInput',
        description: 'This represents a dialog which gathers a number in a specified range',
        $ref: '#/definitions/Microsoft.IntegerInput',
      },
      {
        title: 'Microsoft.IntentRule',
        description: 'This defines the steps to take when an Intent is recognized (and optionally entities)',
        $ref: '#/definitions/Microsoft.IntentRule',
      },
      {
        title: 'Microsoft.MultiLanguageRecognizers',
        description:
          'Recognizer which allows you to configure the recognizer per language, and to define the policy for using them',
        $ref: '#/definitions/Microsoft.MultiLanguageRecognizers',
      },
      {
        title: 'Microsoft.NoMatchRule',
        description: 'Defines a sequence of steps to take if there is no other trigger or plan operating',
        $ref: '#/definitions/Microsoft.NoMatchRule',
      },
      {
        title: 'Microsoft.RegexRecognizer',
        description: 'Recognizer which uses regex expressions to generate intents and entities.',
        $ref: '#/definitions/Microsoft.RegexRecognizer',
      },
      {
        title: 'Microsoft.ReplaceWithDialog',
        description: 'This is a step which replaces the current dialog with the target dialog',
        $ref: '#/definitions/Microsoft.ReplaceWithDialog',
      },
      {
        title: 'Microsoft.Rule',
        description: 'Defines a rule for an event which is triggered by some sourcy',
        $ref: '#/definitions/Microsoft.Rule',
      },
      {
        title: 'Microsoft.SaveEntity',
        description: 'This is a step which allows you to save a memory property as an entity',
        $ref: '#/definitions/Microsoft.SaveEntity',
      },
      {
        title: 'Microsoft.SendActivity',
        description: 'This is a step which sends an activity to the user',
        $ref: '#/definitions/Microsoft.SendActivity',
      },
      {
        title: 'Microsoft.SendList',
        description: 'TEMPORARY, THIS SHOULD BE REPLACED WITH LG TEMPLATE',
        $ref: '#/definitions/Microsoft.SendList',
      },
      {
        title: 'Microsoft.SwitchCondition',
        description: 'Step which conditionally decides which step to execute next.',
        $ref: '#/definitions/Microsoft.SwitchCondition',
      },
      {
        title: 'Microsoft.TextInput',
        description: 'This represents a dialog which gathers a text from the user',
        $ref: '#/definitions/Microsoft.TextInput',
      },
      {
        title: 'Microsoft.WelcomeRule',
        description: 'Defines a sequence of steps to take if the user is a new user',
        $ref: '#/definitions/Microsoft.WelcomeRule',
      },
    ],
    definitions: {
      'Microsoft.AdaptiveDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Adaptive Dialog',
        description: 'Configures a data driven dialog via a collection of steps/dialogs.',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.AdaptiveDialog',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          property: {
            type: 'string',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['value.birthday'],
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          inputProperties: {
            type: 'object',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['value.birthday'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            type: 'string',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['value.birthday'],
          },
          recognizer: {
            $type: 'Microsoft.IRecognizer',
            $ref: '#/definitions/Microsoft.IRecognizer',
          },
          steps: {
            type: 'array',
            description: 'Initial Sequence of steps or dialogs to execute when dialog is started',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
          rules: {
            type: 'array',
            description: 'Array of rules to use to evaluate conversation',
            items: {
              $type: 'Microsoft.IRule',
              $ref: '#/definitions/Microsoft.IRule',
            },
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.BeginDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Begin Dialog',
        description: 'Step which begins another dialog (and when that dialog is done, it will return the caller).',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.BeginDialog',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          dialog: {
            $type: 'Microsoft.IDialog',
            title: 'Dialog',
            description: 'This is the dialog to call.',
            type: 'string',
            ...dialogEnum,
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          options: {
            type: 'object',
            title: 'Options',
            description: 'Options to pass to the dialog.',
            additionalProperties: true,
          },
          property: {
            type: 'string',
            title: 'Property',
            description: 'The property to bind to the dialog and store the result in',
            examples: ['user.name'],
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.CancelDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Cancel Dialog',
        description: 'Command to cancel the current dialog, trigging a cancelation event',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.CancelDialog',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.ConfirmInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'ConfirmInput Dialog',
        description: 'This represents a dialog which gathers a yes/no style responses',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.ConfirmInput',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          property: {
            type: 'string',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['user.confirmed'],
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          inputProperties: {
            title: 'Input Properties',
            type: 'object',
            description: 'This defines properties which will be passed as arguments to this dialog',
            examples: ['user.confirmed'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            type: 'string',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['user.confirmed'],
          },
          prompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Initial Prompt',
            description: 'The message to send to as prompt for this input.',
            examples: ['Are you sure?'],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          retryPrompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Retry Prompt',
            description: 'The message to send to prompt again.',
            examples: ["Let's try again."],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          invalidPrompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Invalid Prompt',
            description: 'The message to send to when then input was not recognized or not valid for the input type.',
            examples: ["I didn't recognize a yes/no response"],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.DeleteProperty': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Delete Property',
        description: 'This is a step which allows you to remove a property from memory',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.DeleteProperty',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          property: {
            type: 'string',
            title: 'Property',
            description: 'The Memory property path to delete',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['property', '$type'],
        //   },
        // ],
      },
      'Microsoft.EditArray': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Edit Array Step',
        description: 'This is a step which allows you to modify an array in memory',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.EditArray',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          changeType: {
            type: 'string',
            title: 'Change Type',
            description: 'The array operation to perform',
            enum: ['Push', 'Pop', 'Take', 'Remove', 'Clear'],
          },
          arrayProperty: {
            type: 'string',
            title: 'Array Property',
            description: 'Memory expression of the array to manipulate.',
          },
          itemProperty: {
            type: 'string',
            title: 'List Property',
            description: 'Memory expression for the item',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['changeType', 'listProperty', '$type'],
        //   },
        // ],
      },
      'Microsoft.EndDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'End Dialog',
        description: 'Command which ends the current dialog, returning the resultProperty as the result of the dialog.',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.EndDialog',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          property: {
            title: 'Property',
            description: 'Specifies a path to memory should be returned as the result to the calling dialog.',
            examples: ['dialog.name'],
            type: 'string',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.EndTurn': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'End Turn',
        description: 'End the current turn without ending the dialog.',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.EndTurn',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.EventRule': {
        title: 'Event Rule',
        description: 'Defines a rule for an event which is triggered by some sourcy',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.EventRule',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          events: {
            type: 'array',
            description: 'Events to trigger this rule for',
            items: {
              type: 'string',
            },
          },
          expression: {
            type: 'string',
            title: 'Constraint',
            description: 'Optional constraint to which must be met for this rule to fire',
            examples: ['user.vip == true'],
          },
          steps: {
            type: 'array',
            description: 'Sequence of steps or dialogs to execute',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
        },
        $role: 'unionType(Microsoft.IRule)',
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['events', 'steps', '$type'],
        //   },
        // ],
      },
      'Microsoft.FloatInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Float  prompt',
        description: 'This represents a dialog which gathers a number in a specified range',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.FloatInput',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          property: {
            type: 'string',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['user.height'],
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          inputProperties: {
            type: 'object',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['user.height'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            type: 'string',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['user.height'],
          },
          prompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Initial Prompt',
            description: 'The message to send to as prompt for this input.',
            examples: ['What is your height?'],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          retryPrompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Retry Prompt',
            description: 'The message to send to prompt again.',
            examples: ["Let's try again. What is your height?"],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          invalidPrompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Invalid Prompt',
            description: 'The message to send to when then input was not recognized or not valid for the input type.',
            examples: ["I didn't recognize a number"],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          minValue: {
            type: 'number',
            title: 'Mininum value',
            description: 'The minimum value that is acceptable.  ',
            examples: ['0'],
          },
          maxValue: {
            type: 'number',
            title: 'Maximum value',
            description: 'The maximum value that is acceptable.  ',
            examples: ['120'],
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.HttpRequest': {
        $role: 'unionType(Microsoft.IDialog)',
        type: 'object',
        title: 'HTTP Request',
        description: 'This is a step which makes an http request and stores the result in memory.',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.HttpRequest',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          method: {
            type: 'string',
            title: 'Method',
            description: 'The HTTP method to use',
            enum: ['GET', 'POST'],
            examples: ['GET', 'POST'],
          },
          url: {
            type: 'string',
            title: 'Url',
            description: 'The url to call (supports data binding)',
            examples: ['https://contoso.com'],
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          body: {
            type: 'object',
            title: 'Body',
            description: 'The body to send in the HTTP call  (supports data binding)',
            additionalProperties: true,
          },
          property: {
            type: 'string',
            title: 'Property',
            description: 'The property to store the result of the HTTP call in (as object or string)',
            examples: ['dialog.contosodata'],
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          header: {
            type: 'object',
            additionalProperties: true,
            title: 'Http headers',
            description: 'Http headers to include with the HTTP request (supports data binding)',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['url', 'entity', '$type'],
        //   },
        // ],
      },
      'Microsoft.IActivityTemplate': {
        title: 'Microsoft ActivityTemplate',
        description: 'Union of components which implement the IActivityTemplate interface',
        $role: 'unionType',
        type: 'string',
        // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/137
        // oneOf: [
        //   {
        //     type: 'string',
        //     title: 'string',
        //   },
        // ],
      },
      'Microsoft.IDialog': {
        title: 'Microsoft IDialog',
        description: 'Union of components which implement the IDialog interface',
        $role: 'unionType',
        type: 'object',
        // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/137
        oneOf: [
          {
            title: 'Microsoft.AdaptiveDialog',
            description: 'Configures a data driven dialog via a collection of steps/dialogs.',
            $ref: '#/definitions/Microsoft.AdaptiveDialog',
          },
          {
            title: 'Microsoft.BeginDialog',
            description: 'Step which begins another dialog (and when that dialog is done, it will return the caller).',
            $ref: '#/definitions/Microsoft.BeginDialog',
          },
          {
            title: 'Microsoft.CancelDialog',
            description: 'Command to cancel the current dialog, trigging a cancelation event',
            $ref: '#/definitions/Microsoft.CancelDialog',
          },
          {
            title: 'Microsoft.ConfirmInput',
            description: 'This represents a dialog which gathers a yes/no style responses',
            $ref: '#/definitions/Microsoft.ConfirmInput',
          },
          {
            title: 'Microsoft.DeleteProperty',
            description: 'This is a step which allows you to remove a property from memory',
            $ref: '#/definitions/Microsoft.DeleteProperty',
          },
          {
            title: 'Microsoft.EditArray',
            description: 'This is a step which allows you to modify an array in memory',
            $ref: '#/definitions/Microsoft.EditArray',
          },
          {
            title: 'Microsoft.EndDialog',
            description:
              'Command which ends the current dialog, returning the resultProperty as the result of the dialog.',
            $ref: '#/definitions/Microsoft.EndDialog',
          },
          {
            title: 'Microsoft.EndTurn',
            description: 'End the current turn without ending the dialog.',
            $ref: '#/definitions/Microsoft.EndTurn',
          },
          {
            title: 'Microsoft.FloatInput',
            description: 'This represents a dialog which gathers a number in a specified range',
            $ref: '#/definitions/Microsoft.FloatInput',
          },
          {
            title: 'Microsoft.HttpRequest',
            description: 'This is a step which replaces the current dialog with the target dialog',
            $ref: '#/definitions/Microsoft.HttpRequest',
          },
          {
            title: 'Microsoft.IfCondition',
            description: 'Step which conditionally decides which step to execute next.',
            $ref: '#/definitions/Microsoft.IfCondition',
          },
          {
            title: 'Microsoft.IntegerInput',
            description: 'This represents a dialog which gathers a number in a specified range',
            $ref: '#/definitions/Microsoft.IntegerInput',
          },
          {
            title: 'Microsoft.ReplaceWithDialog',
            description: 'This is a step which replaces the current dialog with the target dialog',
            $ref: '#/definitions/Microsoft.ReplaceWithDialog',
          },
          {
            title: 'Microsoft.SaveEntity',
            description: 'This is a step which allows you to save a memory property as an entity',
            $ref: '#/definitions/Microsoft.SaveEntity',
          },
          {
            title: 'Microsoft.SendActivity',
            description: 'This is a step which sends an activity to the user',
            $ref: '#/definitions/Microsoft.SendActivity',
          },
          {
            title: 'Microsoft.SendList',
            description: 'TEMPORARY, THIS SHOULD BE REPLACED WITH LG TEMPLATE',
            $ref: '#/definitions/Microsoft.SendList',
          },
          {
            title: 'Microsoft.SwitchCondition',
            description: 'Step which conditionally decides which step to execute next.',
            $ref: '#/definitions/Microsoft.SwitchCondition',
          },
          {
            title: 'Microsoft.TextInput',
            description: 'This represents a dialog which gathers a text from the user',
            $ref: '#/definitions/Microsoft.TextInput',
          },
          {
            type: 'string',
            title: 'string',
          },
        ],
      },
      'Microsoft.IExpression': {
        title: 'Microsoft IExpression',
        description: 'Union of components which implement the IExpression interface',
        $role: 'unionType',
        type: 'string',
        // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/137
        // oneOf: [
        //   {
        //     type: 'string',
        //     title: 'string',
        //   },
        // ],
      },
      'Microsoft.ILanguagePolicy': {
        title: 'Microsoft Language Policy',
        description: 'Union of components which implement the ILanguagePolicy interface',
        $role: 'unionType',
        type: 'string',
        // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/137
        // oneOf: [
        //   {
        //     type: 'string',
        //     title: 'string',
        //   },
        // ],
      },
      'Microsoft.IRecognizer': {
        title: 'Microsoft IRecognizer',
        description: 'Union of components which implement the IRecognizer interface',
        $role: 'unionType',
        type: 'object',
        // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/137
        oneOf: [
          {
            title: 'Microsoft.MultiLanguageRecognizers',
            description:
              'Recognizer which allows you to configure the recognizer per language, and to define the policy for using them',
            $ref: '#/definitions/Microsoft.MultiLanguageRecognizers',
          },
          {
            title: 'Microsoft.RegexRecognizer',
            description: 'Recognizer which uses regex expressions to generate intents and entities.',
            $ref: '#/definitions/Microsoft.RegexRecognizer',
          },
        ],
      },
      'Microsoft.IRule': {
        title: 'Microsoft IRule',
        description: 'Union of components which implement the IRule interface',
        $role: 'unionType',
        type: 'object',
        // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/137
        oneOf: [
          {
            title: 'Microsoft.EventRule',
            description: 'Defines a rule for an event which is triggered by some sourcy',
            $ref: '#/definitions/Microsoft.EventRule',
          },
          {
            title: 'Microsoft.IfPropertyRule',
            description: '',
            $ref: '#/definitions/Microsoft.IfPropertyRule',
          },
          {
            title: 'Microsoft.IntentRule',
            description: 'This defines the steps to take when an Intent is recognized (and optionally entities)',
            $ref: '#/definitions/Microsoft.IntentRule',
          },
          {
            title: 'Microsoft.NoMatchRule',
            description: 'Defines a sequence of steps to take if there is no other trigger or plan operating',
            $ref: '#/definitions/Microsoft.NoMatchRule',
          },
          {
            title: 'Microsoft.Rule',
            description: 'Defines a rule for an event which is triggered by some sourcy',
            $ref: '#/definitions/Microsoft.Rule',
          },
          {
            title: 'Microsoft.WelcomeRule',
            description: 'Defines a sequence of steps to take if the user is a new user',
            $ref: '#/definitions/Microsoft.WelcomeRule',
          },
        ],
      },
      'Microsoft.ITextTemplate': {
        title: 'Microsoft TextTemplate',
        description: 'Union of components which implement the ITextTemplate interface',
        $role: 'unionType',
        // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/137
        type: 'string',
        // oneOf: [
        //   {
        //     type: 'string',
        //     title: 'string',
        //   },
        // ],
      },
      'Microsoft.IfCondition': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'If Condition Step',
        description: 'Step which conditionally decides which step to execute next.',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.IfCondition',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          condition: {
            $type: 'Microsoft.IExpression',
            title: 'Condition',
            description: 'Expression to evaluate.',
            examples: ['user.age > 3'],
            $ref: '#/definitions/Microsoft.IExpression',
          },
          ifTrue: {
            type: 'array',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
              type: 'object',
            },
            title: 'If True',
            description: 'Steps to execute if expression is true.',
          },
          ifFalse: {
            type: 'array',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
              type: 'object',
            },
            title: 'If False',
            description: 'Steps to execute if expression is false.',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['expression', 'ifTrue', '$type'],
        //   },
        // ],
      },
      'Microsoft.IfPropertyRule': {
        $role: 'unionType(Microsoft.IRule)',
        title: '',
        description: '',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.IfPropertyRule',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          conditionals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                expression: {
                  $type: 'Microsoft.IExpression',
                  $ref: '#/definitions/Microsoft.IExpression',
                },
                rules: {
                  type: 'array',
                  items: {
                    $type: 'Microsoft.IRule',
                    $ref: '#/definitions/Microsoft.IRule',
                  },
                },
              },
            },
          },
          else: {
            type: 'array',
            items: {
              $type: 'Microsoft.IRule',
              $ref: '#/definitions/Microsoft.IRule',
            },
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: [
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['conditionals', '$type'],
        //   },
        // ],
      },
      'Microsoft.IntegerInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Integer prompt',
        description: 'This represents a dialog which gathers a number in a specified range',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.IntegerInput',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          property: {
            type: 'string',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['value.birthday'],
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          inputProperties: {
            type: 'object',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['value.birthday'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            type: 'string',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['value.birthday'],
          },
          prompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Initial Prompt',
            description: 'The message to send to as prompt for this input.',
            examples: ['What is your birth date?'],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          retryPrompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Retry Prompt',
            description: 'The message to send to prompt again.',
            examples: ["Let's try again. What is your birth date?"],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          invalidPrompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Invalid Prompt',
            description: 'The message to send to when then input was not recognized or not valid for the input type.',
            examples: ['No date was recognized'],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          minValue: {
            type: 'integer',
            title: 'Mininum value',
            description: 'The minimum value that is acceptable.  ',
            examples: ['0'],
          },
          maxValue: {
            type: 'integer',
            title: 'Maximum value',
            description: 'The maximum value that is acceptable.  ',
            examples: ['120'],
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.IntentRule': {
        $role: 'unionType(Microsoft.IRule)',
        title: 'Intent Rule',
        description: 'This defines the steps to take when an Intent is recognized (and optionally entities)',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.IntentRule',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          intent: {
            type: 'string',
            title: 'Intent',
            description: 'Intent name to trigger on',
          },
          entities: {
            type: 'array',
            title: 'Entities',
            description: 'The entities required to trigger this rule',
            items: {
              type: 'string',
            },
          },
          events: {
            type: 'array',
            description: 'Events to trigger this rule for',
            items: {
              type: 'string',
            },
          },
          expression: {
            type: 'string',
            title: 'Constraint',
            description: 'Optional constraint to which must be met for this rule to fire',
            examples: ['user.vip == true'],
          },
          steps: {
            type: 'array',
            description: 'Sequence of steps or dialogs to execute',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['intent', 'steps', '$type'],
        //   },
        // ],
      },
      'Microsoft.MultiLanguageRecognizers': {
        $role: 'unionType(Microsoft.IRecognizer)',
        title: 'Multi Language Recognizer',
        description:
          'Recognizer which allows you to configure the recognizer per language, and to define the policy for using them',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.MultiLanguageRecognizers',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          languagePolicy: {
            $type: 'Microsoft.ILanguagePolicy',
            // TODO - not sure if this is incorrect. ILangaugePolicy defines its own type
            // type: 'object',
            title: 'Language Policy',
            description: 'Defines languages to try per language.',
            $ref: '#/definitions/Microsoft.ILanguagePolicy',
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          recognizers: {
            type: 'object',
            title: 'Recognizers',
            description: 'Map of language -> IRecognizer',
            additionalProperties: {
              $type: 'Microsoft.IRecognizer',
              $ref: '#/definitions/Microsoft.IRecognizer',
            },
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['recognizers', '$type'],
        //   },
        // ],
      },
      'Microsoft.NoMatchRule': {
        title: 'No Match Rule',
        description: 'Defines a sequence of steps to take if there is no other trigger or plan operating',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.NoMatchRule',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          events: {
            type: 'array',
            description: 'Events to trigger this rule for',
            items: {
              type: 'string',
            },
          },
          expression: {
            type: 'string',
            title: 'Constraint',
            description: 'Optional constraint to which must be met for this rule to fire',
            examples: ['user.vip == true'],
          },
          steps: {
            type: 'array',
            description: 'Sequence of steps or dialogs to execute',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
        },
        $role: 'unionType(Microsoft.IRule)',
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['steps', '$type'],
        //   },
        // ],
      },
      'Microsoft.RegexRecognizer': {
        $role: 'unionType(Microsoft.IRecognizer)',
        title: 'Regex Recognizer',
        description: 'Recognizer which uses regex expressions to generate intents and entities.',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.RegexRecognizer',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          intents: {
            type: 'object',
            title: 'RegEx patterns to intents',
            description: 'Pattern->Intents mappings',
            additionalProperties: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['intents', '$type'],
        //   },
        // ],
      },
      'Microsoft.ReplaceWithDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        type: 'object',
        title: 'Replace Dialog',
        description: 'This is a step which replaces the current dialog with the target dialog',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.ReplaceWithDialog',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          dialog: {
            $type: 'Microsoft.IDialog',
            title: 'Dialog',
            description: 'This is the dialog to switch to.',
            type: 'string',
            ...dialogEnum,
          },
          options: {
            type: 'object',
            title: 'Options',
            description: 'Options to pass to the dialog.',
            additionalProperties: true,
          },
          property: {
            title: 'Property',
            description: 'The property to bind to the dialog and store the result in',
            examples: ['user.name'],
            type: 'string',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.Rule': {
        $role: 'unionType(Microsoft.IRule)',
        title: 'Event Rule',
        description: 'Defines a rule for an event which is triggered by some sourcy',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.Rule',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          expression: {
            type: 'string',
            title: 'Constraint',
            description: 'Optional constraint to which must be met for this rule to fire',
            examples: ['user.vip == true'],
          },
          steps: {
            type: 'array',
            description: 'Sequence of steps or dialogs to execute',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['events', 'steps', '$type'],
        //   },
        // ],
      },
      'Microsoft.SaveEntity': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'SaveEntity Step',
        description: 'This is a step which allows you to save a memory property as an entity',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.SaveEntity',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          entity: {
            type: 'string',
            title: 'Entity',
            description: 'name of the entity to save',
          },
          property: {
            type: 'string',
            title: 'Property',
            description: 'Memory expression of the property to save as an entity.',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['property', 'entity', '$type'],
        //   },
        // ],
      },
      'Microsoft.SendActivity': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Send Activity Step',
        description: 'This is a step which sends an activity to the user',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.SendActivity',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          activity: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Activity',
            description: 'Activity to send to the user',
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.SendList': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'SendList Step',
        description: 'TEMPORARY, THIS SHOULD BE REPLACED WITH LG TEMPLATE',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.SendList',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          listProperty: {
            type: 'string',
            title: 'List Property',
            description: 'Memory expression of the list to manipulate.',
          },
          messageTemplate: {
            type: 'string',
            title: 'List Property',
            description: 'Memory expression for the item',
          },
          itemTemplate: {
            type: 'string',
            title: 'List Property',
            description: 'Memory expression for the item',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['listProperty', 'messageTemplate', 'itemTemplate', '$type'],
        //   },
        // ],
      },
      'Microsoft.SwitchCondition': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Switch Step',
        description: 'Step which conditionally decides which step to execute next.',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.SwitchCondition',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          condition: {
            $type: 'Microsoft.IExpression',
            title: 'Condition',
            description: 'Expression to evaluate.',
            examples: ['user.age > 3'],
            $ref: '#/definitions/Microsoft.IExpression',
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          cases: {
            type: 'object',
            additionalProperties: {
              // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/137
              oneOf: [
                {
                  $type: 'Microsoft.IDialog',
                  $ref: '#/definitions/Microsoft.IDialog',
                },
                {
                  type: 'array',
                  items: {
                    $type: 'Microsoft.IDialog',
                    $ref: '#/definitions/Microsoft.IDialog',
                  },
                  title: 'array',
                },
              ],
              title: 'If False',
              description: 'Step to execute if case is true',
            },
          },
          default: {
            // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/137
            oneOf: [
              {
                $type: 'Microsoft.IDialog',
                $ref: '#/definitions/Microsoft.IDialog',
              },
              {
                type: 'array',
                items: {
                  $type: 'Microsoft.IDialog',
                  $ref: '#/definitions/Microsoft.IDialog',
                },
                title: 'array',
              },
            ],
            title: 'If True',
            description: 'Step to execute if expression is true.',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['expression', 'ifTrue', '$type'],
        //   },
        // ],
      },
      'Microsoft.TextInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Text prompt',
        description: 'This represents a dialog which gathers a text from the user',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.TextInput',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          property: {
            type: 'string',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['user.name'],
          },
          // TODO - https://github.com/Microsoft/BotFramework-Composer/issues/136
          inputProperties: {
            type: 'object',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['user.name'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            type: 'string',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['user.name'],
          },
          prompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Initial Prompt',
            description: 'The message to send to as prompt for this input.',
            examples: ['What is your birth date?'],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          retryPrompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Retry Prompt',
            description: 'The message to send to prompt again.',
            examples: ["Let's try again. What is your birth date?"],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          invalidPrompt: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Invalid Prompt',
            description: 'The message to send to when then input was not recognized or not valid for the input type.',
            examples: ['No date was recognized'],
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
          pattern: {
            type: 'string',
            title: 'Pattern',
            description: 'A regular expression pattern which must match',
            examples: ['\\w{3,30}'],
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['$type'],
        //   },
        // ],
      },
      'Microsoft.WelcomeRule': {
        $role: 'unionType(Microsoft.IRule)',
        title: 'Welcome Rule',
        description: 'Defines a sequence of steps to take if the user is a new user',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.WelcomeRule',
          },
          $copy: {
            title: '$copy',
            description: 'Copy the definition by id from a .dialog file.',
            type: 'string',
            pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
          },
          $id: {
            title: '$id',
            description: 'Inline id for reuse of an inline definition',
            type: 'string',
            pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
          },
          events: {
            type: 'array',
            description: 'Events to trigger this rule for',
            items: {
              type: 'string',
            },
          },
          expression: {
            type: 'string',
            title: 'Constraint',
            description: 'Optional constraint to which must be met for this rule to fire',
            examples: ['user.vip == true'],
          },
          steps: {
            type: 'array',
            description: 'Sequence of steps or dialogs to execute',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
        // TODO
        // anyOf: \[
        //   {
        //     title: 'Reference',
        //     required: ['$copy'],
        //   },
        //   {
        //     title: 'Type',
        //     required: ['steps', '$type'],
        //   },
        // ],
      },
    },
  };
}
