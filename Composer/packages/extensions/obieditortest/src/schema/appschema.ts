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
  description: 'These are all of the types that can be created by the loader.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
          examples: ['value.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['value.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
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
    'Microsoft.AttachmentInput': {
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
          description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
          examples: ['value.birthday', 'user.name'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['value.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
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
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: 'The message to send if the last input is not recognized.',
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: 'The message to send to when then input was not valid for the input type.',
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Expressions',
          description: 'Expressions to validate an input.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
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
          description:
            'If set to true this will always prompt the user regardless if you already have the value or not.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set to true this will always consult the parent dialog whether it will be interupt or not.',
          default: false,
          examples: [true],
        },
        outputFormat: {
          type: 'string',
          enum: ['all', 'first'],
          title: 'Output Format',
          description: 'The attachment output format.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog',
          description: 'This is the dialog to call.',
          type: 'string',
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
      description: 'This represents a dialog which gathers a choice response',
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
              additionalProperties: true,
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
          examples: ['value.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['value.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
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
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: 'The message to send if the last input is not recognized.',
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: 'The message to send to when then input was not valid for the input type.',
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Expressions',
          description: 'Expressions to validate an input.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
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
          description:
            'If set to true this will always prompt the user regardless if you already have the value or not.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set to true this will always consult the parent dialog whether it will be interupt or not',
          default: true,
          examples: [true],
        },
        outputFormat: {
          type: 'string',
          enum: ['value', 'index'],
          title: 'Output Format',
          description: 'The output format.',
          default: 'value',
        },
        choices: {
          title: 'Choices',
          type: 'array',
          items: {
            title: 'Choice',
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
                description: 'the value to return when selected.',
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
                description: 'the list of synonyms to recognize in addition to the value. This is optional.',
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
          description: 'Compose an output activity containing a set of choices',
          default: true,
        },
        defaultLocale: {
          type: 'string',
          title: 'Default Locale',
          description: 'The prompts default locale that should be recognized.',
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
          title: 'Choice Options',
          properties: {
            inlineSeparator: {
              type: 'string',
              title: 'Inline Seperator',
              description: 'Character used to separate individual choices when there are more than 2 choices',
              default: ', ',
            },
            inlineOr: {
              type: 'string',
              title: 'Inline Or',
              description: 'Separator inserted between the choices when their are only 2 choices',
              default: ' or ',
            },
            inlineOrMore: {
              type: 'string',
              title: 'Inline OrMore',
              description: 'Separator inserted between the last 2 choices when their are more than 2 choices.',
              default: ', or ',
            },
            includeNumbers: {
              type: 'boolean',
              title: 'Include Numbers',
              description: 'if true, inline and list style choices will be prefixed with the index of the choice.',
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
              title: 'No Value',
              description: 'If true, the choices value field will NOT be search over',
              default: false,
            },
            noAction: {
              type: 'boolean',
              title: 'No Action',
              description: 'If true, the the choices action.title field will NOT be searched over',
              default: false,
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
          examples: ['value.birthday', 'user.name'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['value.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
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
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: 'The message to send if the last input is not recognized.',
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: 'The message to send to when then input was not valid for the input type.',
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Expressions',
          description: 'Expressions to validate an input.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
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
          description:
            'If set to true this will always prompt the user regardless if you already have the value or not.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set to true this will always consult the parent dialog whether it will be interupt or not.',
          default: false,
          examples: [true],
        },
        defaultLocale: {
          type: 'string',
          title: 'Default Locale',
          description: 'The prompts default locale that should be recognized.',
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
          properties: {
            inlineSeparator: {
              type: 'string',
              title: 'Inline Seperator',
              description: 'Character used to separate individual choices when there are more than 2 choices',
              default: ', ',
            },
            inlineOr: {
              type: 'string',
              title: 'Inline Or',
              description: 'Separator inserted between the choices when their are only 2 choices',
              default: ' or ',
            },
            inlineOrMore: {
              type: 'string',
              title: 'Inline OrMore',
              description: 'Separator inserted between the last 2 choices when their are more than 2 choices.',
              default: ', or ',
            },
            includeNumbers: {
              type: 'boolean',
              title: 'Include Numbers',
              description: 'if true, inline and list style choices will be prefixed with the index of the choice.',
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
                description: 'the value to return when selected.',
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
    'Microsoft.DebugBreak': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Debugger Break Step',
      description: 'If debugger is attached, do a debugger break at this point',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'The Memory property path to delete.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        changeType: {
          type: 'string',
          title: 'Change Type',
          description: 'The array operation to perform.',
          enum: ['Push', 'Pop', 'Take', 'Remove', 'Clear'],
        },
        arrayProperty: {
          $role: 'memoryPath',
          type: 'string',
          title: 'Array Property',
          description: 'Memory expression of the array to manipulate.',
        },
        resultProperty: {
          $role: 'memoryPath',
          type: 'string',
          title: 'Result Property',
          description: 'Memory expression of the result of this action.',
        },
        value: {
          $role: 'expression',
          type: 'string',
          title: 'Value of the Item',
          description: 'Expression to evaluate.',
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
      title: 'EditSteps Step',
      description: 'Edit current dialog with changeType and Steps.',
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
          description: 'The change type to apply to current dialog',
          enum: ['InsertSteps', 'InsertStepsBeforeTags', 'AppendSteps', 'EndSequence', 'ReplaceSequence'],
        },
        steps: {
          type: 'array',
          title: 'Steps',
          description: 'Steps to execute.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        eventName: {
          title: 'Event Name',
          description: 'The name of event to emit.',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        eventValue: {
          type: 'object',
          title: 'Event Value',
          description: 'Optional value to emit along with the event.',
          additionalProperties: true,
        },
        bubbleEvent: {
          type: 'boolean',
          title: 'Bubble Event',
          description: 'If true this event should propagate to parent dialogs.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
          title: 'ListProperty',
          description: 'Expression to evaluate.',
          examples: ['user.todoList'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Steps',
          description: 'Steps to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        indexProperty: {
          $role: 'memoryPath',
          title: 'Index Property',
          description: 'The memory path which refers to the index of the item',
          default: 'dialog.index',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        valueProperty: {
          $role: 'memoryPath',
          title: 'Value Property',
          description: 'The memory path which refers to the value of the item',
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
      description: 'Step which execute steps per item page in a collection.',
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
          title: 'ListProperty',
          description: 'Expression to evaluate.',
          examples: ['user.todoList'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Steps',
          description: 'Steps to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        pageSize: {
          type: 'integer',
          title: 'Page Size',
          description: 'The page size',
          default: 10,
        },
        valueProperty: {
          $role: 'memoryPath',
          title: 'Value Property',
          description: 'The memory path which refers to the value of the item',
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
          description: 'Extra information for the Bot Framework Composer.',
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
        headers: {
          type: 'object',
          additionalProperties: true,
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
          description: 'This step allows you to innitial a property to either an object or array',
          $ref: '#/definitions/Microsoft.InitProperty',
        },
        {
          title: 'Microsoft.LogStep',
          description:
            'This is a step which writes to console.log and optional creates a TraceActivity around a text binding',
          $ref: '#/definitions/Microsoft.LogStep',
        },
        {
          title: 'Microsoft.NumberInput',
          description: 'This represents a dialog which gathers a decimal number in a specified range',
          $ref: '#/definitions/Microsoft.NumberInput',
        },
        {
          title: 'Microsoft.OAuthInput',
          description: 'This represents a dialog which gathers a decimal number in a specified range',
          $ref: '#/definitions/Microsoft.OAuthInput',
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
          description: 'Recognizer which uses regex expressions to generate intents and entities.',
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
      description: 'Step which conditionally decides which step to execute next',
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
          description: 'Expression to evaluate',
          examples: ['user.age > 3'],
          type: 'string',
        },
        steps: {
          type: 'array',
          title: 'Steps',
          description: 'Steps to execute if condition is true',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        elseSteps: {
          type: 'array',
          title: 'Else Steps',
          description: 'Steps to execute if condition is false',
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
          description: 'Extra information for the Bot Framework Composer.',
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
          description: 'Type of value to set the property to, object or array',
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
          description: 'Extra information for the Bot Framework Composer.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
          examples: ['value.birthday', 'user.name'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['value.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
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
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: 'The message to send if the last input is not recognized.',
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: 'The message to send to when then input was not valid for the input type.',
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Expressions',
          description: 'Expressions to validate an input.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
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
          description:
            'If set to true this will always prompt the user regardless if you already have the value or not.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set to true this will always consult the parent dialog whether it will be interupt or not.',
          default: false,
          examples: [true],
        },
        outputFormat: {
          type: 'string',
          enum: ['float', 'integer'],
          title: 'Output Format',
          description: 'The NumberInput output format.',
          default: 'float',
        },
        defaultLocale: {
          type: 'string',
          title: 'Default Locale',
          description: 'The prompts default locale that should be recognized.',
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
          description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
          examples: ['value.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['value.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
          description: 'This is the property which the EndDialog(result) will be set to when EndDialog() is called',
          examples: ['value.birthday'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        connectionName: {
          type: 'string',
          title: 'Connection Name',
          description: 'The connection name set in Azure',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog',
          description: 'This is the dialog to switch to.',
          type: 'string',
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
          description: 'Extra information for the Bot Framework Composer.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
          description: 'Cases to evaluate against condition',
          items: {
            type: 'object',
            properties: {
              value: {
                $role: 'expression',
                title: 'Value',
                description: 'Value which must match the condition property',
                type: 'string',
              },
              steps: {
                type: 'array',
                title: 'Steps',
                description: 'Steps to execute if case is equal to condition',
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
          description: 'Extra information for the Bot Framework Composer.',
        },
        property: {
          $role: 'memoryPath',
          title: 'Property',
          description: 'This is that will be passed in as InputProperty and also set as the OutputProperty',
          examples: ['value.birthday', 'user.name'],
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
        },
        inputBindings: {
          type: 'object',
          title: 'Input Bindings',
          description: 'This defines properties which be passed as arguments to this dialog',
          examples: ['value.birthday'],
          additionalProperties: {
            type: 'string',
          },
        },
        outputBinding: {
          $role: 'memoryPath',
          title: 'Output Property binding',
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
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized Prompt',
          description: 'The message to send if the last input is not recognized.',
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid Prompt',
          description: 'The message to send to when then input was not valid for the input type.',
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 0,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Expressions',
          description: 'Expressions to validate an input.',
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
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
          description:
            'If set to true this will always prompt the user regardless if you already have the value or not.',
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          type: 'boolean',
          title: 'Allow Interruptions',
          description: 'If set to true this will always consult the parent dialog whether it will be interupt or not.',
          default: false,
          examples: [true],
        },
        outputFormat: {
          type: 'string',
          enum: ['none', 'trim', 'lowercase', 'uppercase'],
          title: 'Output Format',
          description: 'The TextInput output format.',
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
          description: 'Extra information for the Bot Framework Composer.',
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
        value: {
          $role: 'memoryPath',
          title: 'Value',
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
