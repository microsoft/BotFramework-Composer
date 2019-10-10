import { JSONSchema6 } from 'json-schema';

export const FIELDS_TO_HIDE = [
  '$id',
  '$type',
  '$copy',
  '$designer',
  'inputBindings',
  'outputBinding',
  'selector',
  'id',
  'tags',
];

/** Types that can be represented by a sub tree in the graph */
export const COMPOUND_TYPES = [
  'Microsoft.AdaptiveDialog',
  'Microsoft.OnEvent',
  'Microsoft.OnIntent',
  'Microsoft.OnUnknownIntent',
  'Microsoft.OnConversationUpdateActivity',
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
      description: 'Configures a data driven dialog via a collection of actions/dialogs.',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
            'If this is true the dialog will automatically end when there are no more actions to run.  If this is false it is the responsbility of the author to call EndDialog at an appropriate time.',
          default: 'true',
        },
        defaultResultProperty: {
          type: 'string',
          title: 'Default Result Property',
          description:
            'Property path to the memory to return as the result of this dialog ending because AutoEndDialog is true and there are no more actions to execute.',
          default: 'dialog.result',
        },
        recognizer: {
          $type: 'Microsoft.IRecognizer',
          title: 'Recognizer',
          description: 'Configured recognizer to generate intent and entites from user utterance',
          $ref: '#/definitions/Microsoft.IRecognizer',
        },
        generator: {
          $type: 'Microsoft.ILanguageGenerator',
          title: 'Language Generator',
          description: 'Language generator to use for this dialog. (aka: LG file)',
          $ref: '#/definitions/Microsoft.ILanguageGenerator',
        },
        // selector: {
        //   $type: 'Microsoft.IEventSelector',
        //   title: 'Selector',
        //   description: 'Policy for how to select rule to execute next',
        //   $ref: '#/definitions/Microsoft.IEventSelector',
        // },
        events: {
          type: 'array',
          description: 'Events to use to evaluate conversation',
          items: {
            $type: 'Microsoft.IOnEvent',
            $ref: '#/definitions/Microsoft.IOnEvent',
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
    'Microsoft.AgeEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Age Entity Recognizer',
      description: 'Recognizer which recognizes age.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.AgeEntityRecognizer',
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
    'Microsoft.AttachmentInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'AttachmentInput Dialog',
      description: 'This represents a dialog which gathers an attachment such as image or music',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default Value Response',
          description:
            'The message to send to when max turn count has been exceeded and the default value is selected as the value.',
          examples: [
            "I didn't understand your responses, so I will just use the default value of 10.  Let me know if you want to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 3,
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
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property that this input dialog is bound to',
          examples: ['$birthday'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: "Value to return if the value expression can't be evaluated.",
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
          type: 'string',
          enum: ['always', 'never', 'notRecognized'],
          title: 'Allow Interruptions',
          description:
            "Always will always consult parent dialogs first, never will not consult parent dialogs, notRecognized will consult parent only when it's not recognized",
          default: 'notRecognized',
          examples: ['notRecognized'],
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
      description: 'Action which begins another dialog (and when that dialog is done, it will return the caller).',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog',
          description: 'This is the dialog to call.',
          type: 'string',
        },
        options: {
          type: 'object',
          title: 'Options binding',
          description: 'Bindings to configure the options object to pass to the dialog.',
          additionalProperties: {
            type: 'string',
            title: 'Options',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'The property to bind to the dialog and store the result in',
          examples: ['user.name'],
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        eventName: {
          title: 'Event Name',
          description: 'The name of event to emit',
          type: 'string',
        },
        eventValue: {
          type: 'object',
          title: 'Event Value',
          description: 'Optional value to emit along with the event',
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
        cardAction: {
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default Value Response',
          description:
            'The message to send to when max turn count has been exceeded and the default value is selected as the value.',
          examples: [
            "I didn't understand your responses, so I will just use the default value of 10.  Let me know if you want to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 3,
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
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property that this input dialog is bound to',
          examples: ['$birthday'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: "Value to return if the value expression can't be evaluated.",
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
          type: 'string',
          enum: ['always', 'never', 'notRecognized'],
          title: 'Allow Interruptions',
          description:
            "Always will always consult parent dialogs first, never will not consult parent dialogs, notRecognized will consult parent only when it's not recognized",
          default: 'notRecognized',
          examples: ['notRecognized'],
        },
        outputFormat: {
          type: 'string',
          enum: ['value', 'index'],
          title: 'Output Format',
          description: 'The output format.',
          default: 'value',
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
              // action: {
              //   title: 'Action',
              //   description: 'Card action for the choice',
              //   type: 'object',
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
          default: 'true',
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
              description: 'If true, inline and list style choices will be prefixed with the index of the choice.',
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
            // noAction: {
            //   type: 'boolean',
            //   title: 'No Action',
            //   description: 'If true, the the choices action.title field will NOT be searched over',
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
      description: 'This represents a dialog which gathers a yes/no style responses',
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
              description: 'The list of synonyms to recognize in addition to the value. This is optional.',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default Value Response',
          description:
            'The message to send to when max turn count has been exceeded and the default value is selected as the value.',
          examples: [
            "I didn't understand your responses, so I will just use the default value of 10.  Let me know if you want to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 3,
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
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property that this input dialog is bound to',
          examples: ['$birthday'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: "Value to return if the value expression can't be evaluated.",
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
          type: 'string',
          enum: ['always', 'never', 'notRecognized'],
          title: 'Allow Interruptions',
          description:
            "Always will always consult parent dialogs first, never will not consult parent dialogs, notRecognized will consult parent only when it's not recognized",
          default: 'notRecognized',
          examples: ['notRecognized'],
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
              description: 'If true, inline and list style choices will be prefixed with the index of the choice.',
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
              // action: {
              //   title: 'Action',
              //   description: 'Card action for the choice',
              //   type: 'object',
              // },
              synonyms: {
                type: 'array',
                title: 'Synonyms',
                description: 'The list of synonyms to recognize in addition to the value. This is optional.',
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
    'Microsoft.ConfirmationEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Confirmation Entity Recognizer',
      description: 'Recognizer which recognizes confirmation choices (yes/no).',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.ConfirmationEntityRecognizer',
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
    'Microsoft.CurrencyEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Currency Entity Recognizer',
      description: 'Recognizer which recognizes currency.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.CurrencyEntityRecognizer',
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
    'Microsoft.DateTimeEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'DateTime Entity Recognizer',
      description: 'Recognizer which recognizes dates and time fragments.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.DateTimeEntityRecognizer',
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
    'Microsoft.DateTimeInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'DateTimeInput Dialog',
      description: 'This represents a dialog which gathers Date or Time or DateTime from the user',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.DateTimeInput',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default Value Response',
          description:
            'The message to send to when max turn count has been exceeded and the default value is selected as the value.',
          examples: [
            "I didn't understand your responses, so I will just use the default value of 10.  Let me know if you want to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 3,
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
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property that this input dialog is bound to',
          examples: ['$birthday'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: "Value to return if the value expression can't be evaluated.",
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
          type: 'string',
          enum: ['always', 'never', 'notRecognized'],
          title: 'Allow Interruptions',
          description:
            "Always will always consult parent dialogs first, never will not consult parent dialogs, notRecognized will consult parent only when it's not recognized",
          default: 'notRecognized',
          examples: ['notRecognized'],
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
    'Microsoft.DebugBreak': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Debugger Break Action',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
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
    'Microsoft.DeleteProperty': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Delete Property',
      description: 'This is a action which allows you to remove a property from memory',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'The Memory property path to delete',
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
    'Microsoft.DimensionEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Dimension Entity Recognizer',
      description: 'Recognizer which recognizes dimension.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.DimensionEntityRecognizer',
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
    'Microsoft.EditActions': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'EditActions Action',
      description: 'Edit current dialog with changeType and Actions',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.EditActions',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        changeType: {
          type: 'string',
          title: 'Change Type',
          description: 'The change type to apply to current dialog',
          enum: ['InsertActions', 'InsertActionsBeforeTags', 'AppendActions', 'EndSequence', 'ReplaceSequence'],
        },
        actions: {
          type: 'array',
          title: 'Actions',
          description: 'Actions to execute',
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
    'Microsoft.EditArray': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Edit Array Action',
      description: 'This is a action which allows you to modify an array in memory',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        changeType: {
          type: 'string',
          title: 'Change Type',
          description: 'The array operation to perform',
          enum: ['Push', 'Pop', 'Take', 'Remove', 'Clear'],
        },
        arrayProperty: {
          $role: 'expression',
          title: 'Array Property',
          description: 'Memory expression of the array to manipulate.',
          type: 'string',
        },
        resultProperty: {
          $role: 'expression',
          title: 'Result Property',
          description: 'Memory expression of the result of this action.',
          type: 'string',
        },
        value: {
          $role: 'expression',
          title: 'Value of the Item',
          description: 'Expression to evaluate.',
          examples: ['dialog.todo'],
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
    'Microsoft.EmailEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Email Entity Recognizer',
      description: 'Recognizer which recognizes email.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.EmailEntityRecognizer',
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
    'Microsoft.EmitEvent': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Emit Event Action',
      description: 'This is a action which allows you to emit an event',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        eventName: {
          title: 'Event Name',
          description: 'The name of event to emit',
          type: 'string',
          // anyOf: [
          //   {
          //     enum: [
          //       'beginDialog',
          //       'resumeDialog',
          //       'repromptDialog',
          //       'cancelDialog',
          //       'endDialog',
          //       'activityReceived',
          //       'recognizedIntent',
          //       'unknownIntent',
          //       'actionsStarted',
          //       'actionsSaved',
          //       'actionsEnded',
          //       'actionsResumed',
          //     ],
          //   },
          //   {
          //     type: 'string',
          //   },
          // ],
        },
        eventValue: {
          type: 'object',
          title: 'Event Value',
          description: 'Optional value to emit along with the event',
          additionalProperties: true,
        },
        bubbleEvent: {
          type: 'boolean',
          title: 'Bubble Event',
          description: 'If true this event should propagate to parent dialogs',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        property: {
          $role: 'expression',
          description: 'Specifies a path to memory should be returned as the result to the calling dialog.',
          examples: ['dialog.name'],
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
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
    'Microsoft.EntityRecognizer': {
      $role: 'unionType',
      title: 'Entity Recognizer',
      description: 'Union of components which derive from EntityRecognizer abstract class.',
      type: 'object',
      oneOf: [
        {
          title: 'Microsoft.AgeEntityRecognizer',
          description: 'Recognizer which recognizes age.',
          $ref: '#/definitions/Microsoft.AgeEntityRecognizer',
        },
        {
          title: 'Microsoft.ConfirmationEntityRecognizer',
          description: 'Recognizer which recognizes confirmation choices (yes/no).',
          $ref: '#/definitions/Microsoft.ConfirmationEntityRecognizer',
        },
        {
          title: 'Microsoft.CurrencyEntityRecognizer',
          description: 'Recognizer which recognizes currency.',
          $ref: '#/definitions/Microsoft.CurrencyEntityRecognizer',
        },
        {
          title: 'Microsoft.DateTimeEntityRecognizer',
          description: 'Recognizer which recognizes dates and time fragments.',
          $ref: '#/definitions/Microsoft.DateTimeEntityRecognizer',
        },
        {
          title: 'Microsoft.DimensionEntityRecognizer',
          description: 'Recognizer which recognizes dimension.',
          $ref: '#/definitions/Microsoft.DimensionEntityRecognizer',
        },
        {
          title: 'Microsoft.EmailEntityRecognizer',
          description: 'Recognizer which recognizes email.',
          $ref: '#/definitions/Microsoft.EmailEntityRecognizer',
        },
        {
          title: 'Microsoft.GuidEntityRecognizer',
          description: 'Recognizer which recognizes guids.',
          $ref: '#/definitions/Microsoft.GuidEntityRecognizer',
        },
        {
          title: 'Microsoft.HashtagEntityRecognizer',
          description: 'Recognizer which recognizes Hashtags.',
          $ref: '#/definitions/Microsoft.HashtagEntityRecognizer',
        },
        {
          title: 'Microsoft.IpEntityRecognizer',
          description: 'Recognizer which recognizes internet IP patterns (like 192.1.1.1).',
          $ref: '#/definitions/Microsoft.IpEntityRecognizer',
        },
        {
          title: 'Microsoft.MentionEntityRecognizer',
          description: 'Recognizer which recognizes @Mentions',
          $ref: '#/definitions/Microsoft.MentionEntityRecognizer',
        },
        {
          title: 'Microsoft.NumberEntityRecognizer',
          description: 'Recognizer which recognizes numbers.',
          $ref: '#/definitions/Microsoft.NumberEntityRecognizer',
        },
        {
          title: 'Microsoft.NumberRangeEntityRecognizer',
          description: 'Recognizer which recognizes ranges of numbers (Example:2 to 5).',
          $ref: '#/definitions/Microsoft.NumberRangeEntityRecognizer',
        },
        {
          title: 'Microsoft.OrdinalEntityRecognizer',
          description: 'Recognizer which recognizes ordinals (example: first, second, 3rd).',
          $ref: '#/definitions/Microsoft.OrdinalEntityRecognizer',
        },
        {
          title: 'Microsoft.PercentageEntityRecognizer',
          description: 'Recognizer which recognizes percentages.',
          $ref: '#/definitions/Microsoft.PercentageEntityRecognizer',
        },
        {
          title: 'Microsoft.PhoneNumberEntityRecognizer',
          description: 'Recognizer which recognizes phone numbers.',
          $ref: '#/definitions/Microsoft.PhoneNumberEntityRecognizer',
        },
        {
          title: 'Microsoft.RegexEntityRecognizer',
          description: 'Recognizer which recognizes patterns of input based on regex.',
          $ref: '#/definitions/Microsoft.RegexEntityRecognizer',
        },
        {
          title: 'Microsoft.TemperatureEntityRecognizer',
          description: 'Recognizer which recognizes temperatures.',
          $ref: '#/definitions/Microsoft.TemperatureEntityRecognizer',
        },
        {
          title: 'Microsoft.UrlEntityRecognizer',
          description: 'Recognizer which recognizes urls (example: http://bing.com)',
          $ref: '#/definitions/Microsoft.UrlEntityRecognizer',
        },
      ],
    },

    'Microsoft.Foreach': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Foreach Action',
      description: 'Action which executes actions per item in a collection.',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        listProperty: {
          $role: 'expression',
          title: 'List Property',
          description: 'Expression to evaluate.',
          examples: ['user.todoList'],
          type: 'string',
        },
        actions: {
          type: 'array',
          title: 'Actions',
          description: 'Actions to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        indexProperty: {
          $role: 'expression',
          title: 'Index Property',
          description: 'The memory path which refers to the index of the item',
          default: 'dialog.index',
          type: 'string',
        },
        valueProperty: {
          $role: 'expression',
          title: 'Value Property',
          description: 'The memory path which refers to the value of the item',
          default: 'dialog.value',
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
    'Microsoft.ForeachPage': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Foreach Page Action',
      description: 'Action which execute actions per item page in a collection.',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        listProperty: {
          $role: 'expression',
          title: 'List Property',
          description: 'Expression to evaluate.',
          examples: ['user.todoList'],
          type: 'string',
        },
        actions: {
          type: 'array',
          title: 'Actions',
          description: 'Actions to execute',
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
          $role: 'expression',
          title: 'Value Property',
          description: 'The memory path which refers to the value of the item',
          default: 'dialog.value',
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
    'Microsoft.GuidEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Guid Entity Recognizer',
      description: 'Recognizer which recognizes guids.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.GuidEntityRecognizer',
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
    'Microsoft.HashtagEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Hashtag Entity Recognizer',
      description: 'Recognizer which recognizes Hashtags.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.HashtagEntityRecognizer',
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
    'Microsoft.HttpRequest': {
      $role: 'unionType(Microsoft.IDialog)',
      type: 'object',
      title: 'Http Request',
      description: 'This is a action which replaces the current dialog with the target dialog',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
          $role: 'expression',
          title: 'Property',
          description:
            'The property to store the result of the HTTP call in. The result will have 4 properties from the http response: statusCode|reasonPhrase|content|headers.  If the content is json it will be an deserialized object, otherwise it will be a string',
          examples: ['dialog.contosodata'],
          type: 'string',
        },
        headers: {
          type: 'object',
          additionalProperties: true,
          title: 'Http headers',
          description:
            'Additional headers to include with the HTTP request. This may reference properties in memory as {property.name}.',
        },
        responseType: {
          type: 'string',
          title: 'Response Type',
          description:
            'Describes how to parse the response from the http request. If Activity or Activities, then the they will be sent to the user.',
          enum: ['None', 'Json', 'Activity', 'Activities'],
          default: 'Json',
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
          description: 'Configures a data driven dialog via a collection of actions/dialogs.',
          $ref: '#/definitions/Microsoft.AdaptiveDialog',
        },
        {
          title: 'Microsoft.AttachmentInput',
          description: 'This represents a dialog which gathers an attachment such as image or music',
          $ref: '#/definitions/Microsoft.AttachmentInput',
        },
        {
          title: 'Microsoft.BeginDialog',
          description: 'Action which begins another dialog (and when that dialog is done, it will return the caller).',
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
          title: 'Microsoft.DateTimeInput',
          description: 'This represents a dialog which gathers Date or Time or DateTime from the user',
          $ref: '#/definitions/Microsoft.DateTimeInput',
        },
        {
          title: 'Microsoft.DebugBreak',
          description: 'If debugger is attached, do a debugger break at this point',
          $ref: '#/definitions/Microsoft.DebugBreak',
        },
        {
          title: 'Microsoft.DeleteProperty',
          description: 'This is a action which allows you to remove a property from memory',
          $ref: '#/definitions/Microsoft.DeleteProperty',
        },
        {
          title: 'Microsoft.EditActions',
          description: 'Edit current dialog with changeType and Actions',
          $ref: '#/definitions/Microsoft.EditActions',
        },
        {
          title: 'Microsoft.EditArray',
          description: 'This is a action which allows you to modify an array in memory',
          $ref: '#/definitions/Microsoft.EditArray',
        },
        {
          title: 'Microsoft.EmitEvent',
          description: 'This is a action which allows you to emit an event',
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
          description: 'Action which executes actions per item in a collection.',
          $ref: '#/definitions/Microsoft.Foreach',
        },
        {
          title: 'Microsoft.ForeachPage',
          description: 'Action which execute actions per item page in a collection.',
          $ref: '#/definitions/Microsoft.ForeachPage',
        },
        {
          title: 'Microsoft.HttpRequest',
          description: 'This is a action which replaces the current dialog with the target dialog',
          $ref: '#/definitions/Microsoft.HttpRequest',
        },
        {
          title: 'Microsoft.IfCondition',
          description: 'Action which conditionally decides which action to execute next.',
          $ref: '#/definitions/Microsoft.IfCondition',
        },
        {
          title: 'Microsoft.InitProperty',
          description: 'This action allows you to innitial a property to either an object or array',
          $ref: '#/definitions/Microsoft.InitProperty',
        },
        {
          title: 'Microsoft.LogAction',
          description:
            'This is a action which writes to console.log and optional creates a TraceActivity around a text binding',
          $ref: '#/definitions/Microsoft.LogAction',
        },
        {
          title: 'Microsoft.NumberInput',
          description: 'This represents a dialog which gathers a decimal number in a specified range',
          $ref: '#/definitions/Microsoft.NumberInput',
        },
        {
          title: 'Microsoft.OAuthInput',
          description: 'This represents a dialog which gathers an OAuth token from user',
          $ref: '#/definitions/Microsoft.OAuthInput',
        },
        {
          title: 'Microsoft.QnAMakerDialog',
          description: 'This represents a dialog which is driven by a call to QnAMaker.ai knowledge base',
          $ref: '#/definitions/Microsoft.QnAMakerDialog',
        },
        {
          title: 'Microsoft.RepeatDialog',
          description: 'This is a action which repeats the current dialog with the same dialog.',
          $ref: '#/definitions/Microsoft.RepeatDialog',
        },
        {
          title: 'Microsoft.ReplaceDialog',
          description: 'This is a action which replaces the current dialog with the target dialog',
          $ref: '#/definitions/Microsoft.ReplaceDialog',
        },
        {
          title: 'Microsoft.SendActivity',
          description: 'This is a action which sends an activity to the user',
          $ref: '#/definitions/Microsoft.SendActivity',
        },
        {
          title: 'Microsoft.SetProperty',
          description: 'This action allows you to set memory to the value of an expression',
          $ref: '#/definitions/Microsoft.SetProperty',
        },
        {
          title: 'Microsoft.SwitchCondition',
          description: 'Action which conditionally decides which action to execute next.',
          $ref: '#/definitions/Microsoft.SwitchCondition',
        },
        {
          title: 'Microsoft.TextInput',
          description: 'This represents a dialog which gathers a text from the user',
          $ref: '#/definitions/Microsoft.TextInput',
        },
        {
          title: 'Microsoft.TraceActivity',
          description: 'This is a action which sends an TraceActivity to the transcript',
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
    'Microsoft.IOnEvent': {
      title: 'Microsoft IOnEvent',
      description: 'Union of components which implement the IOnEvent interface',
      $role: 'unionType',
      oneOf: [
        {
          title: 'Microsoft.OnActivity',
          description: 'This defines the actions to take when an custom activity is received',
          $ref: '#/definitions/Microsoft.OnActivity',
        },
        {
          title: 'Microsoft.OnBeginDialog',
          description: 'This defines the actions to take when a dialog is started via BeginDialog()',
          $ref: '#/definitions/Microsoft.OnBeginDialog',
        },
        {
          title: 'Microsoft.OnConversationUpdateActivity',
          description: 'This defines the actions to take when an ConversationUpdate activity is received',
          $ref: '#/definitions/Microsoft.OnConversationUpdateActivity',
        },
        {
          title: 'Microsoft.OnDialogEvent',
          description: 'Defines a rule for an event which is triggered by some source',
          $ref: '#/definitions/Microsoft.OnDialogEvent',
        },
        {
          title: 'Microsoft.OnEndOfConversationActivity',
          description: 'This defines the actions to take when an EndOfConversation Activity is received',
          $ref: '#/definitions/Microsoft.OnEndOfConversationActivity',
        },
        {
          title: 'Microsoft.OnEvent',
          description: 'Defines a rule for an event which is triggered by some source',
          $ref: '#/definitions/Microsoft.OnEvent',
        },
        {
          title: 'Microsoft.OnEventActivity',
          description: 'This defines the actions to take when an Event activity is received',
          $ref: '#/definitions/Microsoft.OnEventActivity',
        },
        {
          title: 'Microsoft.OnHandoffActivity',
          description: 'This defines the actions to take when an Handoff activity is received',
          $ref: '#/definitions/Microsoft.OnHandoffActivity',
        },
        {
          title: 'Microsoft.OnIntent',
          description: 'This defines the actions to take when an Intent is recognized (and optionally entities)',
          $ref: '#/definitions/Microsoft.OnIntent',
        },
        {
          title: 'Microsoft.OnInvokeActivity',
          description: 'This defines the actions to take when an Invoke activity is received',
          $ref: '#/definitions/Microsoft.OnInvokeActivity',
        },
        {
          title: 'Microsoft.OnMessageActivity',
          description:
            'This defines the actions to take when an Message activity is received. NOTE: If this triggers it will override any Recognizer/Intent rule calculation',
          $ref: '#/definitions/Microsoft.OnMessageActivity',
        },
        {
          title: 'Microsoft.OnMessageDeleteActivity',
          description: 'This defines the actions to take when an MessageDelete activity is received',
          $ref: '#/definitions/Microsoft.OnMessageDeleteActivity',
        },
        {
          title: 'Microsoft.OnMessageReactionActivity',
          description: 'This defines the actions to take when a MessageReaction activity is received',
          $ref: '#/definitions/Microsoft.OnMessageReactionActivity',
        },
        {
          title: 'Microsoft.OnMessageUpdateActivity',
          description: 'This defines the actions to take when an MessageUpdate ctivity is received',
          $ref: '#/definitions/Microsoft.OnMessageUpdateActivity',
        },
        {
          title: 'Microsoft.OnTypingActivity',
          description: 'This defines the actions to take when a Typing activity is received',
          $ref: '#/definitions/Microsoft.OnTypingActivity',
        },
        {
          title: 'Microsoft.OnUnknownIntent',
          description:
            'This defines the actions to take when an utterence is not recognized (aka, the None Intent). NOTE: UnknownIntent will defer to any specific intent that fires in a parent dialog',
          $ref: '#/definitions/Microsoft.OnUnknownIntent',
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
          title: 'Microsoft.OnConversationUpdateActivity',
          description: 'This defines the steps to take when a ConversationUpdate Activity is recieved',
          $ref: '#/definitions/Microsoft.OnConversationUpdateActivity',
        },
        {
          title: 'Microsoft.OnEvent',
          description: 'This defines a rule for an event that is triggered by some source',
          $ref: '#/definitions/Microsoft.OnEvent',
        },
        {
          title: 'Microsoft.OnIntent',
          description: 'This defines the actions to take when an Intent is recognized (and optionally entities)',
          $ref: '#/definitions/Microsoft.OnIntent',
        },
        {
          title: 'Microsoft.Rule',
          description: 'Defines a rule for an event which is triggered by some source',
          $ref: '#/definitions/Microsoft.Rule',
        },
        {
          title: 'Microsoft.OnUnknownIntent',
          description: 'Defines a sequence of actions to take if there is no other trigger or plan operating',
          $ref: '#/definitions/Microsoft.OnUnknownIntent',
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
      title: 'If Condition Action',
      description: 'Action which conditionally decides which action to execute next.',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Expression to evaluate.',
          examples: ['user.age > 3'],
          type: 'string',
        },
        actions: {
          type: 'array',
          title: 'Actions: True Branch',
          description: 'Action to execute if condition is true.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        elseActions: {
          type: 'array',
          title: 'Actions: False Branch',
          description: 'Action to execute if condition is false.',
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
      title: 'Init Property Action',
      description: 'This action allows you to innitial a property to either an object or array',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'The property to set the value of',
          examples: ['user.age'],
          type: 'string',
        },
        type: {
          type: 'string',
          title: 'Type',
          description: 'type of value to set the property to, object or array.',
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
    'Microsoft.IpEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Ip Entity Recognizer',
      description: 'Recognizer which recognizes internet IP patterns (like 192.1.1.1).',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.IpEntityRecognizer',
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
    'Microsoft.LogAction': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Log Action',
      description:
        'This is a action which writes to console.log and optional creates a TraceActivity around a text binding',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.LogAction',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
    'Microsoft.MentionEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Mentions Entity Recognizer',
      description: 'Recognizer which recognizes @Mentions',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.MentionEntityRecognizer',
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
    'Microsoft.NumberEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Number Entity Recognizer',
      description: 'Recognizer which recognizes numbers.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.NumberEntityRecognizer',
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
    'Microsoft.NumberInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'NumberInput Dialog',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default Value Response',
          description:
            'The message to send to when max turn count has been exceeded and the default value is selected as the value.',
          examples: [
            "I didn't understand your responses, so I will just use the default value of 10.  Let me know if you want to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 3,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation Expressions',
          description:
            'These are expressions used to validate the customer response. The response is considered invalid if any of these evaluate to false.',
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
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property that this input dialog is bound to',
          examples: ['$birthday'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: "Value to return if the value expression can't be evaluated.",
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
          type: 'string',
          enum: ['always', 'never', 'notRecognized'],
          title: 'Allow Interruptions',
          description:
            "Always will always consult parent dialogs first, never will not consult parent dialogs, notRecognized will consult parent only when it's not recognized",
          default: 'notRecognized',
          examples: ['notRecognized'],
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
    'Microsoft.NumberRangeEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'NumberRange Entity Recognizer',
      description: 'Recognizer which recognizes ranges of numbers (Example:2 to 5).',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.NumberRangeEntityRecognizer',
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
    'Microsoft.OAuthInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'OAuthInput Dialog',
      description: 'This represents a dialog which gathers an OAuth token from user',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default Value Response',
          description:
            'The message to send to when max turn count has been exceeded and the default value is selected as the value.',
          examples: [
            "I didn't understand your responses, so I will just use the default value of 10.  Let me know if you want to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 3,
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
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property that this input dialog is bound to',
          examples: ['$birthday'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: "Value to return if the value expression can't be evaluated.",
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
          type: 'string',
          enum: ['always', 'never', 'notRecognized'],
          title: 'Allow Interruptions',
          description:
            "Always will always consult parent dialogs first, never will not consult parent dialogs, notRecognized will consult parent only when it's not recognized",
          default: 'notRecognized',
          examples: ['notRecognized'],
        },
        connectionName: {
          type: 'string',
          title: 'Connection Name',
          description: 'The connection name configured in Azure Web App Bot OAuth settings.',
        },
        text: {
          type: 'string',
          title: 'Text',
          description: 'Text shown in the OAuth signin card.',
        },
        title: {
          type: 'string',
          title: 'Title',
          description: 'Title shown in the OAuth signin card.',
        },
        timeout: {
          type: 'integer',
          title: 'Timeout',
          description: 'Time out setting for the OAuth signin card.',
          default: '900000',
        },
      },
      additionalProperties: false,
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
    'Microsoft.OnActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'OnActivity',
      description: 'This defines the actions to take when an custom activity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        type: {
          type: 'string',
          title: 'Type',
          description: 'Activity type',
        },
      },
      additionalProperties: false,
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
    'Microsoft.OnBeginDialog': {
      title: 'OnBeginDialog',
      description: 'This defines the actions to take when a dialog is started via BeginDialog()',
      $role: 'unionType(Microsoft.IOnEvent)',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnBeginDialog',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnConversationUpdateActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'OnConversationUpdateActivity',
      description: 'This defines the actions to take when an ConversationUpdate activity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnConversationUpdateActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnDialogEvent': {
      title: 'Event Event',
      description: 'Defines a rule for an event which is triggered by some source',
      type: 'object',
      $role: 'unionType(Microsoft.IOnEvent)',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnDialogEvent',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        events: {
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
              'actionsStarted',
              'actionsSaved',
              'actionsEnded',
              'actionsResumed',
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
    'Microsoft.OnEndOfConversationActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'OnEndOfConversationActivity',
      description: 'This defines the actions to take when an EndOfConversation Activity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnEndOfConversationActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnEvent': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'Event Event',
      description: 'Defines a rule for an event which is triggered by some source',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnEvent',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnEventActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'OnEventActivity',
      description: 'This defines the actions to take when an Event activity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnEventActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnHandoffActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'OnHandoffActivity',
      description: 'This defines the actions to take when an Handoff activity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnHandoffActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnIntent': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'Intent Event',
      description: 'This defines the actions to take when an Intent is recognized (and optionally entities)',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnIntent',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnInvokeActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'OnInvokeActivity',
      description: 'This defines the actions to take when an Invoke activity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnInvokeActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnMessageActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'OnMessageActivity',
      description:
        'This defines the actions to take when an Message activity is received. NOTE: If this triggers it will override any Recognizer/Intent rule calculation',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnMessageActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnMessageDeleteActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'MessageDeleteActivity',
      description: 'This defines the actions to take when an MessageDelete activity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnMessageDeleteActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnMessageReactionActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'MessageReactionActivity',
      description: 'This defines the actions to take when a MessageReaction activity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnMessageReactionActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnMessageUpdateActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'MessageUpdateActivity',
      description: 'This defines the actions to take when an MessageUpdate ctivity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnMessageUpdateActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnTypingActivity': {
      $role: 'unionType(Microsoft.IOnEvent)',
      title: 'TypingActivity',
      description: 'This defines the actions to take when a Typing activity is received',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnTypingActivity',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OnUnknownIntent': {
      title: 'OnUnknownIntent',
      description:
        'This defines the actions to take when an utterence is not recognized (aka, the None Intent). NOTE: UnknownIntent will defer to any specific intent that fires in a parent dialog',
      $role: 'unionType(Microsoft.IOnEvent)',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OnUnknownIntent',
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
        actions: {
          type: 'array',
          description: 'Sequence of actions or dialogs to execute',
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
    'Microsoft.OrdinalEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Ordinal Entity Recognizer',
      description: 'Recognizer which recognizes ordinals (example: first, second, 3rd).',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.OrdinalEntityRecognizer',
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
    'Microsoft.PercentageEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Percentage Entity Recognizer',
      description: 'Recognizer which recognizes percentages.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.PercentageEntityRecognizer',
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
    'Microsoft.PhoneNumberEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Phone Number Entity Recognizer',
      description: 'Recognizer which recognizes phone numbers.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.PhoneNumberEntityRecognizer',
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
          description: 'Extra information for the Bot Framework Composer.',
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
                'sets the minimum score threshold, used to filter returned results. Scores are normalized to the range of 0.0 to 1.0',
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
    'Microsoft.RegexEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Regex Entity Recognizer',
      description: 'Recognizer which recognizes patterns of input based on regex.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.RegexEntityRecognizer',
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
          description: 'Name of the entity',
        },
        pattern: {
          type: 'string',
          title: 'Pattern',
          description: 'Pattern expressed as regular expression.',
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
          type: 'array',
          title: 'RegEx patterns to intents',
          description: 'Collection of patterns to match intents',
          items: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                title: 'Intent',
                description: 'The intent name',
              },
              pattern: {
                type: 'string',
                title: 'Pattern',
                description: 'The regular expression pattern for matching',
              },
            },
          },
        },
        entities: {
          type: 'array',
          title: 'Entity Recognizers',
          description: 'Entity Recognizers to use',
          items: {
            $type: 'Microsoft.EntityRecognizer',
            $ref: '#/definitions/Microsoft.EntityRecognizer',
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
      description: 'This is a action which repeats the current dialog with the same dialog.',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
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
    'Microsoft.ReplaceDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      type: 'object',
      title: 'Replace Dialog',
      description: 'This is a action which replaces the current dialog with the target dialog',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog',
          description: 'This is the dialog to switch to.',
          type: 'string',
        },
        options: {
          type: 'object',
          title: 'Options binding',
          description: 'Bindings to configure the options object to pass to the dialog.',
          additionalProperties: {
            type: 'string',
            title: 'Options',
          },
        },
        property: {
          $role: 'expression',
          description: 'The property to bind to the dialog and store the result in',
          examples: ['user.name'],
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
    'Microsoft.SendActivity': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Send Activity Action',
      description: 'This is a action which sends an activity to the user',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
      title: 'Set Property Action',
      description: 'This action allows you to set memory to the value of an expression',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'The property to set the value of',
          examples: ['user.age'],
          type: 'string',
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
      title: 'Switch Action',
      description: 'Action which conditionally decides which action to execute next.',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
            required: ['value', 'case'],
            properties: {
              value: {
                $role: 'expression',
                title: 'Value',
                description: 'Value which must match the condition property',
                type: 'string',
              },
              actions: {
                type: 'array',
                title: 'Actions',
                description: 'Actions to execute if case is equal to condition',
                items: {
                  $type: 'Microsoft.IDialog',
                  $ref: '#/definitions/Microsoft.IDialog',
                },
              },
            },
          },
        },
        default: {
          type: 'array',
          title: 'Default',
          description: 'Action to execute if no case is equal to condition',
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
    'Microsoft.TemperatureEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Temperature Entity Recognizer',
      description: 'Recognizer which recognizes temperatures.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.TemperatureEntityRecognizer',
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
    'Microsoft.TextInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'TextInput Dialog',
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
        id: {
          type: 'string',
          title: 'Id',
          description: '(Optional) id for the dialog',
          examples: ['Dialog2'],
        },
        tags: {
          type: 'array',
          title: 'Tags',
          description: 'Tags are optional strings that you can use to organize components',
          examples: ['input', 'confirmation'],
          items: {
            type: 'string',
          },
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
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default Value Response',
          description:
            'The message to send to when max turn count has been exceeded and the default value is selected as the value.',
          examples: [
            "I didn't understand your responses, so I will just use the default value of 10.  Let me know if you want to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max Turn Count',
          description: 'The max retry count for this prompt.',
          default: 3,
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
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property that this input dialog is bound to',
          examples: ['$birthday'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default Value',
          description: "Value to return if the value expression can't be evaluated.",
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
          type: 'string',
          enum: ['always', 'never', 'notRecognized'],
          title: 'Allow Interruptions',
          description:
            "Always will always consult parent dialogs first, never will not consult parent dialogs, notRecognized will consult parent only when it's not recognized",
          default: 'notRecognized',
          examples: ['notRecognized'],
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
    'Microsoft.UrlEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizer)',
      title: 'Url Entity Recognizer',
      description: 'Recognizer which recognizes urls (example: http://bing.com)',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.UrlEntityRecognizer',
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
  },
};
