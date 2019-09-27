const globalHidden = ['property', 'inputBindings', 'outputBinding', 'id', 'tags'];

const activityFields = {
  prompt: {
    'ui:widget': 'TextareaWidget',
  },
  unrecognizedPrompt: {
    'ui:widget': 'TextareaWidget',
  },
  invalidPrompt: {
    'ui:widget': 'TextareaWidget',
  },
  'ui:hidden': ['id', 'tags', 'value', 'inputBindings', 'outputBinding'],
};

export const uiSchema = {
  'Microsoft.AdaptiveDialog': {
    recognizer: {
      'ui:field': 'RecognizerField',
    },
    events: {
      'ui:field': 'RulesField',
    },
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['property', 'outputBinding', 'recognizer', 'events', '*'],
    'ui:hidden': ['autoEndDialog', 'generator', ...globalHidden],
  },
  'Microsoft.BeginDialog': {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
    },
    'ui:hidden': ['inputBindings', 'outputBinding'],
  },
  'Microsoft.CodeStep': {
    codeHandler: {
      'ui:field': 'CodeField',
    },
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.ConditionalSelector': {
    ifFalse: {
      'ui:field': 'SelectorField',
    },
    ifTrue: {
      'ui:field': 'SelectorField',
    },
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.EditActions': {
    actions: {
      'ui:field': 'StepsField',
    },
  },
  'Microsoft.Foreach': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['listProperty', 'valueProperty', 'indexProperty', 'actions', '*'],
  },
  'Microsoft.ForeachPage': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['listProperty', 'pageSize', 'valueProperty', 'actions', '*'],
  },
  'Microsoft.HttpRequest': {
    body: {
      'ui:field': 'JsonField',
    },
    'ui:order': ['method', 'url', 'body', 'property', 'responseTypes', 'headers', '*'],
  },
  'Microsoft.IfCondition': {
    actions: {
      'ui:field': 'StepsField',
    },
    elseActions: {
      'ui:field': 'StepsField',
    },
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.IfPropertyRule': {
    conditionals: {
      items: {
        events: {
          'ui:field': 'RulesField',
        },
      },
    },
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnBeginDialog': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnConversationUpdateActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnDialogEvent': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['events', 'constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnEndOfConversationActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnEvent': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnEventActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnHandoffActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnIntent': {
    intent: {
      'ui:widget': 'IntentWidget',
    },
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['intent', 'constraint', 'entities', '*'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnInvokeActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnMessageActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnMessageDeleteActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnMessageReactionActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnMessageUpdateActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnTypingActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.OnUnknownIntent': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.MostSpecificSelector': {
    selector: {
      'ui:field': 'SelectorField',
    },
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.TextInput': {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
  },
  'Microsoft.NumberInput': {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
  },
  'Microsoft.ConfirmInput': {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': [
      'prompt',
      'property',
      'style',
      'defaultLocale',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
    // ConfirmInput defaults to YES/NO. using confirmchoices is complex
    // - must provide yes/no in special format along with alternatives that have to be handled
    // TODO: Implement confirmChoices-specific widget with appropriate business events.
    'ui:hidden': ['confirmChoices'],
  },
  'Microsoft.ChoiceInput': {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    choices: {
      items: {
        value: {
          'ui:options': {
            label: false,
          },
        },
      },
    },
    ...activityFields,
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'style',
      'defaultLocale',
      'choices',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
  },
  'Microsoft.OAuthInput': {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': ['connectionName', '*'],
  },
  'Microsoft.AttachmentInput': {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
  },
  'Microsoft.ReplaceDialog': {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
    },
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.Rule': {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.SwitchCondition': {
    cases: {
      'ui:field': 'CasesField',
    },
    default: {
      'ui:field': 'StepsField',
    },
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.SendActivity': {
    activity: {
      'ui:field': 'LgEditorField',
    },
    'ui:hidden': [...globalHidden],
  },
  'Microsoft.DateTimeInput': {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    defaultValue: {
      'ui:widget': 'DateTimeWidget',
    },
  },
};
