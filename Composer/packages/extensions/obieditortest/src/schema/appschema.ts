import { JSONSchema6 } from 'json-schema';

import { DialogInfo } from '../types';

export const FIELDS_TO_HIDE = ['$id', '$type', '$copy', '$designer', 'inputProperties', 'selector'];

export enum DialogGroup {
  INPUT = 'INPUT',
  RESPONSE = 'RESPONSE',
  MEMORY = 'MEMORY',
  STEP = 'STEP',
  CODE = 'CODE',
  LOG = 'LOG',
  RULE = 'RULE',
  RECOGNIZER = 'RECOGNIZER',
  SELECTOR = 'SELECTOR',
  OTHER = 'OTHER',
}

export interface DialogGroupItem {
  label: string;
  types: string[];
}

export type DialogGroupsMap = { [key in DialogGroup]: DialogGroupItem };
export const dialogGroups: DialogGroupsMap = {
  [DialogGroup.INPUT]: {
    label: 'Input/Prompt Dialogs',
    types: [
      'Microsoft.ChoiceInput',
      'Microsoft.ConfirmInput',
      'Microsoft.FloatInput',
      'Microsoft.IntegerInput',
      'Microsoft.NumberInput',
      'Microsoft.TextInput',
    ],
  },
  [DialogGroup.RESPONSE]: {
    label: 'Sending a response',
    types: ['Microsoft.SendActivity'],
  },
  [DialogGroup.MEMORY]: {
    label: 'Memory manipulation',
    types: [
      'Microsoft.DeleteProperty',
      'Microsoft.EditArray',
      'Microsoft.InitProperty',
      'Microsoft.SaveEntity',
      'Microsoft.SetProperty',
    ],
  },
  [DialogGroup.STEP]: {
    label: 'Conversational flow and dialog management',
    types: [
      'Microsoft.BeginDialog',
      'Microsoft.CancelAllDialogs',
      'Microsoft.EmitEvent',
      'Microsoft.EndDialog',
      'Microsoft.EndTurn',
      'Microsoft.IfCondition',
      'Microsoft.RepeatDialog',
      'Microsoft.ReplaceDialog',
      'Microsoft.SendActivity',
      'Microsoft.SwitchCondition',
    ],
  },
  [DialogGroup.CODE]: {
    label: 'Roll your own code',
    types: ['Microsoft.CodeStep', 'Microsoft.HttpRequest'],
  },
  [DialogGroup.LOG]: {
    label: 'Tracing and logging',
    types: ['Microsoft.LogStep', 'Microsoft.TraceActivity'],
  },
  [DialogGroup.RULE]: {
    label: 'Rules',
    types: ['Microsoft.EventRule', 'Microsoft.IntentRule', 'Microsoft.UnknownIntentRule'],
  },
  [DialogGroup.RECOGNIZER]: {
    label: 'Recognizers',
    types: ['Microsoft.LuisRecognizer', /* 'Microsoft.MultiLanguageRecognizers', */ 'Microsoft.RegexRecognizer'],
  },
  [DialogGroup.SELECTOR]: {
    label: 'Selectors',
    types: [
      'Microsoft.ConditionalSelector',
      'Microsoft.FirstSelector',
      'Microsoft.MostSpecificSelector',
      'Microsoft.RandomSelector',
      'Microsoft.TrueSelector',
    ],
  },
  [DialogGroup.OTHER]: {
    label: 'Other',
    types: ['Microsoft.AdaptiveDialog', 'Microsoft.LanguagePolicy', 'Microsoft.QnAMakerDialog'],
  },
};

