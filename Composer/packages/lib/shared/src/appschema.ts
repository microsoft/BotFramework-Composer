import { SDKTypes, OBISchema } from './types';

export const FIELDS_TO_HIDE = ['$id', '$type', '$copy', '$designer', 'selector', 'id', 'tags'];

/** Types that can be represented by a sub tree in the graph */
export const COMPOUND_TYPES = [
  SDKTypes.AdaptiveDialog,
  SDKTypes.OnCondition,
  SDKTypes.OnDialogEvent,
  SDKTypes.OnCustomEvent,
  SDKTypes.OnIntent,
  SDKTypes.OnUnknownIntent,
  SDKTypes.OnConversationUpdateActivity,
];

const $properties = ($type: SDKTypes) => {
  return {
    $type: {
      title: '$type',
      description: 'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
      type: 'string',
      pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
      const: $type,
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
  };
};

export const appschema: OBISchema = {
  $schema:
    'https://raw.githubusercontent.com/Microsoft/botbuilder-tools/SchemaGen/packages/DialogSchema/src/dialogSchema.schema',
  $id: 'app.schema',
  type: 'object',
  title: 'Component types',
  description: 'These are all the types of components that the loader can create.',
  definitions: {
    'Microsoft.ActivityTemplate': {
      $role: 'unionType(Microsoft.IActivityTemplate)',
      title: 'Microsoft ActivityTemplate',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.ActivityTemplate),
        template: {
          title: 'Template',
          Description: 'Language Generator template to use to create the activity',
          type: 'string',
        },
      },
    },
    'Microsoft.AdaptiveDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Adaptive Dialog',
      description: 'Flexible, data driven dialog that can adapt to the conversation.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.AdaptiveDialog),
        id: {
          type: 'string',
          title: 'Id',
          description: 'Optional dialog ID.',
        },
        autoEndDialog: {
          type: 'boolean',
          title: 'Auto end dialog',
          description:
            'If set to true the dialog will automatically end when there are no further actions.  If set to false, remember to manually end the dialog using EndDialog action.',
          default: 'true',
        },
        defaultResultProperty: {
          type: 'string',
          title: 'Default result property',
          description: 'Value that will be passed back to the parent dialog.',
          default: 'dialog.result',
        },
        recognizer: {
          $type: 'Microsoft.IRecognizer',
          title: 'Recognizer',
          description: 'Language Understanding recognizer that interprets user input into intent and entities.',
          $ref: '#/definitions/Microsoft.IRecognizer',
        },
        // generator: {
        //   $type: 'Microsoft.ILanguageGenerator',
        //   title: 'Language Generator',
        //   description: 'Language generator that generates bot responses.',
        //   $ref: '#/definitions/Microsoft.ILanguageGenerator',
        // },
        // selector: {
        //   $type: 'Microsoft.ITriggerSelector',
        //   title: 'Selector',
        //   description: "Policy to determine which trigger is executed. Defaults to a 'best match' selector (optional).",
        //   $ref: '#/definitions/Microsoft.ITriggerSelector',
        // },
        triggers: {
          type: 'array',
          description: 'List of triggers defined for this dialog.',
          title: 'Triggers',
          items: {
            $type: 'Microsoft.ITriggerCondition',
            $ref: '#/definitions/Microsoft.ITriggerCondition',
          },
        },
      },
    },
    'Microsoft.AgeEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Age Entity Recognizer',
      description: 'Recognizer which recognizes age.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.AgeEntityRecognizer),
      },
    },
    'Microsoft.AttachmentInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'AttachmentInput Dialog',
      description: 'This represents a dialog which gathers an attachment such as image or music',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.AttachmentInput),
        id: {
          type: 'string',
          title: 'Id',
          description: 'Optional dialog ID.',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial prompt',
          description: 'Message to send to collect information.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized prompt',
          description: 'Message to send if user response is not recognized.',
          examples: ["Sorry, I do not understand '{turn.activity.text'}. Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid prompt',
          description: 'Message to send if user response is invalid. Relies on specified validation expressions.',
          examples: ["Sorry, '{this.value}' does not work. I need a number between 1-150. What is your age?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default value response',
          description:
            'Message to send when max turn count (if specified) has been exceeded and the default value is selected as the value.',
          examples: [
            "Sorry, I'm having trouble understanding you. I will just use {this.options.defaultValue} for now. You can say 'I'm 36 years old' to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max turn count',
          description: 'Maximum number of re-prompt attempts to collect information.',
          default: 3,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation expressions',
          description: 'Expression to validate user input.',
          examples: ['int(this.value) > 1 && int(this.value) <= 150', 'count(this.value) < 300'],
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description:
            "Property to store collected information. Input will be skipped if property has value (unless 'Always prompt' is true).",
          examples: ['$birthday', 'user.name', 'conversation.issueTitle', 'dialog.favColor'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default value',
          description: 'Expression to examine on each turn of the conversation as possible value to the property.',
          examples: ['@userName', 'coalesce(@number, @partySize)'],
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always prompt',
          description: "Collect information even if the specified 'property' is not empty.",
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          $role: 'expression',
          type: 'string',
          title: 'Allow Interruptions',
          description:
            'A boolean expression that determines whether the parent should be allowed to interrupt the input.',
          default: 'true',
          examples: ['true'],
        },
        outputFormat: {
          type: 'string',
          enum: ['all', 'first'],
          title: 'Output format',
          description: 'Attachment output format.',
          default: 'first',
        },
      },
    },
    'Microsoft.BeginDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Begin Dialog',
      description: 'Begin another dialog.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.BeginDialog),
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog name',
          description: 'Name of the dialog to call.',
          examples: ['AddToDoDialog'],
          // Composer override
          type: 'string',
        },
        options: {
          type: 'object',
          title: 'Options',
          description: 'One or more options that are passed to the dialog that is called.',
          additionalProperties: true,
        },
        resultProperty: {
          $role: 'expression',
          title: 'Property',
          description: 'Property to store any value returned by the dialog that is called.',
          examples: ['dialog.userName'],
          type: 'string',
        },
      },
    },
    'Microsoft.CancelAllDialogs': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Cancel all dialogs',
      description:
        'Cancel all active dialogs. All dialogs in the dialog chain will need a trigger to capture the event configured in this action.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.CancelAllDialogs),
        eventName: {
          title: 'Event name',
          description: 'Name of the event to emit.',
          type: 'string',
        },
        eventValue: {
          type: 'object',
          title: 'Event value',
          description: 'Value to emit with the event (optional).',
          additionalProperties: true,
        },
      },
    },
    'Microsoft.ChoiceInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Choice input dialog',
      description: 'Collect information - Pick from a list of choices',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.ChoiceInput),
        id: {
          type: 'string',
          title: 'Id',
          description: 'Optional dialog ID.',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial prompt',
          description: 'Message to send to collect information.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized prompt',
          description: 'Message to send if user response is not recognized.',
          examples: ["Sorry, I do not understand '{turn.activity.text'}. Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid prompt',
          description: 'Message to send if user response is invalid. Relies on specified validation expressions.',
          examples: ["Sorry, '{this.value}' does not work. I need a number between 1-150. What is your age?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default value response',
          description:
            'Message to send when max turn count (if specified) has been exceeded and the default value is selected as the value.',
          examples: [
            "Sorry, I'm having trouble understanding you. I will just use {this.options.defaultValue} for now. You can say 'I'm 36 years old' to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max turn count',
          description: 'Maximum number of re-prompt attempts to collect information.',
          default: 3,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation expressions',
          description: 'Expression to validate user input.',
          examples: ['int(this.value) > 1 && int(this.value) <= 150', 'count(this.value) < 300'],
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description:
            "Property to store collected information. Input will be skipped if property has value (unless 'Always prompt' is true).",
          examples: ['$birthday', 'user.name', 'conversation.issueTitle', 'dialog.favColor'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default value',
          description: 'Expression to examine on each turn of the conversation as possible value to the property.',
          examples: ['@userName', 'coalesce(@number, @partySize)'],
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always prompt',
          description: "Collect information even if the specified 'property' is not empty.",
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          $role: 'expression',
          type: 'string',
          title: 'Allow Interruptions',
          description:
            'A boolean expression that determines whether the parent should be allowed to interrupt the input.',
          default: 'true',
          examples: ['true'],
        },
        outputFormat: {
          type: 'string',
          enum: ['value', 'index'],
          title: 'Output format',
          description: 'Choice output format.',
          default: 'value',
        },
        // TODO: support oneOf
        choices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                title: 'Value',
                description: 'Value to return when this choice is selected.',
              },
              // action: {
              //   title: 'Action',
              //   description: 'Card action for the choice',
              //   type: 'object',
              // },
              synonyms: {
                type: 'array',
                title: 'Synonyms',
                description: 'List of synonyms to recognize in addition to the value (optional).',
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
          title: 'Default locale',
          description: 'Default locale.',
          default: 'en-us',
        },
        style: {
          type: 'string',
          enum: ['None', 'Auto', 'Inline', 'List', 'SuggestedAction', 'HeroCard'],
          title: 'List style',
          description: 'Style to render choices.',
          default: 'Auto',
        },
        choiceOptions: {
          type: 'object',
          properties: {
            inlineSeparator: {
              type: 'string',
              title: 'Inline seperator',
              description: 'Character used to separate individual choices when there are more than 2 choices',
              default: ', ',
            },
            inlineOr: {
              type: 'string',
              title: 'Inline or',
              description: 'Separator inserted between the choices when there are only 2 choices',
              default: ' or ',
            },
            inlineOrMore: {
              type: 'string',
              title: 'Inline or more',
              description: 'Separator inserted between the last 2 choices when there are more than 2 choices.',
              default: ', or ',
            },
            includeNumbers: {
              type: 'boolean',
              title: 'Include numbers',
              description: "If true, 'inline' and 'list' list style will be prefixed with the index of the choice.",
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
              description: 'If true, the choices value field will NOT be search over',
              default: false,
            },
            // noAction: {
            //   type: 'boolean',
            //   title: 'No vction',
            //   description: 'If true, the the choices action.title field will NOT be searched over',
            //   default: false,
            // },
          },
        },
      },
    },
    'Microsoft.ConditionalSelector': {
      $role: 'unionType(Microsoft.ITriggerSelector)',
      title: 'Condtional Trigger Selector',
      description: 'Use a rule selector based on a condition',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.ConditionalSelector),
        condition: {
          $role: 'expression',
          type: 'string',
          description: 'String must contain an expression.',
        },
        ifTrue: {
          $type: 'Microsoft.ITriggerSelector',
          $ref: '#/definitions/Microsoft.ITriggerSelector',
        },
        ifFalse: {
          $type: 'Microsoft.ITriggerSelector',
          $ref: '#/definitions/Microsoft.ITriggerSelector',
        },
      },
    },
    'Microsoft.ConfirmInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Confirm input dialog',
      description: 'Collect information - Ask for confirmation (yes or no).',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.ConfirmInput),
        id: {
          type: 'string',
          title: 'Id',
          description: 'Optional dialog ID.',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial prompt',
          description: 'Message to send to collect information.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized prompt',
          description: 'Message to send if user response is not recognized.',
          examples: ["Sorry, I do not understand '{turn.activity.text'}. Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid prompt',
          description: 'Message to send if user response is invalid. Relies on specified validation expressions.',
          examples: ["Sorry, '{this.value}' does not work. I need a number between 1-150. What is your age?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default value response',
          description:
            'Message to send when max turn count (if specified) has been exceeded and the default value is selected as the value.',
          examples: [
            "Sorry, I'm having trouble understanding you. I will just use {this.options.defaultValue} for now. You can say 'I'm 36 years old' to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max turn count',
          description: 'Maximum number of re-prompt attempts to collect information.',
          default: 3,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation expressions',
          description: 'Expression to validate user input.',
          examples: ['int(this.value) > 1 && int(this.value) <= 150', 'count(this.value) < 300'],
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description:
            "Property to store collected information. Input will be skipped if property has value (unless 'Always prompt' is true).",
          examples: ['$birthday', 'user.name', 'conversation.issueTitle', 'dialog.favColor'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default value',
          description: 'Expression to examine on each turn of the conversation as possible value to the property.',
          examples: ['@userName', 'coalesce(@number, @partySize)'],
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always prompt',
          description: "Collect information even if the specified 'property' is not empty.",
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          $role: 'expression',
          type: 'string',
          title: 'Allow Interruptions',
          description:
            'A boolean expression that determines whether the parent should be allowed to interrupt the input.',
          default: 'true',
          examples: ['true'],
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
          title: 'List style',
          description: 'Style to render choices.',
          default: 'Auto',
        },
        choiceOptions: {
          type: 'object',
          properties: {
            inlineSeparator: {
              type: 'string',
              title: 'Inline separator',
              description: 'Character used to separate individual choices when there are more than 2 choices',
              default: ', ',
            },
            inlineOr: {
              type: 'string',
              title: 'Inline or',
              description: 'Separator inserted between the choices when their are only 2 choices',
              default: ' or ',
            },
            inlineOrMore: {
              type: 'string',
              title: 'Inline or more',
              description: 'Separator inserted between the last 2 choices when their are more than 2 choices.',
              default: ', or ',
            },
            includeNumbers: {
              type: 'boolean',
              title: 'Include numbers',
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
                description: 'Value to return when this choice is selected.',
              },
              // action: {
              //   type: 'object',
              //   title: 'Action',
              //   description: 'Card action for the choice',
              // },
              synonyms: {
                type: 'array',
                title: 'Synonyms',
                description: 'List of synonyms to recognize in addition to the value (optional)',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    'Microsoft.ConfirmationEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Confirmation Entity Recognizer',
      description: 'Recognizer which recognizes confirmation choices (yes/no).',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.ConfirmationEntityRecognizer),
      },
    },
    'Microsoft.CurrencyEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Currency Entity Recognizer',
      description: 'Recognizer which recognizes currency.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.CurrencyEntityRecognizer),
      },
    },
    'Microsoft.DateTimeEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'DateTime Entity Recognizer',
      description: 'Recognizer which recognizes dates and time fragments.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.DateTimeEntityRecognizer),
      },
    },
    'Microsoft.DateTimeInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Date/time input dialog',
      description: 'Collect information - Ask for date and/ or time',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.DateTimeInput),
        id: {
          type: 'string',
          title: 'Id',
          description: 'Optional dialog ID.',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial prompt',
          description: 'Message to send to collect information.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized prompt',
          description: 'Message to send if user response is not recognized.',
          examples: ["Sorry, I do not understand '{turn.activity.text'}. Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid prompt',
          description: 'Message to send if user response is invalid. Relies on specified validation expressions.',
          examples: ["Sorry, '{this.value}' does not work. I need a number between 1-150. What is your age?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default value response',
          description:
            'Message to send when max turn count (if specified) has been exceeded and the default value is selected as the value.',
          examples: [
            "Sorry, I'm having trouble understanding you. I will just use {this.options.defaultValue} for now. You can say 'I'm 36 years old' to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max turn count',
          description: 'Maximum number of re-prompt attempts to collect information.',
          default: 3,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation expressions',
          description: 'Expression to validate user input.',
          examples: ['int(this.value) > 1 && int(this.value) <= 150', 'count(this.value) < 300'],
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description:
            "Property to store collected information. Input will be skipped if property has value (unless 'Always prompt' is true).",
          examples: ['$birthday', 'user.name', 'conversation.issueTitle', 'dialog.favColor'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default value',
          description: 'Expression to examine on each turn of the conversation as possible value to the property.',
          examples: ['@userName', 'coalesce(@number, @partySize)'],
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always prompt',
          description: "Collect information even if the specified 'property' is not empty.",
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          $role: 'expression',
          type: 'string',
          title: 'Allow Interruptions',
          description:
            'A boolean expression that determines whether the parent should be allowed to interrupt the input.',
          default: 'true',
          examples: ['true'],
        },
        defaultLocale: {
          type: 'string',
          title: 'Default locale',
          description: 'Default locale.',
          default: 'en-us',
        },
      },
    },
    'Microsoft.DebugBreak': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Debugger break',
      description: 'If debugger is attached, stop the execution at this point in the conversation.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.DebugBreak),
      },
    },
    'Microsoft.DeleteProperty': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Delete Property',
      description: 'Delete a property and any value it holds.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.DeleteProperty),
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property to delete.',
          type: 'string',
        },
      },
    },
    'Microsoft.DimensionEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Dimension Entity Recognizer',
      description: 'Recognizer which recognizes dimension.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.DimensionEntityRecognizer),
      },
    },
    'Microsoft.EditActions': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Edit actions.',
      description: 'Edit the current list of actions.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.EditActions),
        changeType: {
          type: 'string',
          title: 'Type of change',
          description: 'Type of change to apply to the current actions.',
          enum: ['InsertActions', 'InsertActionsBeforeTags', 'AppendActions', 'EndSequence', 'ReplaceSequence'],
        },
        actions: {
          type: 'array',
          title: 'Actions',
          description: 'Actions to apply.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.EditArray': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Edit array',
      description: 'Modify an array in memory',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.EditArray),
        changeType: {
          type: 'string',
          title: 'Type of change',
          description: 'Type of change to the array in memory.',
          enum: ['Push', 'Pop', 'Take', 'Remove', 'Clear'],
        },
        itemsProperty: {
          $role: 'expression',
          title: 'Items property',
          description: 'Property that holds the array to update.',
          type: 'string',
        },
        resultProperty: {
          $role: 'expression',
          title: 'Result Property',
          description: 'Property to store the result of this action.',
          type: 'string',
        },
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'New value or expression.',
          examples: ["'milk'", 'dialog.favColor', "dialog.favColor == 'red'"],
          type: 'string',
        },
      },
    },
    'Microsoft.EmailEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Email Entity Recognizer',
      description: 'Recognizer which recognizes email.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.EmailEntityRecognizer),
      },
    },
    'Microsoft.EmitEvent': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Emit a custom event',
      description: 'Emit an event. Capture this event with a trigger.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.EmitEvent),
        eventName: {
          title: 'Event Name',
          description: 'The name of event to emit',
          type: 'string',
          // TODO support anyOf
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
          title: 'Event value',
          description: 'Value to emit with the event (optional).',
          additionalProperties: true,
        },
        bubbleEvent: {
          type: 'boolean',
          title: 'Bubble event',
          description: 'If true this event is passed on to parent dialogs.',
        },
      },
    },
    'Microsoft.EndDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'End dialog',
      description: 'End this dialog.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.EndDialog),
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'Result value returned to the parent dialog.',
          examples: ['dialog.userName', "'tomato'"],
          type: 'string',
        },
      },
    },
    'Microsoft.EndTurn': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'End turn',
      description: 'End the current turn without ending the dialog.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.EndTurn),
      },
    },
    'Microsoft.EntityRecognizers': {
      $role: 'unionType',
      title: 'Entity Recognizers',
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
          title: 'Microsoft.RegExEntityRecognizer',
          description: 'Recognizer which recognizes patterns of input based on regex.',
          $ref: '#/definitions/Microsoft.RegExEntityRecognizer',
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
    'Microsoft.FirstSelector': {
      $role: 'unionType(Microsoft.ITriggerSelector)',
      title: 'First Trigger Selector',
      description: 'Selector for first true rule',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.FirstSelector),
      },
    },
    'Microsoft.Foreach': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'For each item',
      description: 'Execute actions on each item in an a collection.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.Foreach),
        itemsProperty: {
          $role: 'expression',
          title: 'Items property',
          description: 'Property that holds the array.',
          examples: ['user.todoList'],
          type: 'string',
        },
        actions: {
          type: 'array',
          title: 'Actions',
          description:
            "Actions to execute for each item. Use '$foreach.value' to access the value of each item. Use '$foreach.index' to access the index of each item.",
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.ForeachPage': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'For each page',
      description: 'Execute actions on each page (collection of items) in an array.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.ForeachPage),
        itemsProperty: {
          $role: 'expression',
          title: 'Items property',
          description: 'Property that holds the array.',
          examples: ['user.todoList'],
          type: 'string',
        },
        actions: {
          type: 'array',
          title: 'Actions',
          description: "Actions to execute for each page. Use '$foreach.page' to access each page.",
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        pageSize: {
          type: 'integer',
          title: 'Page size',
          description: 'Number of items in each page.',
          default: 10,
        },
      },
    },
    'Microsoft.GuidEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Guid Entity Recognizer',
      description: 'Recognizer which recognizes guids.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.GuidEntityRecognizer),
      },
    },
    'Microsoft.HashtagEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Hashtag Entity Recognizer',
      description: 'Recognizer which recognizes Hashtags.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.HashtagEntityRecognizer),
      },
    },
    'Microsoft.HttpRequest': {
      $role: 'unionType(Microsoft.IDialog)',
      type: 'object',
      title: 'HTTP request',
      description: 'Make a HTTP request.',
      properties: {
        ...$properties(SDKTypes.HttpRequest),
        method: {
          type: 'string',
          title: 'HTTP method',
          description: 'HTTP method to use.',
          enum: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
          examples: ['GET', 'POST'],
        },
        url: {
          type: 'string',
          title: 'Url',
          description: 'URL to call (supports data binding).',
          examples: ['https://contoso.com'],
        },
        body: {
          type: 'object',
          title: 'Body',
          description: 'Body to include in the HTTP call (supports data binding).',
          additionalProperties: true,
        },
        resultProperty: {
          $role: 'expression',
          title: 'Result property',
          description:
            'Property to store the result of this action. The result includes 4 properties from the http response: statusCode, reasonPhrase, content and headers. If the content is json it will be a deserialized object.',
          examples: ['dialog.contosodata'],
          type: 'string',
        },
        headers: {
          type: 'object',
          additionalProperties: true,
          title: 'Headers',
          description: 'One or more headers to include in the request (supports data binding).',
        },
        responseType: {
          type: 'string',
          title: 'Response type',
          description:
            "Defines the type of HTTP response. Automatically calls the 'Send a response' action if set to 'Activity' or 'Activities'.",
          enum: ['None', 'Json', 'Activity', 'Activities'],
          default: 'Json',
        },
      },
    },
    'Microsoft.IActivityTemplate': {
      title: 'Microsoft ActivityTemplate',
      description: 'String used for language generation',
      $role: 'unionType',
      type: 'string',
      //   oneOf: [
      //     {
      //       title: 'Microsoft.ActivityTemplate',
      //       description: '',
      //       $ref: '#/definitions/Microsoft.ActivityTemplate',
      //     },
      //     {
      //       title: 'Microsoft.StaticActivityTemplate',
      //       description: 'This allows you to define a static Activity object',
      //       $ref: '#/definitions/Microsoft.StaticActivityTemplate',
      //     },
      //     {
      //       type: 'string',
      //       title: 'string',
      //     },
      //   ],
    },
    'Microsoft.IDialog': {
      title: 'Microsoft Dialogs',
      description: 'Union of components which implement the Dialog contract',
      $role: 'unionType',
      oneOf: [
        {
          title: 'Microsoft.AdaptiveDialog',
          description: 'Flexible, data driven dialog that can adapt to the conversation.',
          $ref: '#/definitions/Microsoft.AdaptiveDialog',
        },
        {
          title: 'Microsoft.AttachmentInput',
          description: 'Collect information - Ask for a file or image.',
          $ref: '#/definitions/Microsoft.AttachmentInput',
        },
        {
          title: 'Microsoft.BeginDialog',
          description: 'Begin another dialog.',
          $ref: '#/definitions/Microsoft.BeginDialog',
        },
        {
          title: 'Microsoft.CancelAllDialogs',
          description:
            'Cancel all active dialogs. All dialogs in the dialog chain will need a trigger to capture the event configured in this action.',
          $ref: '#/definitions/Microsoft.CancelAllDialogs',
        },
        {
          title: 'Microsoft.ChoiceInput',
          description: 'Collect information - Pick from a list of choices',
          $ref: '#/definitions/Microsoft.ChoiceInput',
        },
        {
          title: 'Microsoft.ConfirmInput',
          description: 'Collect information - Ask for confirmation (yes or no).',
          $ref: '#/definitions/Microsoft.ConfirmInput',
        },
        {
          title: 'Microsoft.DateTimeInput',
          description: 'Collect information - Ask for date and/ or time',
          $ref: '#/definitions/Microsoft.DateTimeInput',
        },
        {
          title: 'Microsoft.DebugBreak',
          description: 'If debugger is attached, stop the execution at this point in the conversation.',
          $ref: '#/definitions/Microsoft.DebugBreak',
        },
        {
          title: 'Microsoft.DeleteProperty',
          description: 'Delete a property and any value it holds.',
          $ref: '#/definitions/Microsoft.DeleteProperty',
        },
        {
          title: 'Microsoft.EditActions',
          description: 'Edit the current list of actions.',
          $ref: '#/definitions/Microsoft.EditActions',
        },
        {
          title: 'Microsoft.EditArray',
          description: 'Modify an array in memory',
          $ref: '#/definitions/Microsoft.EditArray',
        },
        {
          title: 'Microsoft.EmitEvent',
          description: 'Emit an event. Capture this event with a trigger.',
          $ref: '#/definitions/Microsoft.EmitEvent',
        },
        {
          title: 'Microsoft.EndDialog',
          description: 'End this dialog.',
          $ref: '#/definitions/Microsoft.EndDialog',
        },
        {
          title: 'Microsoft.EndTurn',
          description: 'End the current turn without ending the dialog.',
          $ref: '#/definitions/Microsoft.EndTurn',
        },
        {
          title: 'Microsoft.Foreach',
          description: 'Execute actions on each item in an a collection.',
          $ref: '#/definitions/Microsoft.Foreach',
        },
        {
          title: 'Microsoft.ForeachPage',
          description: 'Execute actions on each page (collection of items) in an array.',
          $ref: '#/definitions/Microsoft.ForeachPage',
        },
        {
          title: 'Microsoft.HttpRequest',
          description: 'Make a HTTP request.',
          $ref: '#/definitions/Microsoft.HttpRequest',
        },
        {
          title: 'Microsoft.IfCondition',
          description: 'Two-way branch the conversation flow based on a condition.',
          $ref: '#/definitions/Microsoft.IfCondition',
        },
        {
          title: 'Microsoft.InitProperty',
          description: 'Define and initialize a property to be an array or object.',
          $ref: '#/definitions/Microsoft.InitProperty',
        },
        {
          title: 'Microsoft.LogAction',
          description:
            'Log a message to the host application. Send a TraceActivity to Bot Framework Emulator (optional).',
          $ref: '#/definitions/Microsoft.LogAction',
        },
        {
          title: 'Microsoft.NumberInput',
          description: 'Collect information - Ask for a number.',
          $ref: '#/definitions/Microsoft.NumberInput',
        },
        {
          title: 'Microsoft.OAuthInput',
          description: 'Collect login information.',
          $ref: '#/definitions/Microsoft.OAuthInput',
        },
        {
          title: 'Microsoft.QnAMakerDialog',
          description: 'Dialog which uses QnAMAker knowledge base to answer questions.',
          $ref: '#/definitions/Microsoft.QnAMakerDialog',
        },
        {
          title: 'Microsoft.RepeatDialog',
          description: 'Repeat current dialog.',
          $ref: '#/definitions/Microsoft.RepeatDialog',
        },
        {
          title: 'Microsoft.ReplaceDialog',
          description: 'Replace current dialog with another dialog.',
          $ref: '#/definitions/Microsoft.ReplaceDialog',
        },
        {
          title: 'Microsoft.SendActivity',
          description: 'Respond with an activity.',
          $ref: '#/definitions/Microsoft.SendActivity',
        },
        {
          title: 'Microsoft.SetProperty',
          description: 'Set property to a value.',
          $ref: '#/definitions/Microsoft.SetProperty',
        },
        {
          title: 'Microsoft.SwitchCondition',
          description: 'Execute different actions based on the value of a property.',
          $ref: '#/definitions/Microsoft.SwitchCondition',
        },
        {
          title: 'Microsoft.TextInput',
          description: 'Collection information - Ask for a word or sentence.',
          $ref: '#/definitions/Microsoft.TextInput',
        },
        {
          title: 'Microsoft.TraceActivity',
          description: 'Send a trace activity to the transcript logger and/ or Bot Framework Emulator.',
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
        {
          title: 'Microsoft.MultiLanguageRecognizer',
          description: 'Configure one recognizer per language and the specify the language fallback policy.',
          $ref: '#/definitions/Microsoft.MultiLanguageRecognizer',
        },
        {
          title: 'Microsoft.RegexRecognizer',
          description: 'Use regular expressions to recognize intents and entities from user input.',
          $ref: '#/definitions/Microsoft.RegexRecognizer',
        },
        {
          type: 'string',
          title: 'string',
        },
      ],
    },
    'Microsoft.ITextTemplate': {
      title: 'Microsoft TextTemplate',
      description: 'Union of components which implement the TextTemplate',
      $role: 'unionType',
      oneOf: [
        {
          title: 'Microsoft.TextTemplate',
          description: 'Lg tempalte to evaluate to create text',
          $ref: '#/definitions/Microsoft.TextTemplate',
        },
        {
          type: 'string',
          title: 'string',
        },
      ],
    },
    'Microsoft.ITriggerCondition': {
      $role: 'unionType',
      title: 'Microsoft Triggers',
      description: 'Union of components which implement the OnCondition',
      oneOf: [
        {
          title: 'Microsoft.OnActivity',
          description: 'Actions to perform on receipt of a generic activity.',
          $ref: '#/definitions/Microsoft.OnActivity',
        },
        {
          title: 'Microsoft.OnBeginDialog',
          description: 'Actions to perform when this dialog begins.',
          $ref: '#/definitions/Microsoft.OnBeginDialog',
        },
        {
          title: 'Microsoft.OnCancelDialog',
          description: 'Actions to perform on cancel dialog event.',
          $ref: '#/definitions/Microsoft.OnCancelDialog',
        },
        {
          title: 'Microsoft.OnCondition',
          description: 'Actions to perform when specified condition is true.',
          $ref: '#/definitions/Microsoft.OnCondition',
        },
        {
          title: 'Microsoft.OnConversationUpdateActivity',
          description: "Actions to perform on receipt of an activity with type 'ConversationUpdate'.",
          $ref: '#/definitions/Microsoft.OnConversationUpdateActivity',
        },
        {
          title: 'Microsoft.OnCustomEvent',
          description:
            "Actions to perform when a custom event is detected. Use 'Emit a custom event' action to raise a custom event.",
          $ref: '#/definitions/Microsoft.OnCustomEvent',
        },
        {
          title: 'Microsoft.OnDialogEvent',
          description: 'Actions to perform when a specific dialog event occurs.',
          $ref: '#/definitions/Microsoft.OnDialogEvent',
        },
        {
          title: 'Microsoft.OnEndOfConversationActivity',
          description: "Actions to perform on receipt of an activity with type 'EndOfConversation'.",
          $ref: '#/definitions/Microsoft.OnEndOfConversationActivity',
        },
        {
          title: 'Microsoft.OnError',
          description: "Action to perform when an 'Error' dialog event occurs.",
          $ref: '#/definitions/Microsoft.OnError',
        },
        {
          title: 'Microsoft.OnEventActivity',
          description: "Actions to perform on receipt of an activity with type 'Event'.",
          $ref: '#/definitions/Microsoft.OnEventActivity',
        },
        {
          title: 'Microsoft.OnHandoffActivity',
          description: "Actions to perform on receipt of an activity with type 'HandOff'.",
          $ref: '#/definitions/Microsoft.OnHandoffActivity',
        },
        {
          title: 'Microsoft.OnIntent',
          description: 'Actions to perform when specified intent is recognized.',
          $ref: '#/definitions/Microsoft.OnIntent',
        },
        {
          title: 'Microsoft.OnInvokeActivity',
          description: "Actions to perform on receipt of an activity with type 'Invoke'.",
          $ref: '#/definitions/Microsoft.OnInvokeActivity',
        },
        {
          title: 'Microsoft.OnMessageActivity',
          description: "Actions to perform on receipt of an activity with type 'Message'. Overrides Intent trigger.",
          $ref: '#/definitions/Microsoft.OnMessageActivity',
        },
        {
          title: 'Microsoft.OnMessageDeleteActivity',
          description: "Actions to perform on receipt of an activity with type 'MessageDelete'.",
          $ref: '#/definitions/Microsoft.OnMessageDeleteActivity',
        },
        {
          title: 'Microsoft.OnMessageReactionActivity',
          description: "Actions to perform on receipt of an activity with type 'MessageReaction'.",
          $ref: '#/definitions/Microsoft.OnMessageReactionActivity',
        },
        {
          title: 'Microsoft.OnMessageUpdateActivity',
          description: "Actions to perform on receipt of an activity with type 'MessageUpdate'.",
          $ref: '#/definitions/Microsoft.OnMessageUpdateActivity',
        },
        {
          title: 'Microsoft.OnRepromptDialog',
          description: "Actions to perform when 'RepromptDialog' event occurs.",
          $ref: '#/definitions/Microsoft.OnRepromptDialog',
        },
        {
          title: 'Microsoft.OnTypingActivity',
          description: "Actions to perform on receipt of an activity with type 'Typing'.",
          $ref: '#/definitions/Microsoft.OnTypingActivity',
        },
        {
          title: 'Microsoft.OnUnknownIntent',
          description:
            "Action to perform when user input is unrecognized and if none of the 'on intent recognition' triggers match recognized intent.",
          $ref: '#/definitions/Microsoft.OnUnknownIntent',
        },
      ],
    },
    'Microsoft.ITriggerSelector': {
      $role: 'unionType',
      title: 'Selectors',
      description: 'Union of components which are trigger selectors',
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
          description: 'Select most specific true events with optional additional selector',
          $ref: '#/definitions/Microsoft.MostSpecificSelector',
        },
        {
          title: 'Microsoft.RandomSelector',
          description: 'Select most specific true rule',
          $ref: '#/definitions/Microsoft.RandomSelector',
        },
        {
          title: 'Microsoft.TrueSelector',
          description: 'Selector for all true events',
          $ref: '#/definitions/Microsoft.TrueSelector',
        },
      ],
    },
    'Microsoft.IfCondition': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'If condition',
      description: 'Two-way branch the conversation flow based on a condition.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.IfCondition),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Expression to evaluate.',
          examples: ['user.age > 3'],
          type: 'string',
        },
        actions: {
          type: 'array',
          title: 'Actions',
          description: 'Actions to execute if condition is true.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        elseActions: {
          type: 'array',
          title: 'Else',
          description: 'Actions to execute if condition is false.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.InitProperty': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Initialize property',
      description: 'Define and initialize a property to be an array or object.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.InitProperty),
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property (named location to store information).',
          examples: ['user.age'],
          type: 'string',
        },
        type: {
          type: 'string',
          title: 'Type',
          description: 'Type of value.',
          enum: ['object', 'array'],
        },
      },
    },
    'Microsoft.IpEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Ip Entity Recognizer',
      description: 'Recognizer which recognizes internet IP patterns (like 192.1.1.1).',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.IpEntityRecognizer),
      },
    },
    'Microsoft.LanguagePolicy': {
      $role: 'unionType(Microsoft.ILanguagePolicy)',
      title: 'Language Policy',
      description: 'This represents a policy map for locales lookups to use for language',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.LanguagePolicy),
      },
    },
    'Microsoft.LogAction': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Log to console',
      description: 'Log a message to the host application. Send a TraceActivity to Bot Framework Emulator (optional).',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.LogAction),
        text: {
          type: 'string',
          title: 'Text',
          description: 'Information to log.',
        },
        traceActivity: {
          type: 'boolean',
          title: 'Send Trace Activity',
          description: 'If true, automatically sends a TraceActivity (view in Bot Framework Emulator).',
          default: false,
        },
      },
    },
    'Microsoft.LuisRecognizer': {
      $role: 'unionType(Microsoft.IRecognizer)',
      title: 'LUIS Recognizer',
      description: 'LUIS recognizer.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.LuisRecognizer),
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
    },
    'Microsoft.MentionEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Mentions Entity Recognizer',
      description: 'Recognizer which recognizes @Mentions',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.MentionEntityRecognizer),
      },
    },
    'Microsoft.MostSpecificSelector': {
      $role: 'unionType(Microsoft.ITriggerSelector)',
      title: 'Most Specific Trigger Selector',
      description: 'Select most specific true events with optional additional selector',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.MostSpecificSelector),
        selector: {
          $type: 'Microsoft.ITriggerSelector',
          $ref: '#/definitions/Microsoft.ITriggerSelector',
        },
      },
    },
    'Microsoft.MultiLanguageRecognizer': {
      $role: 'unionType(Microsoft.IRecognizer)',
      title: 'Multi-language recognizer',
      description: 'Configure one recognizer per language and the specify the language fallback policy.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.MultiLanguageRecognizer),
        languagePolicy: {
          $type: 'Microsoft.LanguagePolicy',
          type: 'object',
          title: 'Language policy',
          description: 'Defines fall back languages to try per user input language.',
          $ref: '#/definitions/Microsoft.LanguagePolicy',
        },
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
    },
    'Microsoft.NumberEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Number Entity Recognizer',
      description: 'Recognizer which recognizes numbers.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.NumberEntityRecognizer),
      },
    },
    'Microsoft.NumberInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Number input dialog',
      description: 'Collect information - Ask for a number.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.NumberInput),
        id: {
          type: 'string',
          title: 'Id',
          description: 'Optional dialog ID.',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial prompt',
          description: 'Message to send to collect information.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized prompt',
          description: 'Message to send if user response is not recognized.',
          examples: ["Sorry, I do not understand '{turn.activity.text'}. Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid prompt',
          description: 'Message to send if user response is invalid. Relies on specified validation expressions.',
          examples: ["Sorry, '{this.value}' does not work. I need a number between 1-150. What is your age?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default value response',
          description:
            'Message to send when max turn count (if specified) has been exceeded and the default value is selected as the value.',
          examples: [
            "Sorry, I'm having trouble understanding you. I will just use {this.options.defaultValue} for now. You can say 'I'm 36 years old' to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max turn count',
          description: 'Maximum number of re-prompt attempts to collect information.',
          default: 3,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation expressions',
          description: 'Expression to validate user input.',
          examples: ['int(this.value) > 1 && int(this.value) <= 150', 'count(this.value) < 300'],
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description:
            "Property to store collected information. Input will be skipped if property has value (unless 'Always prompt' is true).",
          examples: ['$birthday', 'user.name', 'conversation.issueTitle', 'dialog.favColor'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default value',
          description: 'Expression to examine on each turn of the conversation as possible value to the property.',
          examples: ['@userName', 'coalesce(@number, @partySize)'],
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always prompt',
          description: "Collect information even if the specified 'property' is not empty.",
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          $role: 'expression',
          type: 'string',
          title: 'Allow Interruptions',
          description:
            'A boolean expression that determines whether the parent should be allowed to interrupt the input.',
          default: 'true',
          examples: ['true'],
        },
        outputFormat: {
          type: 'string',
          enum: ['float', 'integer'],
          title: 'Output format',
          description: 'Number output format.',
          default: 'float',
        },
        defaultLocale: {
          type: 'string',
          title: 'Default locale',
          description: 'Default locale.',
          default: 'en-us',
        },
      },
    },
    'Microsoft.NumberRangeEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'NumberRange Entity Recognizer',
      description: 'Recognizer which recognizes ranges of numbers (Example:2 to 5).',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.NumberRangeEntityRecognizer),
      },
    },
    'Microsoft.OAuthInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'OAuthInput Dialog',
      description: 'Collect login information.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OAuthInput),
        connectionName: {
          type: 'string',
          title: 'Connection name',
          description: 'The connection name configured in Azure Web App Bot OAuth settings.',
          examples: ['msgraphOAuthConnection'],
        },
        text: {
          type: 'string',
          title: 'Text',
          description: 'Text shown in the OAuth signin card.',
          examples: ['Please sign in.'],
        },
        title: {
          type: 'string',
          title: 'Title',
          description: 'Title shown in the OAuth signin card.',
          examples: ['Login'],
        },
        timeout: {
          type: 'integer',
          title: 'Timeout',
          description: 'Time out setting for the OAuth signin card.',
          default: '900000',
        },
        tokenProperty: {
          $role: 'expression',
          title: 'Token property',
          description: 'Property to store the OAuth token result.',
          examples: ['dialog.token'],
          type: 'string',
        },
      },
    },
    'Microsoft.OnActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On activity',
      description: 'Actions to perform on receipt of a generic activity.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        type: {
          type: 'string',
          title: 'Activity type',
          description: 'The Activity.Type to match',
        },
      },
    },
    'Microsoft.OnBeginDialog': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On begin dialog',
      description: 'Actions to perform when this dialog begins.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnBeginDialog),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnCancelDialog': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On cancel dialog',
      description: 'Actions to perform on cancel dialog event.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnCancelDialog),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnCondition': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On condition',
      description: 'Actions to perform when specified condition is true.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnCondition),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnConversationUpdateActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On ConversationUpdate activity',
      description: "Actions to perform on receipt of an activity with type 'ConversationUpdate'.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnConversationUpdateActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnCustomEvent': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On custom event',
      description:
        "Actions to perform when a custom event is detected. Use 'Emit a custom event' action to raise a custom event.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnCustomEvent),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        event: {
          type: 'string',
          title: 'Custom event name',
          description: 'Name of the custom event.',
        },
      },
    },
    'Microsoft.OnDialogEvent': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On dialog event',
      description: 'Actions to perform when a specific dialog event occurs.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnDialogEvent),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        event: {
          type: 'string',
          title: 'Dialog event name',
          description: 'Name of dialog event.',
          enum: [
            'beginDialog',
            'resumeDialog',
            'repromptDialog',
            'cancelDialog',
            'endDialog',
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
    'Microsoft.OnEndOfConversationActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On EndOfConversation activity',
      description: "Actions to perform on receipt of an activity with type 'EndOfConversation'.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnEndOfConversationActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnError': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On Error',
      description: "Action to perform when an 'Error' dialog event occurs.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnError),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnEventActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On Event activity',
      description: "Actions to perform on receipt of an activity with type 'Event'.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnEventActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnHandoffActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On Handoff activity',
      description: "Actions to perform on receipt of an activity with type 'HandOff'.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnHandoffActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnIntent': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On intent recognition',
      description: 'Actions to perform when specified intent is recognized.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnIntent),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        intent: {
          type: 'string',
          title: 'Intent',
          description: 'Name of intent.',
        },
        entities: {
          type: 'array',
          title: 'Entities',
          description: 'Required entities.',
          items: {
            type: 'string',
          },
        },
      },
    },
    'Microsoft.OnInvokeActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On Invoke activity',
      description: "Actions to perform on receipt of an activity with type 'Invoke'.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnInvokeActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnMessageActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On Message activity',
      description: "Actions to perform on receipt of an activity with type 'Message'. Overrides Intent trigger.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnMessageActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnMessageDeleteActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On MessageDelete activity',
      description: "Actions to perform on receipt of an activity with type 'MessageDelete'.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnMessageDeleteActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnMessageReactionActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On MessageReaction activity',
      description: "Actions to perform on receipt of an activity with type 'MessageReaction'.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnMessageReactionActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnMessageUpdateActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On MessageUpdate activity',
      description: "Actions to perform on receipt of an activity with type 'MessageUpdate'.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnMessageUpdateActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnRepromptDialog': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On RepromptDialog',
      description: "Actions to perform when 'RepromptDialog' event occurs.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnRepromptDialog),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnTypingActivity': {
      $role: 'unionType(Microsoft.ITriggerCondition)',
      title: 'On Typing activity',
      description: "Actions to perform on receipt of an activity with type 'Typing'.",
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OnTypingActivity),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OnUnknownIntent': {
      title: 'On unknown intent',
      description:
        "Action to perform when user input is unrecognized and if none of the 'on intent recognition' triggers match recognized intent.",
      type: 'object',
      $role: 'unionType(Microsoft.ITriggerCondition)',
      properties: {
        ...$properties(SDKTypes.OnUnknownIntent),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Condition (expression).',
          examples: ['user.vip == true'],
          type: 'string',
        },
        actions: {
          type: 'array',
          description: 'Sequence of actions to execute.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.OrdinalEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Ordinal Entity Recognizer',
      description: 'Recognizer which recognizes ordinals (example: first, second, 3rd).',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.OrdinalEntityRecognizer),
      },
    },
    'Microsoft.PercentageEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Percentage Entity Recognizer',
      description: 'Recognizer which recognizes percentages.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.PercentageEntityRecognizer),
      },
    },
    'Microsoft.PhoneNumberEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Phone Number Entity Recognizer',
      description: 'Recognizer which recognizes phone numbers.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.PhoneNumberEntityRecognizer),
      },
    },
    'Microsoft.QnAMakerDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'QnAMaker Dialog',
      description: 'Dialog which uses QnAMAker knowledge base to answer questions.',
      type: 'object',
      additionalProperties: false,
      properties: {
        ...$properties(SDKTypes.QnAMakerDialog),
        knowledgeBaseId: {
          $role: 'expression',
          title: 'KnowledgeBase Id',
          description: 'KnowledgeBase Id of your QnA Maker KnowledgeBase.',
          default: 'settings.qna.knowledgebaseid',
          type: 'string',
        },
        endpointKey: {
          $role: 'expression',
          title: 'Endpoint Key',
          description: 'Endpoint key for the QnA Maker KB.',
          default: 'settings.qna.endpointkey',
          type: 'string',
        },
        hostname: {
          $role: 'expression',
          title: 'Hostname',
          description: 'Hostname for your QnA Maker service.',
          default: 'settings.qna.hostname',
          examples: ['https://yourserver.azurewebsites.net/qnamaker'],
          type: 'string',
        },
        noAnswer: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Fallback answer',
          description: 'Default answer to return when none found in KB.',
          default: 'Sorry, I did not find an answer.',
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        threshold: {
          type: 'number',
          title: 'Threshold',
          description: 'Threshold score to filter results.',
          default: 0.3,
        },
        activeLearningCardTitle: {
          type: 'string',
          title: 'Active learning card title',
          description: 'Title for active learning suggestions card.',
          default: 'Did you mean:',
        },
        cardNoMatchText: {
          type: 'string',
          title: 'Card no match text',
          description: 'Text for no match option.',
          default: 'None of the above.',
        },
        cardNoMatchResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Card no match response',
          description: 'Custom response when no match option was selected.',
          default: 'Thanks for the feedback.',
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        strictFilters: {
          type: 'array',
          title: 'Strict Filter Property',
          description: 'Memory property that holds strict filters to use when calling the QnA Maker KB.',
          items: {
            type: 'object',
          },
        },
      },
    },
    'Microsoft.RandomSelector': {
      $role: 'unionType(Microsoft.ITriggerSelector)',
      title: 'Random rule selector',
      description: 'Select most specific true rule',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.RandomSelector),
        seed: {
          type: 'integer',
        },
      },
    },
    'Microsoft.RegExEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Regex Entity Recognizer',
      description: 'Recognizer which recognizes patterns of input based on regex.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.RegExEntityRecognizer),
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
    },
    'Microsoft.RegexRecognizer': {
      $role: 'unionType(Microsoft.IRecognizer)',
      title: 'Regex recognizer',
      description: 'Use regular expressions to recognize intents and entities from user input.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.RegexRecognizer),
        intents: {
          type: 'array',
          title: 'RegEx patterns to intents',
          description: 'Collection of patterns to match for an intent.',
          items: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                title: 'Intent',
                description: 'The intent name.',
              },
              pattern: {
                type: 'string',
                title: 'Pattern',
                description: 'The regular expression pattern.',
              },
            },
          },
        },
        entities: {
          type: 'array',
          title: 'Entity recognizers',
          description: 'Collection of entity recognizers to use.',
          items: {
            $type: 'Microsoft.EntityRecognizers',
            $ref: '#/definitions/Microsoft.EntityRecognizers',
          },
        },
      },
    },
    'Microsoft.RepeatDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      type: 'object',
      title: 'Repeat dialog',
      description: 'Repeat current dialog.',
      properties: {
        ...$properties(SDKTypes.RepeatDialog),
      },
    },
    'Microsoft.ReplaceDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      type: 'object',
      title: 'Replace dialog',
      description: 'Replace current dialog with another dialog.',
      properties: {
        ...$properties(SDKTypes.ReplaceDialog),
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog',
          description: 'Current dialog will be replaced by this dialog.',
          type: 'string',
        },
        options: {
          type: 'object',
          title: 'Options',
          description: 'One or more options that are passed to the dialog that is called.',
          additionalProperties: true,
        },
      },
    },
    'Microsoft.SendActivity': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Send an activity',
      description: 'Respond with an activity.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.SendActivity),
        activity: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Activity',
          description: 'Activity to send.',
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
      },
    },
    'Microsoft.SetProperty': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Set property',
      description: 'Set property to a value.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.SetProperty),
        property: {
          $role: 'expression',
          title: 'Property',
          description: 'Property (named location to store information).',
          examples: ['user.age'],
          type: 'string',
        },
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'New value or expression.',
          examples: ["'milk'", 'dialog.favColor', "dialog.favColor == 'red'"],
          type: 'string',
        },
      },
    },
    'Microsoft.StaticActivityTemplate': {
      $role: 'unionType(Microsoft.IActivityTemplate)',
      title: 'Microsoft Static Activity Template',
      description: 'This allows you to define a static Activity object',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.StaticActivityTemplate),
        activity: {
          type: 'object',
          title: 'Activity',
          description: 'A static Activity to used',
          additionalProperties: true,
        },
      },
    },
    'Microsoft.SwitchCondition': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Switch condition',
      description: 'Execute different actions based on the value of a property.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.SwitchCondition),
        condition: {
          $role: 'expression',
          title: 'Condition',
          description: 'Property to evaluate.',
          examples: ['user.favColor'],
          type: 'string',
        },
        cases: {
          type: 'array',
          title: 'Cases',
          description: 'Actions for each possible condition.',
          items: {
            type: 'object',
            required: ['value', 'case'],
            properties: {
              value: {
                $role: 'expression',
                title: 'Value',
                description: 'Value.',
                examples: ["'red'", 'dialog.colors.red'],
                type: 'string',
              },
              actions: {
                type: 'array',
                title: 'Actions',
                description: 'Actions to execute.',
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
          description: 'Actions to execute if none of the cases meet the condition.',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
    },
    'Microsoft.TemperatureEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Temperature Entity Recognizer',
      description: 'Recognizer which recognizes temperatures.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.TemperatureEntityRecognizer),
      },
    },
    'Microsoft.TextInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Text input dialog',
      description: 'Collection information - Ask for a word or sentence.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.TextInput),
        id: {
          type: 'string',
          title: 'Id',
          description: 'Optional dialog ID.',
        },
        prompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial prompt',
          description: 'Message to send to collect information.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        unrecognizedPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Unrecognized prompt',
          description: 'Message to send if user response is not recognized.',
          examples: ["Sorry, I do not understand '{turn.activity.text'}. Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        invalidPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Invalid prompt',
          description: 'Message to send if user response is invalid. Relies on specified validation expressions.',
          examples: ["Sorry, '{this.value}' does not work. I need a number between 1-150. What is your age?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        defaultValueResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Default value response',
          description:
            'Message to send when max turn count (if specified) has been exceeded and the default value is selected as the value.',
          examples: [
            "Sorry, I'm having trouble understanding you. I will just use {this.options.defaultValue} for now. You can say 'I'm 36 years old' to change it.",
          ],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        maxTurnCount: {
          type: 'integer',
          title: 'Max turn count',
          description: 'Maximum number of re-prompt attempts to collect information.',
          default: 3,
          examples: [3],
        },
        validations: {
          type: 'array',
          title: 'Validation expressions',
          description: 'Expression to validate user input.',
          examples: ['int(this.value) > 1 && int(this.value) <= 150', 'count(this.value) < 300'],
          items: {
            $role: 'expression',
            type: 'string',
            description: 'String must contain an expression.',
          },
        },
        property: {
          $role: 'expression',
          title: 'Property',
          description:
            "Property to store collected information. Input will be skipped if property has value (unless 'Always prompt' is true).",
          examples: ['$birthday', 'user.name', 'conversation.issueTitle', 'dialog.favColor'],
          type: 'string',
        },
        defaultValue: {
          $role: 'expression',
          title: 'Default value',
          description: 'Expression to examine on each turn of the conversation as possible value to the property.',
          examples: ['@userName', 'coalesce(@number, @partySize)'],
          type: 'string',
        },
        alwaysPrompt: {
          type: 'boolean',
          title: 'Always prompt',
          description: "Collect information even if the specified 'property' is not empty.",
          default: false,
          examples: [false],
        },
        allowInterruptions: {
          $role: 'expression',
          type: 'string',
          title: 'Allow Interruptions',
          description:
            'A boolean expression that determines whether the parent should be allowed to interrupt the input.',
          default: 'true',
          examples: ['true'],
        },
        outputFormat: {
          type: 'string',
          enum: ['none', 'trim', 'lowercase', 'uppercase'],
          title: 'Output format',
          description: 'Format of output.',
          default: 'none',
        },
      },
    },
    'Microsoft.TextTemplate': {
      $role: 'unionType(Microsoft.ITextTemplate)',
      title: 'Microsoft TextTemplate',
      description: 'Lg tempalte to evaluate to create text',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.TextTemplate),
        template: {
          title: 'Template',
          Description: 'Language Generator template to evaluate to create the text',
          type: 'string',
        },
      },
    },
    'Microsoft.TraceActivity': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Send a TraceActivity',
      description: 'Send a trace activity to the transcript logger and/ or Bot Framework Emulator.',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.TraceActivity),
        name: {
          type: 'string',
          title: 'Name',
          description: 'Name of the trace activity',
        },
        valueType: {
          type: 'string',
          title: 'Value type',
          description: 'Type of value',
        },
        value: {
          $role: 'expression',
          title: 'Value',
          description: 'Property that holds the value to send as trace activity.',
          type: 'string',
        },
      },
    },
    'Microsoft.TrueSelector': {
      $role: 'unionType(Microsoft.ITriggerSelector)',
      title: 'True Trigger Selector',
      description: 'Selector for all true events',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.TrueSelector),
      },
    },
    'Microsoft.UrlEntityRecognizer': {
      $role: 'unionType(Microsoft.EntityRecognizers)',
      title: 'Url Entity Recognizer',
      description: 'Recognizer which recognizes urls (example: http://bing.com)',
      type: 'object',
      properties: {
        ...$properties(SDKTypes.UrlEntityRecognizer),
      },
    },
  },
};
