import { JSONSchema6 } from 'json-schema';

export const FIELDS_TO_HIDE = ['$id', '$type', '$copy', '$designer', 'inputBindings', 'outputBinding', 'selector'];
/** Types that can be represented by a sub tree in the graph */
export const COMPOUND_TYPES = [
  'Microsoft.AdaptiveDialog',
  'Microsoft.EventRule',
  'Microsoft.IntentRule',
  'Microsoft.UnknownIntentRule',
];

export const appschema: JSONSchema6 = {
  $schema:
    'https://raw.githubusercontent.com/Microsoft/botbuilder-tools/SchemaGen/packages/DialogSchema/src/dialogSchema.schema',
  $id: 'app.schema',
  type: 'object',
  title: 'Component types',
  description: 'These are all the types of components that the loader can create.',
  definitions: {
    'Microsoft.AdaptiveDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Adaptive Dialog',
      description: 'This configures a data driven dialog via a collection of steps/dialogs.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'This defines the valid properties for the component being configured (from a dialog .schema file)',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory used to store customer input.',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['turn.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
          description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        autoEndDialog: {
          type: 'boolean',
          title: 'Auto End Dialog',
          description:
            'If this is true the dialog will automatically end when there are no more steps to run.  If this is false it is the responsbility of the author to call EndDialog at an appropriate time.',
          default: true,
        },
        recognizer: {
          $type: 'Microsoft.IRecognizer',
          type: 'object',
          title: 'Recognizer',
          description: 'Configured recognizer to generate intent and entites from user utterance',
          $ref: '#/definitions/Microsoft.IRecognizer',
        },
        generator: {
          $type: 'Microsoft.ILanguageGenerator',
          title: 'Language Generator',
          description: 'Language generator to use for this dialog. (aka: LG file)',
          type: 'string',
        },
        // selector: {
        //   $type: 'Microsoft.IRuleSelector',
        //   title: 'Selector',
        //   description: 'Policy for how to select rule to execute next',
        //   $ref: '#/definitions/Microsoft.IRuleSelector',
        // },
        steps: {
          type: 'array',
          title: 'Actions',
          description: 'This is the initial sequence of steps to execute when this dialog is started.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        rules: {
          type: 'array',
          description: 'This is the array of rules to use to evaluate conversation',
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
    'Microsoft.AttachmentInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'ConfirmInput Dialog',
      description: 'This represents a dialog which gathers yes/no style responses',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'This defines the valid properties for the component being configured (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.AttachmentInput',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory used to store customer input.',
          examples: ['turn.birthday', 'user.name'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['turn.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
          description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial Prompt',
          description: 'The first message to send as a prompt for this value.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: "The message to send if no attachment is found in the customer's response.",
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: "The message to send if the customer's response fails the validation rules.",
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The maximum number of times this prompt will be presented.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Rules',
          description:
            'These are expressions used to validate the customer response. The response is considered invalid if any of these evaluate to false.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'An expression used to validate customer input.',
          },
        },
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'The expression that you evaluated for input.',
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: 'Value to return if max turn count is reached.',
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always Prompt',
          description: 'If set, this will always prompt the customer even if the value is already known.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set, this prompt will allow interruptions.',
          default: false,
          examples: [true],
        },
        outputFormat: {
          type: 'string',
          enum: ['all', 'first'],
          title: 'Output Format',
          description: 'The format of the final value.',
          default: 'first',
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
      description: 'Begin a child dialog, then resume from this point.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'This defines the valid properties for the component being configured (from a dialog .schema file)',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog',
          description: 'Select a dialog to call at this point.',
          type: 'string',
        },
        options: {
          type: 'object',
          title: 'Options',
          description:
            'Define options to pass to this dialog. These will be available in the child dialog as dialog.options.<name>.',
          additionalProperties: true,
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory used to store the results of this dialog.',
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
      description: 'The command used to cancel all current dialogs running.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
      description:
        'This represents a dialog that confirms multiple choices; for instance it might ask customers to select one from a list offered.',
      type: 'object',
      definitions: {
        choice: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
              title: 'Value',
              description: 'The choice label and value that will be returned when selected.',
            },
            action: {
              title: 'Action',
              description: 'Card action for the choice',
              type: 'object',
              additionalProperties: true,
            },
            synonyms: {
              type: 'array',
              title: 'Synonyms',
              description: 'An optional list of synonyms that can be used to select this choice.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory used to store customer input.',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['turn.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
          description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial Prompt',
          description: 'The first message to send as a prompt for this value.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: "The message to send if no valid choice is found in the customer's response.",
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: "The message to send if the customer's response fails the validation rules.",
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The maximum number of times this prompt will be presented.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Rules',
          description:
            'These are expressions used to validate the customer response. The response is considered invalid if any of these evaluate to false.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'An expression used to validate customer input.',
          },
        },
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'The expression that you evaluated for input.',
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: 'Value to return if max turn count is reached.',
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always Prompt',
          description: 'If set, this will always prompt the customer even if the value is already known.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set, this prompt will allow interruptions.',
          default: true,
          examples: [true],
        },
        outputFormat: {
          type: 'string',
          enum: ['value', 'index'],
          title: 'Output Format',
          description: 'The format of the final value.',
          default: 'value',
        },
        choices: {
          title: 'Choices',
          type: 'array',
          items: {
            title: 'Value',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
                description: 'The choice label and value that will be returned when selected.',
              },
              // TODO: Re-enable card actions when we are better equipped to provide a UI that is foolproof
              // action: {
              //   title: 'Action',
              //   description: 'Card action for the choice',
              //   type: 'object',
              //   additionalProperties: true,
              // },
              synonyms: {
                type: 'array',
                title: 'Synonyms',
                description: 'An optional list of synonyms that can be used to select this choice.',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
        appendChoices: {
          type: 'boolean',
          title: 'Append Choices',
          description: 'If set, the activity will automatically include choices in the specified format.',
          default: true,
        },
        defaultLocale: {
          type: 'string',
          title: 'Default Locale',
          description: 'The language setting that will be used to interpret input and generate choices.',
          default: 'en-us',
        },
        style: {
          type: 'string',
          enum: ['None', 'Auto', 'Inline', 'List', 'SuggestedAction', 'HeroCard'],
          title: 'List Style',
          description: 'Specify how the choices will appear in the message.',
          default: 'Auto',
        },
        choiceOptions: {
          type: 'object',
          title: 'Formatting Options',
          properties: {
            inlineSeparator: {
              type: 'string',
              title: 'Inline Separator',
              description: 'The character to use to separate individual choices when there are more than two choices.',
              default: ', ',
            },
            inlineOr: {
              type: 'string',
              title: 'Inline Or',
              description: 'Separator inserted between the choices when there are only two choices.',
              default: ' or ',
            },
            inlineOrMore: {
              type: 'string',
              title: 'Inline OrMore',
              description: 'Separator inserted between the last 2 choices when there are more than 2 choices.',
              default: ', or ',
            },
            includeNumbers: {
              type: 'boolean',
              title: 'Include Numbers',
              description: 'If set, choices will be prefixed with a number.',
              default: true,
            },
          },
        },
        recognizerOptions: {
          type: 'object',
          title: 'Recognizer Options',
          properties: {
            noValue: {
              type: 'boolean',
              title: 'No value',
              description: 'If set, the bot will not use the "value" setting as a valid choice.',
              default: false,
            },
            // TODO: re-enable this when we re-enable the action field in choices
            // noAction: {
            //   type: 'boolean',
            //   title: 'No Action',
            //   description: 'If set, the the choices action.title field will NOT be searched over',
            //   default: false,
            // },
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
    'Microsoft.ConfirmInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'ConfirmInput Dialog',
      description: 'This is a prompt that gathers yes/no responses from the customer.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory used to store customer input.',
          examples: ['turn.birthday', 'user.name'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['turn.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
          description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial Prompt',
          description: 'The first message to send as a prompt for this value.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: "The message to send if no valid choice is found in the customer's response.",
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: "The message to send if the customer's response fails the validation rules.",
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The maximum number of times this prompt will be presented.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Rules',
          description:
            'These are expressions used to validate the customer response. The response is considered invalid if any of these evaluate to false.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'An expression used to validate customer input.',
          },
        },
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'The expression that you evaluated for input.',
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: 'Value to return if max turn count is reached.',
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always Prompt',
          description: 'If set, this will always prompt the customer even if the value is already known.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set, this prompt will allow interruptions.',
          default: false,
          examples: [true],
        },
        defaultLocale: {
          type: 'string',
          title: 'Default Locale',
          description: 'The language setting that will be used to interpret input and generate choices.',
          default: 'en-us',
        },
        style: {
          type: 'string',
          enum: ['None', 'Auto', 'Inline', 'List', 'SuggestedAction', 'HeroCard'],
          title: 'List Style',
          description: 'The kind of choice list style to generate',
          default: 'Auto',
        },
        choiceOptions: {
          type: 'object',
          title: 'Formatting Options',
          properties: {
            inlineSeparator: {
              type: 'string',
              title: 'Inline Separator',
              description: 'The character to use to separate individual choices when there are more than two choices.',
              default: ', ',
            },
            inlineOr: {
              type: 'string',
              title: 'Inline Or',
              description: 'Separator inserted between the choices when there are only two choices.',
              default: ' or ',
            },
            inlineOrMore: {
              type: 'string',
              title: 'Inline OrMore',
              description: 'Separator inserted between the last 2 choices when there are more than 2 choices.',
              default: ', or ',
            },
            includeNumbers: {
              type: 'boolean',
              title: 'Include Numbers',
              description: 'If set, choices will be prefixed with a number.',
              default: true,
            },
          },
        },
        confirmChoices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
                description: 'The choice label and value that will be returned when selected.',
              },
              action: {
                title: 'Action',
                description: 'Card action for the choice',
                type: 'object',
                additionalProperties: true,
              },
              synonyms: {
                type: 'array',
                title: 'Synonyms',
                description: 'An optional list of synonyms that can be used to select this choice.',
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
    'Microsoft.DebugBreak': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Debugger Break Step',
      description: 'If the debugger is attached, do a debugger break at this point',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'This defines the valid properties for the component being configured (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.DebugBreak',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
      },
      additionalProperties: false,
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
    'Microsoft.DeleteProperty': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Delete PropertyS',
      description: 'Remove a property from memory.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory to delete.',
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
      description: 'This lets you add or remove items from an array in the memory of the bot.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        changeType: {
          type: 'string',
          title: 'Change Type',
          description: 'This specifies which operation to perform in the array, like adding or removing an item.',
          enum: ['Push', 'Pop', 'Take', 'Remove', 'Clear'],
        },
        arrayProperty: {
          $role: 'memoryPath',
          type: 'string',
          title: 'Array Property',
          description: 'Property in memory containing the array to manipulate.',
        },
        resultProperty: {
          $role: 'memoryPath',
          type: 'string',
          title: 'Result Property',
          description: 'Property in memory where the result of this action will be stored.',
        },
        value: {
          $role: 'expression',
          type: 'string',
          title: 'Value of the Item',
          description: 'Expression or property in memory that contains the item to add or remove.',
          examples: ['dialog.todo'],
        },
      },
      additionalProperties: false,
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
    'Microsoft.EditSteps': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'EditSteps',
      description: 'This provides a mechanism to edit the content of the current dialog at run time.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file).',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.EditSteps',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        changeType: {
          type: 'string',
          title: 'Change Type',
          description: 'Specify the type of change to apply to this dialog.',
          enum: ['InsertSteps', 'InsertStepsBeforeTags', 'AppendSteps', 'EndSequence', 'ReplaceSequence'],
        },
        steps: {
          type: 'array',
          title: 'Actions',
          description: 'These new actions will be applied bas.',
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
    'Microsoft.EmitEvent': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Emit Event Step',
      description: 'Emit a custom event.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        eventName: {
          title: 'Event Name',
          description: 'The name of the event to emit.',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        eventValue: {
          type: 'object',
          title: 'Event Value',
          description: 'An optional value to include in the custom event.',
          additionalProperties: true,
        },
        bubbleEvent: {
          type: 'boolean',
          title: 'Bubble Event',
          description: 'If set, this event will propagate to parent dialogs.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Return Value',
          description: 'The property in memory that is returned to the parent dialog.',
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
      description: 'End the current turn without ending the dialog, causing the bot to pause for additional input.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
      description: 'Defines actions the bot will take in response to an event.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        constraint: {
          $role: 'expression',
          title: 'Constraint',
          description:
            'An optional expression containing additional requirements which must be met for this event to fire.',
          examples: ['user.vip == true'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Actions',
          description: 'These are the steps the bot will be execute when this event fires.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        events: {
          title: 'Events',
          type: 'array',
          description: 'Select the types of event that will trigger this handler.',
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
    'Microsoft.Foreach': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Foreach Step',
      description: 'Step which execute steps per item in a collection',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.Foreach',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        listProperty: {
          $role: 'expression',
          title: 'List Property',
          description: 'An expression or property in memory that evaluates to a list of items.',
          examples: ['user.todoList'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Actions',
          description: 'These steps will be executed for each item in the list.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        indexProperty: {
          $role: 'memoryPath',
          title: 'Index Property',
          description: 'The property in memory that contains the index of the current item.',
          default: 'dialog.index',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        valueProperty: {
          $role: 'memoryPath',
          title: 'Value Property',
          description: 'The property in memory that will contain the value of the current item.',
          default: 'dialog.value',
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
    'Microsoft.ForeachPage': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Foreach Page Step',
      description: 'Step which execute steps per item page in a list.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.ForeachPage',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        listProperty: {
          $role: 'expression',
          title: 'List Property',
          description: 'An expression or property in memory that evaluates to a list of items.',
          examples: ['user.todoList'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Actions',
          description: 'These steps will be executed for each page of data in the list.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        pageSize: {
          type: 'integer',
          title: 'Page Size',
          description: 'The number of items to include in each page.',
          default: 10,
        },
        valueProperty: {
          $role: 'memoryPath',
          title: 'Value Property',
          description: 'The property in memory containing the current set of items.',
          default: 'dialog.value',
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
    'Microsoft.HttpRequest': {
      $role: 'unionType(Microsoft.IDialog)',
      type: 'object',
      title: 'HTTP Request',
      description: 'This is a step which makes a call to an external HTTP resource.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        method: {
          type: 'string',
          title: 'Method',
          description: 'The HTTP method to use.',
          enum: ['GET', 'POST'],
          examples: ['GET', 'POST'],
        },
        url: {
          type: 'string',
          title: 'URL',
          description: 'The url to call. This may reference properties in memory as {property.name}.',
          examples: ['https://contoso.com'],
        },
        body: {
          type: 'object',
          title: 'Body',
          description: 'The body of the HTTP request. This may reference properties in memory as {property.name}.',
          additionalProperties: true,
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory used to store the result of the HTTP call.',
          examples: ['dialog.contosodata'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        headers: {
          type: 'object',
          additionalProperties: true,
          title: 'HTTP Headers',
          description:
            'Additional headers to include with the HTTP request. This may reference properties in memory as {property.name}.',
        },
        responseTypes: {
          type: 'string',
          title: 'Expected Response Type',
          description:
            'This specifies the method used to parse the response from the HTTP request. If Activity or Activities, the results will be forwarded immediately to the customer as messages.',
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
      description: 'String used for language generation',
    },
    'Microsoft.IDialog': {
      title: 'Microsoft IDialog',
      description: 'Union of components which implement the IDialog interface',
      $role: 'unionType',
      oneOf: [
        {
          title: 'Microsoft.AdaptiveDialog',
          description: 'Configures a data driven dialog via a collection of steps/dialogs.',
          $ref: '#/definitions/Microsoft.AdaptiveDialog',
        },
        {
          title: 'Microsoft.AttachmentInput',
          description: 'This represents a dialog which gathers a yes/no style responses',
          $ref: '#/definitions/Microsoft.AttachmentInput',
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
        {
          title: 'Microsoft.DebugBreak',
          description: 'If debugger is attached, do a debugger break at this point',
          $ref: '#/definitions/Microsoft.DebugBreak',
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
          title: 'Microsoft.EditSteps',
          description: 'Edit current dialog with changeType and Steps',
          $ref: '#/definitions/Microsoft.EditSteps',
        },
        {
          title: 'Microsoft.EmitEvent',
          description: 'This is the action that allows you to emit an event.',
          $ref: '#/definitions/Microsoft.EmitEvent',
        },
        {
          title: 'Microsoft.EndDialog',
          description:
            'This is the command that ends the current dialog running, and returns the resultProperty as a result of that dialog.',
          $ref: '#/definitions/Microsoft.EndDialog',
        },
        {
          title: 'Microsoft.EndTurn',
          description: 'This will end the current turn without ending the dialog.',
          $ref: '#/definitions/Microsoft.EndTurn',
        },
        {
          title: 'Microsoft.Foreach',
          description: 'Step which executes steps per item in a collection.',
          $ref: '#/definitions/Microsoft.Foreach',
        },
        {
          title: 'Microsoft.ForeachPage',
          description: 'Step which execute steps per item page in a collection.',
          $ref: '#/definitions/Microsoft.ForeachPage',
        },
        {
          title: 'Microsoft.HttpRequest',
          description: 'This action replaces the current dialog with a target dialog, which is a request for a URL.',
          $ref: '#/definitions/Microsoft.HttpRequest',
        },
        {
          title: 'Microsoft.IfCondition',
          description:
            'The action that conditionally decides which step to execute next in the line up of actions needed.',
          $ref: '#/definitions/Microsoft.IfCondition',
        },
        {
          title: 'Microsoft.InitProperty',
          description: 'This action lets you initialize a property to either an object or array.',
          $ref: '#/definitions/Microsoft.InitProperty',
        },
        {
          title: 'Microsoft.LogStep',
          description:
            'This is a step which writes to console.log and optionally creates a TraceActivity around a text binding',
          $ref: '#/definitions/Microsoft.LogStep',
        },
        {
          title: 'Microsoft.NumberInput',
          description: 'This prompts the customer to provide a number.',
          $ref: '#/definitions/Microsoft.NumberInput',
        },
        {
          title: 'Microsoft.OAuthInput',
          description: 'This represents a dialog which gathers a decimal number in a specified range',
          $ref: '#/definitions/Microsoft.OAuthInput',
        },
        {
          title: 'Microsoft.RepeatDialog',
          description: 'An action that repeats the current dialog running.',
          $ref: '#/definitions/Microsoft.RepeatDialog',
        },
        {
          title: 'Microsoft.ReplaceDialog',
          description: 'An action that replaces the current dialog running with a target dialog',
          $ref: '#/definitions/Microsoft.ReplaceDialog',
        },
        {
          title: 'Microsoft.SendActivity',
          description: 'This will send a message to the user and may include language generation rules.',
          $ref: '#/definitions/Microsoft.SendActivity',
        },
        {
          title: 'Microsoft.SetProperty',
          description: 'This will set or update a property to the value of an expression.',
          $ref: '#/definitions/Microsoft.SetProperty',
        },
        {
          title: 'Microsoft.SwitchCondition',
          description: 'This is an action that decides which action to execute next, depending on certain conditions.',
          $ref: '#/definitions/Microsoft.SwitchCondition',
        },
        {
          title: 'Microsoft.TextInput',
          description: 'A prompt to the customer to provide a response in text format.',
          $ref: '#/definitions/Microsoft.TextInput',
        },
        {
          title: 'Microsoft.TraceActivity',
          description: 'This is a debugging message that is used to track progress through the code.',
          $ref: '#/definitions/Microsoft.TraceActivity',
        },
        {
          type: 'string',
          title: 'string',
        },
      ],
    },
    'Microsoft.ILanguageGenerator': {
      title: 'Microsoft ILanguageGenerator',
      description: 'Union of components which implement the ILanguageGenerator interface',
      $role: 'unionType',
      oneOf: [
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
          type: 'string',
        },
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
          description: 'A Recognizer that uses regex expressions to generate intents and entities.',
          $ref: '#/definitions/Microsoft.RegexRecognizer',
        },
        {
          type: 'string',
          title: 'string',
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
          description: 'This defines a rule for an event that is triggered by some source',
          $ref: '#/definitions/Microsoft.EventRule',
        },
        {
          title: 'Microsoft.IntentRule',
          description: 'This defines the actions to take when an Intent is recognized (and optionally entities)',
          $ref: '#/definitions/Microsoft.IntentRule',
        },
        {
          title: 'Microsoft.Rule',
          description: 'Defines a rule for an event which is triggered by some source',
          $ref: '#/definitions/Microsoft.Rule',
        },
        {
          title: 'Microsoft.UnknownIntentRule',
          description: 'Defines a sequence of actions to take if there is no other trigger or plan operating',
          $ref: '#/definitions/Microsoft.UnknownIntentRule',
        },
      ],
    },
    'Microsoft.IRuleSelector': {
      title: 'Microsoft IRuleSelector',
      description: 'Union of components which implement the IRuleSelector interface',
      $role: 'unionType',
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
      description:
        'This is an action that tests a boolean expression and executes one of two alternate branches of the dialog.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'A boolean expression used to choose a branch.',
          examples: ['user.age > 3'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Actions: True Branch',
          description: 'Steps to execute if the condition evalutes to true.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        elseSteps: {
          type: 'array',
          title: 'Actions: False Branch',
          description: 'Steps to execute if the condition evalutes to false.',
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
      description: 'Create a new property to hold an object or array.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'A property in memory.',
          examples: ['user.age'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        type: {
          type: 'string',
          title: 'Type',
          description: 'The type of value this property will contain: an object or an array.',
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
    'Microsoft.IntentRule': {
      $role: 'unionType(Microsoft.IRule)',
      title: 'Intent Rule',
      description:
        'Defines the actions to take when an intent is identified by a recognizer service such as RegEx, or LUIS.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        constraint: {
          $role: 'expression',
          title: 'Constraint',
          description:
            'An optional expression containing additional requirements which must be met for this event to fire.',
          examples: ['user.vip == true'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Actions',
          description: 'These are the steps the bot will be execute when this event fires.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        intent: {
          type: 'string',
          title: 'Intent',
          description: 'The name of the intent that, when identified by a recognizer, causes this event to fire.',
        },
        entities: {
          type: 'array',
          title: 'Entities',
          description: 'A list of any entities that must be found by the recognizer in order for this event to fire.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
        "This is a debugging message that's used to track progress through the code by writing messages to the log.",
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        text: {
          type: 'string',
          title: 'Text',
          description: 'This is the text to write to the log.  It may include language generation rules.',
        },
        traceActivity: {
          type: 'boolean',
          title: 'Send TraceActivity',
          description: 'If set, also create a TraceActivity with then same log text.',
          default: false,
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
          description: 'Extra information for the Bot Framework Composer.',
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
    //       description: 'Extra information for the Bot Framework Composer.',
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
      description: 'This prompts the customer to provide a number.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory used to store customer input.',
          examples: ['turn.birthday', 'user.name'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['turn.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
          description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial Prompt',
          description: 'The first message to send as a prompt for this value.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: "The message to send if no number is found in the customer's response.",
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: "The message to send if the customer's response fails the validation rules.",
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The maximum number of times this prompt will be presented.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Rules',
          description:
            'These are expressions used to validate the customer response. The response is considered invalid if any of these evaluate to false.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'An expression used to validate customer input.',
          },
        },
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'The expression that you evaluated for input.',
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: 'Value to return if max turn count is reached.',
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always Prompt',
          description: 'If set, this will always prompt the customer even if the value is already known.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set, this prompt will allow interruptions.',
          default: false,
          examples: [true],
        },
        outputFormat: {
          type: 'string',
          enum: ['float', 'integer'],
          title: 'Output Format',
          description: 'The format of the final value.',
          default: 'float',
        },
        defaultLocale: {
          type: 'string',
          title: 'Default Locale',
          description: 'The language setting that will be used to interpret input.',
          default: 'en-us',
        },
      },
      additionalProperties: false,
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
    'Microsoft.OAuthInput': {
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
          const: 'Microsoft.OAuthInput',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory used to store customer input.',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['turn.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
          description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        connectionName: {
          type: 'string',
          title: 'Connection Name',
          description: 'The connection name set in Azure.',
          examples: ['msgraphconnection'],
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
          description: 'Extra information for the Bot Framework Composer.',
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
      description: 'Repeat the current dialog.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
      description: 'Ends the current dialog and replaces it with a different one.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog',
          description: 'Select a dialog to call at this point.',
          type: 'string',
        },
        options: {
          type: 'object',
          title: 'Options',
          description:
            'Define options to pass to this dialog. These will be available in the child dialog as dialog.options.<name>.',
          additionalProperties: true,
        },
        property: {
          $role: 'memoryPath',
          description: 'The property in memory used to store the result of the child dialog.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        constraint: {
          $role: 'expression',
          title: 'Constraint',
          description:
            'An optional expression containing additional requirements which must be met for this event to fire.',
          examples: ['user.vip == true'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Actions',
          description: 'These are the steps the bot will be execute when this event fires.',
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
    'Microsoft.SendActivity': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Send Activity Step',
      description: 'This will send a message to the user.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        activity: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Activity',
          description: 'This is the message to sent to the customer. It may include language generation rules.',
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
      description: 'Set a property in memory to the value of an expression.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory to set.',
          examples: ['user.age'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'This is the expression that will be evaluated to set the property.',
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
      description:
        'This is an action that evaluates an expression and executes one of multiple alternate branches of the dialog.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'The expression used to choose a branch.',
          examples: ['user.age > 3'],
          type: 'string',
        },
        cases: {
          type: 'array',
          title: 'Cases',
          description: 'If the conditional expression matches this case, the following actions will be executed.',
          items: {
            type: 'object',
            properties: {
              value: {
                $role: 'expression',
                title: 'Value',
                description: 'Value to match against condition.',
                type: 'string',
              },
              steps: {
                type: 'array',
                title: 'Actions',
                description: 'Steps to execute if this case matches the condition.',
                items: {
                  $type: 'Microsoft.IDialog',
                  $ref: '#/defintions/Microsoft.IDialog',
                },
              },
            },
            required: ['value', 'case'],
          },
        },
        default: {
          type: 'array',
          title: 'Default Branch',
          description: 'Steps to execute if no case matches the condition.',
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
      description: 'A prompt to the customer to provide a response in text format.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The property in memory used to store customer input.',
          examples: ['turn.birthday', 'user.name'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['turn.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
          description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
          examples: ['turn.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial Prompt',
          description: 'The first message to send as a prompt for this value.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: "The message to send if the customer's response is blank.",
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: "The message to send if the customer's response fails the validation rules.",
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The maximum number of times this prompt will be presented.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Rules',
          description:
            'These are expressions used to validate the customer response. The response is considered invalid if any of these evaluate to false.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'An expression used to validate customer input.',
          },
        },
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'The expression that you evaluated for input.',
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: 'Value to return if max turn count is reached.',
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always Prompt',
          description: 'If set, this will always prompt the customer even if the value is already known.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set, this prompt will allow interruptions.',
          default: false,
          examples: [true],
        },
        outputFormat: {
          type: 'string',
          enum: ['none', 'trim', 'lowercase', 'uppercase'],
          title: 'Output Format',
          description: 'The format of the final value.',
          default: 'none',
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
      description:
        "This is a debugging message that's used to track progress through the code by emitting events visible in the emulator.",
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        name: {
          type: 'string',
          title: 'Name',
          description: 'Name of the trace activity.',
        },
        valueType: {
          type: 'string',
          title: 'Value Type',
          description: 'Value type of the trace activity.',
        },
        value: {
          $role: 'memoryPath',
          title: 'Value',
          description: 'This is the property in memory that contains the value of the trace activity.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        constraint: {
          $role: 'expression',
          title: 'Constraint',
          description:
            'An optional expression containing additional requirements which must be met for this event to fire.',
          examples: ['user.vip == true'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Actions',
          description: 'These are the steps the bot will be execute when this event fires.',
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