export function getMergedSchema(dialogFiles: DialogInfo[] = []): JSONSchema6 {
  const dialogNames = dialogFiles.map(f => {
    return f.name.includes('.') ? f.name.substring(0, f.name.lastIndexOf('.')) : f.name;
  });
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
      // {
      //   title: 'Microsoft.MultiLanguageRecognizers',
      //   description:
      //     'Recognizer which allows you to configure the recognizer per language, and to define the policy for using them',
      //   $ref: '#/definitions/Microsoft.MultiLanguageRecognizers',
      // },
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          inputProperties: {
            type: 'object',
            title: 'Input Properties',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['value.birthday'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            $role: 'memoryPath',
            title: 'Output Property',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          autoEndDialog: {
            type: 'boolean',
            title: 'Auto End Dialog',
            description:
              'IF this is true the dialog will automatically end when there are no more steps to run.  If this is false it is the responsbility of the author to call EndDialog at an appropriate time.',
          },
          recognizer: {
            $type: 'Microsoft.IRecognizer',
            type: 'object',
            title: 'Recognizer',
            description: 'Configured recognizer to generate intent and entites from user utterance',
            $ref: '#/definitions/Microsoft.IRecognizer',
          },
          selector: {
            $type: 'Microsoft.IRuleSelector',
            type: 'object',
            title: 'Selector',
            description: 'Policy for how to select rule to execute next',
            $ref: '#/definitions/Microsoft.IRuleSelector',
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
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.BeginDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Begin Dialog',
        description: 'Step which begins another dialog (and when that dialog is done, it will return the caller).',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          dialog: {
            $type: 'Microsoft.IDialog',
            title: 'Dialog',
            description: 'This is the dialog to call.',
            ...dialogEnum,
          },
          options: {
            type: 'object',
            title: 'Options',
            description: 'Options to pass to the dialog.',
            additionalProperties: true,
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'The property to bind to the dialog and store the result in',
            examples: ['user.name'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.CancelAllDialogs': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Cancel All Dialogs',
        description:
          'Command to cancel all of the current dialogs by emitting an event which must be caught to prevent cancelation from propagating.',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.CancelAllDialogs',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          eventName: {
            type: 'string',
            title: 'Event Name',
            description: 'Name of the event which is emitted',
          },
          eventValue: {
            type: 'object',
            title: 'Event Value',
            description:
              'object value which is a payload to communicate to the parent dialogs so that they can decide how to process it',
            additionalProperties: true,
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.ChoiceInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'ChoiceInput Dialog',
        description: 'This represents a dialog which gathers a choice responses',
        type: 'object',
        definitions: {
          choice: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
                description: 'the value to return when selected.',
              },
              action: {
                title: 'Action',
                description: 'Card action for the choice',
                type: 'object',
              },
              synonyms: {
                type: 'array',
                title: 'Synonyms',
                description: 'the list of synonyms to recognize in addition to the value. This is optional.',
                items: {
                  type: 'string',
                },
              },
            },
          },
          CardAction: {
            type: 'object',
          },
        },
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.ChoiceInput',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          inputProperties: {
            type: 'object',
            title: 'Input Properties',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['value.birthday'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            $role: 'memoryPath',
            title: 'Output Property',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
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
          style: {
            type: 'string',
            enum: ['None', 'Auto', 'Inline', 'List', 'SuggestedAction', 'HeroCard'],
            title: 'List Style',
            description: 'The kind of choice list style to generate',
          },
          choicesProperty: {
            type: 'string',
            title: 'Choices Property',
            decription: 'unknown ??? ',
          },
          choices: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: {
                  type: 'string',
                  title: 'Value',
                  description: 'the value to return when selected.',
                },
                action: {
                  title: 'Action',
                  description: 'Card action for the choice',
                  type: 'object',
                },
                synonyms: {
                  type: 'array',
                  title: 'Synonyms',
                  description: 'the list of synonyms to recognize in addition to the value. This is optional.',
                  items: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.CodeStep': {
        title: 'Code Step',
        description: 'A dialog step that executes custom code',
        type: 'object',
        properties: {
          $type: {
            type: 'string',
            const: 'Microsoft.CodeStep',
          },
          $designer: {
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          codeHandler: {
            title: 'Code Handler',
            description: 'The handler that is invoked for the code step.',
            type: 'string',
          },
        },
      },
      'Microsoft.ConditionalSelector': {
        $role: 'unionType(Microsoft.IRuleSelector)',
        title: 'Condtional Rule Selector',
        description: 'Use a rule selector based on a condition',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.ConditionalSelector',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          condition: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
          },
          ifTrue: {
            $type: 'Microsoft.IRuleSelector',
            $ref: '#/definitions/Microsoft.IRuleSelector',
          },
          ifFalse: {
            $type: 'Microsoft.IRuleSelector',
            $ref: '#/definitions/Microsoft.IRuleSelector',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.ConfirmInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'ConfirmInput Dialog',
        description: 'This represents a dialog which gathers a yes/no style responses',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          inputProperties: {
            type: 'object',
            title: 'Input Properties',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['value.birthday'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            $role: 'memoryPath',
            title: 'Output Property',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
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
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      // 'Microsoft.DebugBreak': {
      //   $role: 'unionType(Microsoft.IDialog)',
      //   title: 'Debugger Break Step',
      //   description: 'If debugger is attached, do a debugger break at this point',
      //   type: 'object',
      //   properties: {
      //     $type: {
      //       title: '$type',
      //       description:
      //         'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
      //       type: 'string',
      //       pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
      //       const: 'Microsoft.DebugBreak',
      //     },
      //     $copy: {
      //       title: '$copy',
      //       description: 'Copy the definition by id from a .dialog file.',
      //       type: 'string',
      //       pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
      //     },
      //     $id: {
      //       title: '$id',
      //       description: 'Inline id for reuse of an inline definition',
      //       type: 'string',
      //       pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
      //     },
      //     $designer: {
      //       title: '$designer',
      //       type: 'object',
      //       description: 'Extra information for the Bot Framework Designer.',
      //     },
      //   },
      //   additionalProperties: false,
      //   patternProperties: {
      //     '^\\$': {
      //       type: 'string',
      //     },
      //   },
      // },
      'Microsoft.DeleteProperty': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Delete PropertyS',
        description: 'This is a step which allows you to remove a property from memory',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'The Memory property path to delete',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.EditArray': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Edit Array Step',
        description: 'This is a step which allows you to modify an array in memory',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          changeType: {
            type: 'string',
            title: 'Change Type',
            description: 'The array operation to perform',
            enum: ['Push', 'Pop', 'Take', 'Remove', 'Clear'],
          },
          arrayProperty: {
            $role: 'memoryPath',
            title: 'Array Property',
            description: 'Memory expression of the array to manipulate.',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          itemProperty: {
            $role: 'memoryPath',
            title: 'List Property',
            description: 'Memory expression for the item',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.EmitEvent': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Emit Event Step',
        description: 'This is a step which allows you to emit an event',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.EmitEvent',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          eventName: {
            type: 'string',
            title: 'Event Name',
            description: 'The name of event to emit',
            enum: [
              'BeginDialog',
              'ConsultDialog',
              'ActivityReceived',
              'UtteranceRecognized',
              'Fallback',
              'PlanStarted',
              'PlanSaved',
              'PlanEnded',
              'PlanResumed',
            ],
          },
          eventValue: {
            type: 'object',
            title: 'Event Value',
            description: 'optional value to emit along with the event',
          },
          bubbleEvent: {
            type: 'boolean',
            title: 'Bubble Event',
            description: 'if true this event should propagate to parent dialogs',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.EndDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'End Dialog',
        description: 'Command which ends the current dialog, returning the resultProperty as the result of the dialog.',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            description: 'Specifies a path to memory should be returned as the result to the calling dialog.',
            examples: ['dialog.name'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.EndTurn': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'End Turn',
        description: 'End the current turn without ending the dialog.',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.EventRule': {
        title: 'Event Rule',
        description: 'Defines a rule for an event which is triggered by some source',
        type: 'object',
        $role: 'unionType(Microsoft.IRule)',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          constraint: {
            $role: 'expression',
            title: 'Constraint',
            description: 'Optional constraint to which must be met for this rule to fire',
            examples: ['user.vip == true'],
            type: 'string',
          },
          steps: {
            type: 'array',
            description: 'Sequence of steps or dialogs to execute',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
          events: {
            title: 'Events',
            type: 'array',
            description: 'Events to trigger this rule for',
            items: {
              type: 'string',
              enum: [
                'beginDialog',
                'consultDialog',
                'cancelDialog',
                'activityReceived',
                'recognizedIntent',
                'unknownIntent',
                'stepsStarted',
                'stepsSaved',
                'stepsEnded',
                'stepsResumed',
              ],
            },
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.FirstSelector': {
        $role: 'unionType(Microsoft.IRuleSelector)',
        title: 'First Rule Selector',
        description: 'Selector for first true rule',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.FirstSelector',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.FloatInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Float  prompt',
        description: 'This represents a dialog which gathers a number in a specified range',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          inputProperties: {
            type: 'object',
            title: 'Input Properties',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['value.birthday'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            $role: 'memoryPath',
            title: 'Output Property',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
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
            examples: ['0.5'],
          },
          maxValue: {
            type: 'number',
            title: 'Maximum value',
            description: 'The maximum value that is acceptable.  ',
            examples: ['12.5'],
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.HttpRequest': {
        $role: 'unionType(Microsoft.IDialog)',
        type: 'object',
        title: 'Http Request',
        description: 'This is a step which replaces the current dialog with the target dialog',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
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
          body: {
            type: 'object',
            title: 'Body',
            description: 'The body to send in the HTTP call  (supports data binding)',
            additionalProperties: true,
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'The property to store the result of the HTTP call in (as object or string)',
            examples: ['dialog.contosodata'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          header: {
            type: 'object',
            additionProperties: true,
            title: 'Http headers',
            description: 'Http headers to include with the HTTP request (supports data binding)',
          },
          responseTypes: {
            type: 'string',
            title: 'Response Types',
            description:
              'Describes how to parse the response from the http request. If Activity or Activities, then the they will be sent to the user.',
            enum: ['none', 'json', 'activity', 'activities'],
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.IActivityTemplate': {
        title: 'Microsoft ActivityTemplate',
        // description: 'Union of components which implement the IActivityTemplate interface',
        $role: 'unionType',
        type: 'string',
        description: 'String is used for language generation.',
      },
      'Microsoft.IDialog': {
        title: 'Microsoft IDialog',
        description: 'Union of components which implement the IDialog interface',
        $role: 'unionType',
        type: 'object',
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
            title: 'Microsoft.CancelAllDialogs',
            description:
              'Command to cancel all of the current dialogs by emitting an event which must be caught to prevent cancelation from propagating.',
            $ref: '#/definitions/Microsoft.CancelAllDialogs',
          },
          {
            title: 'Microsoft.ChoiceInput',
            description: 'This represents a dialog which gathers a choice responses',
            $ref: '#/definitions/Microsoft.ChoiceInput',
          },
          {
            title: 'Microsoft.ConfirmInput',
            description: 'This represents a dialog which gathers a yes/no style responses',
            $ref: '#/definitions/Microsoft.ConfirmInput',
          },
          // {
          //   title: 'Microsoft.DebugBreak',
          //   description: 'If debugger is attached, do a debugger break at this point',
          //   $ref: '#/definitions/Microsoft.DebugBreak',
          // },
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
            title: 'Microsoft.EmitEvent',
            description: 'This is a step which allows you to emit an event',
            $ref: '#/definitions/Microsoft.EmitEvent',
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
            title: 'Microsoft.InitProperty',
            description: 'This step allows you to initialize a property to either an object or array',
            $ref: '#/definitions/Microsoft.InitProperty',
          },
          {
            title: 'Microsoft.IntegerInput',
            description: 'This represents a dialog which gathers a number in a specified range',
            $ref: '#/definitions/Microsoft.IntegerInput',
          },
          {
            title: 'Microsoft.LogStep',
            description:
              'This is a step which writes to console.log and optionally creates a TraceActivity around a text binding',
            $ref: '#/definitions/Microsoft.LogStep',
          },
          {
            title: 'Microsoft.NumberInput',
            description: 'This represents a dialog which gathers a decimal number in a specified range',
            $ref: '#/definitions/Microsoft.NumberInput',
          },
          {
            title: 'Microsoft.QnAMakerDialog',
            description: 'This represents a dialog which is driven by a call to QnAMaker.ai knowledge base',
            $ref: '#/definitions/Microsoft.QnAMakerDialog',
          },
          {
            title: 'Microsoft.RepeatDialog',
            description: 'This is a step which repeats the current dialog with the same dialog.',
            $ref: '#/definitions/Microsoft.RepeatDialog',
          },
          {
            title: 'Microsoft.ReplaceDialog',
            description: 'This is a step which replaces the current dialog with the target dialog',
            $ref: '#/definitions/Microsoft.ReplaceDialog',
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
            title: 'Microsoft.SetProperty',
            description: 'This step allows you to set memory to the value of an expression',
            $ref: '#/definitions/Microsoft.SetProperty',
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
            title: 'Microsoft.TraceActivity',
            description: 'This is a step which sends an TraceActivity to the transcript',
            $ref: '#/definitions/Microsoft.TraceActivity',
          },
          {
            type: 'string',
            title: 'string',
          },
        ],
      },
      'Microsoft.ILanguagePolicy': {
        title: 'Microsoft Language Policy',
        description: 'Union of components which implement the ILanguagePolicy interface',
        $role: 'unionType',
        oneOf: [
          {
            title: 'Microsoft.LanguagePolicy',
            description: 'This represents a dialog which gathers a DateTime in a specified range',
            $ref: '#/definitions/Microsoft.LanguagePolicy',
          },
          {
            type: 'string',
            // TODO -- what is a better title for this?
            title: 'string',
          },
        ],
      },
      'Microsoft.IRecognizer': {
        title: 'Microsoft IRecognizer',
        description: 'Union of components which implement the IRecognizer interface',
        $role: 'unionType',
        oneOf: [
          {
            title: 'Microsoft.LuisRecognizer',
            description: 'LUIS recognizer.',
            $ref: '#/definitions/Microsoft.LuisRecognizer',
          },
          // {
          //   title: 'Microsoft.MultiLanguageRecognizer',
          //   description:
          //     'Recognizer which allows you to configure the recognizer per language, and to define the policy for using them',
          //   $ref: '#/definitions/Microsoft.MultiLanguageRecognizer',
          // },
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
        oneOf: [
          {
            title: 'Microsoft.EventRule',
            description: 'Defines a rule for an event which is triggered by some source',
            $ref: '#/definitions/Microsoft.EventRule',
          },
          {
            title: 'Microsoft.IntentRule',
            description: 'This defines the steps to take when an Intent is recognized (and optionally entities)',
            $ref: '#/definitions/Microsoft.IntentRule',
          },
          {
            title: 'Microsoft.Rule',
            description: 'Defines a rule for an event which is triggered by some source',
            $ref: '#/definitions/Microsoft.Rule',
          },
          {
            title: 'Microsoft.UnknownIntentRule',
            description: 'Defines a sequence of steps to take if there is no other trigger or plan operating',
            $ref: '#/definitions/Microsoft.UnknownIntentRule',
          },
        ],
      },
      'Microsoft.IRuleSelector': {
        title: 'Microsoft IRuleSelector',
        description: 'Union of components which implement the IRuleSelector interface',
        $role: 'unionType',
        type: 'object',
        oneOf: [
          {
            title: 'Microsoft.ConditionalSelector',
            description: 'Use a rule selector based on a condition',
            $ref: '#/definitions/Microsoft.ConditionalSelector',
          },
          {
            title: 'Microsoft.FirstSelector',
            description: 'Selector for first true rule',
            $ref: '#/definitions/Microsoft.FirstSelector',
          },
          {
            title: 'Microsoft.MostSpecificSelector',
            description: 'Select most specific true rules with optional additional selector',
            $ref: '#/definitions/Microsoft.MostSpecificSelector',
          },
          {
            title: 'Microsoft.RandomSelector',
            description: 'Select most specific true rule',
            $ref: '#/definitions/Microsoft.RandomSelector',
          },
          {
            title: 'Microsoft.TrueSelector',
            description: 'Selector for all true rules',
            $ref: '#/definitions/Microsoft.TrueSelector',
          },
        ],
      },
      'Microsoft.ITextTemplate': {
        title: 'Microsoft TextTemplate',
        description: 'Union of components which implement the ITextTemplate interface',
        $role: 'unionType',
        type: 'string',
      },
      'Microsoft.IfCondition': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'If Condition Step',
        description: 'Step which conditionally decides which step to execute next.',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          condition: {
            $role: 'expression',
            title: 'Condition',
            description: 'Expression to evaluate.',
            examples: ['user.age > 3'],
            type: 'string',
          },
          steps: {
            type: 'array',
            title: 'Steps',
            description: 'Step to execute if condition is true.',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
          elseSteps: {
            type: 'array',
            title: 'Else Steps',
            description: 'Step to execute if condition is false.',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.InitProperty': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Init Property Step',
        description: 'This step allows you to initialize a property to either an object or array',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.InitProperty',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'The property to set the value of',
            examples: ['user.age'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          type: {
            type: 'string',
            title: 'Type',
            description: 'Type of value to set the property to, object or array.',
            enum: ['object', 'array'],
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.IntegerInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Integer prompt',
        description: 'This represents a dialog which gathers a number in a specified range',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          inputProperties: {
            type: 'object',
            title: 'Input Properties',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['value.birthday'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            $role: 'memoryPath',
            title: 'Output Property',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
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
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.IntentRule': {
        $role: 'unionType(Microsoft.IRule)',
        title: 'Intent Rule',
        description: 'This defines the steps to take when an Intent is recognized (and optionally entities)',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          constraint: {
            $role: 'expression',
            title: 'Constraint',
            description: 'Optional constraint to which must be met for this rule to fire',
            examples: ['user.vip == true'],
            type: 'string',
          },
          steps: {
            type: 'array',
            description: 'Sequence of steps or dialogs to execute',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
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
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.LanguagePolicy': {
        $role: 'unionType(Microsoft.ILanguagePolicy)',
        title: 'Language Policy',
        description: 'This represents a dialog which gathers a DateTime in a specified range',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.LanguagePolicy',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.LogStep': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Log Step',
        description:
          'This is a step which writes to console.log and optionally creates a TraceActivity around a text binding',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.LogStep',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          text: {
            type: 'string',
            title: 'Text',
            description: 'LG Expression to write to the log',
          },
          traceActivity: {
            type: 'boolean',
            title: 'Send Trace Activity',
            description: 'Set to true to also create a TraceActivity with the log text',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.LuisRecognizer': {
        $role: 'unionType(Microsoft.IRecognizer)',
        title: 'LUIS Recognizer',
        description: 'LUIS recognizer.',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.LuisRecognizer',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          applicationId: {
            type: 'string',
          },
          endpoint: {
            type: 'string',
          },
          endpointKey: {
            type: 'string',
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.MostSpecificSelector': {
        $role: 'unionType(Microsoft.IRuleSelector)',
        title: 'Most Specific Rule Selector',
        description: 'Select most specific true rules with optional additional selector',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.MostSpecificSelector',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          selector: {
            $type: 'Microsoft.IRuleSelector',
            $ref: '#/definitions/Microsoft.IRuleSelector',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      // 'Microsoft.MultiLanguageRecognizer': {
      //   $role: 'unionType(Microsoft.IRecognizer)',
      //   title: 'Multi Language Recognizer',
      //   description:
      //     'Recognizer which allows you to configure the recognizer per language, and to define the policy for using them',
      //   type: 'object',
      //   properties: {
      //     $type: {
      //       title: '$type',
      //       description:
      //         'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
      //       type: 'string',
      //       pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
      //       const: 'Microsoft.MultiLanguageRecognizer',
      //     },
      //     $copy: {
      //       title: '$copy',
      //       description: 'Copy the definition by id from a .dialog file.',
      //       type: 'string',
      //       pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
      //     },
      //     $id: {
      //       title: '$id',
      //       description: 'Inline id for reuse of an inline definition',
      //       type: 'string',
      //       pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
      //     },
      //     $designer: {
      //       title: '$designer',
      //       type: 'object',
      //       description: 'Extra information for the Bot Framework Designer.',
      //     },
      //     languagePolicy: {
      //       $type: 'Microsoft.ILanguagePolicy',
      //       type: 'object',
      //       title: 'Language Policy',
      //       description: 'Defines languages to try per language.',
      //       $ref: '#/definitions/Microsoft.ILanguagePolicy',
      //     },
      //     recognizers: {
      //       type: 'object',
      //       title: 'Recognizers',
      //       description: 'Map of language -> IRecognizer',
      //       additionalProperties: {
      //         $type: 'Microsoft.IRecognizer',
      //         $ref: '#/definitions/Microsoft.IRecognizer',
      //       },
      //     },
      //   },
      //   additionalProperties: false,
      //   patternProperties: {
      //     '^\\$': {
      //       type: 'string',
      //     },
      //   },
      // },
      'Microsoft.NumberInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Number prompt',
        description: 'This represents a dialog which gathers a decimal number in a specified range',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.NumberInput',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          inputProperties: {
            type: 'object',
            title: 'Input Properties',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['value.birthday'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            $role: 'memoryPath',
            title: 'Output Property',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
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
            type: 'number',
            title: 'Mininum value',
            description: 'The minimum value that is acceptable.  ',
            examples: ['0.1'],
          },
          maxValue: {
            type: 'number',
            title: 'Maximum value',
            description: 'The maximum value that is acceptable.  ',
            examples: ['12.5'],
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.QnAMakerDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'QnAMaker Dialog',
        description: 'This represents a dialog which is driven by a call to QnAMaker.ai knowledge base',
        type: 'object',
        additionalProperties: false,
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.QnAMakerDialog',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          endpoint: {
            type: 'object',
            title: 'Endpoint',
            description: 'This is the QnAMaker endpoint to use',
            required: ['knowledgeBaseId', 'endpointKey', 'host'],
            properties: {
              knowledgeBaseId: {
                type: 'string',
                title: 'Knowledgebase Id',
                description: 'the knowledge base ID.',
              },
              endpointKey: {
                type: 'string',
                title: 'Endpoint Key',
                description: 'sets the endpoint key for the knowledge base',
              },
              host: {
                type: 'string',
                title: 'Host',
                description: 'sets the host path',
                examples: ['https://yourserver.azurewebsites.net/qnamaker'],
              },
            },
          },
          options: {
            type: 'object',
            title: 'Options',
            properties: {
              scoreThreshold: {
                type: 'number',
                title: 'Score Threshold',
                description:
                  '"sets the minimum score threshold, used to filter returned results. Scores are normalized to the range of 0.0 to 1.0',
              },
            },
          },
        },
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.RandomSelector': {
        $role: 'unionType(Microsoft.IRuleSelector)',
        title: 'Random rule selector',
        description: 'Select most specific true rule',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.RandomSelector',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          seed: {
            type: 'integer',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          intents: {
            type: 'object',
            title: 'RegEx patterns to intents',
            description: 'Pattern->Intents mappings',
            propertyNames: {
              title: 'Intent Name',
            },
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
      },
      'Microsoft.RepeatDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        type: 'object',
        title: 'Repeat Dialog',
        description: 'This is a step which repeats the current dialog with the same dialog.',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.RepeatDialog',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.ReplaceDialog': {
        $role: 'unionType(Microsoft.IDialog)',
        type: 'object',
        title: 'Replace Dialog',
        description: 'This is a step which replaces the current dialog with the target dialog',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.ReplaceDialog',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          dialog: {
            $type: 'Microsoft.IDialog',
            title: 'Dialog',
            description: 'This is the dialog to switch to.',
            ...dialogEnum,
          },
          options: {
            type: 'object',
            title: 'Options',
            description: 'Options to pass to the dialog.',
            additionalProperties: true,
          },
          property: {
            $role: 'memoryPath',
            description: 'The property to bind to the dialog and store the result in',
            examples: ['user.name'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.Rule': {
        $role: 'unionType(Microsoft.IRule)',
        title: 'Event Rule',
        description: 'Defines a rule for an event which is triggered by some source',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          constraint: {
            $role: 'expression',
            title: 'Constraint',
            description: 'Optional constraint to which must be met for this rule to fire',
            examples: ['user.vip == true'],
            type: 'string',
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
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.SaveEntity': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'SaveEntity Step',
        description: 'This is a step which allows you to save a memory property as an entity',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          entity: {
            type: 'string',
            title: 'Entity',
            description: 'name of the entity to save',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'Memory expression of the property to save as an entity.',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.SendActivity': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Send Activity Step',
        description: 'This is a step which sends an activity to the user',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          activity: {
            $type: 'Microsoft.IActivityTemplate',
            title: 'Activity',
            description: 'Activity to send to the user',
            $ref: '#/definitions/Microsoft.IActivityTemplate',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.SetProperty': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Set Property Step',
        description: 'This step allows you to set memory to the value of an expression',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.SetProperty',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'The property to set the value of',
            examples: ['user.age'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          value: {
            $role: 'expression',
            title: 'Value',
            description: 'Expression against memory to use to get the value.',
            examples: ['dialog.result'],
            type: 'string',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.SwitchCondition': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Switch Step',
        description: 'Step which conditionally decides which step to execute next.',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          condition: {
            $role: 'expression',
            title: 'Condition',
            description: 'Expression to evaluate to switch on.',
            examples: ['user.age > 3'],
            type: 'string',
          },
          cases: {
            type: 'array',
            title: 'Cases',
            desc: 'Cases to evaluate against condition',
            items: {
              type: 'object',
              properties: {
                value: {
                  $role: 'expression',
                  title: 'Value',
                  description: 'Value which must match the condition property',
                },
                steps: {
                  type: 'array',
                  items: {
                    $type: 'Microsoft.IDialog',
                    $ref: '#/defintions/Microsoft.IDialog',
                  },
                  title: 'Steps',
                  description: 'Steps to execute if case is equal to condition',
                },
              },
              required: ['value', 'case'],
            },
          },
          default: {
            type: 'array',
            title: 'Default',
            description: 'Step to execute if no case is equal to condition',
            items: {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.TextInput': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Text prompt',
        description: 'This represents a dialog which gathers a text from the user',
        type: 'object',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          property: {
            $role: 'memoryPath',
            title: 'Property',
            description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
          inputProperties: {
            type: 'object',
            title: 'Input Properties',
            description: 'This defines properties which be passed as arguments to this dialog',
            examples: ['value.birthday'],
            additionalProperties: {
              type: 'string',
            },
          },
          outputProperty: {
            $role: 'memoryPath',
            title: 'Output Property',
            description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
            examples: ['value.birthday'],
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
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
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.TraceActivity': {
        $role: 'unionType(Microsoft.IDialog)',
        title: 'Trace Activity Step',
        description: 'This is a step which sends an TraceActivity to the transcript',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.TraceActivity',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          name: {
            type: 'string',
            title: 'Name',
            description: 'Name of the trace activity',
          },
          valueType: {
            type: 'string',
            title: 'Value Type',
            description: 'Value type of the trace activity',
          },
          valueProperty: {
            $role: 'memoryPath',
            title: 'Value Property',
            description: 'Property path to memory object to send as the value of the trace activity',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.TrueSelector': {
        $role: 'unionType(Microsoft.IRuleSelector)',
        title: 'True Rule Selector',
        description: 'Selector for all true rules',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.TrueSelector',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
        },
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
      'Microsoft.UnknownIntentRule': {
        title:
          'This defines the steps to take when an utterence is not recognized (aka, the None Intent). NOTE: UnknownIntent will defer to any specific intent that fires in a parent dialog',
        description: 'Defines a sequence of steps to take if there is no other trigger or plan operating',
        $role: 'unionType(Microsoft.IRule)',
        type: 'object',
        properties: {
          $type: {
            title: '$type',
            description:
              'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
            const: 'Microsoft.UnknownIntentRule',
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
          $designer: {
            title: '$designer',
            type: 'object',
            description: 'Extra information for the Bot Framework Designer.',
          },
          constraint: {
            $role: 'expression',
            title: 'Constraint',
            description: 'Optional constraint to which must be met for this rule to fire',
            examples: ['user.vip == true'],
            type: 'string',
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
        additionalProperties: false,
        patternProperties: {
          '^\\$': {
            type: 'string',
          },
        },
      },
    },
  };
}
