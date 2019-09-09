const globalFields = {
  property: {
    'ui:field': 'NullField',
  },
  inputBindings: {
    'ui:field': 'NullField',
  },
  outputBinding: {
    'ui:field': 'NullField',
  },
  id: {
    'ui:field': 'NullField',
  },
  tags: {
    'ui:field': 'NullField',
  },
};

const activityFields = {
  id: {
    'ui:field': 'NullField',
  },
  tags: {
    'ui:field': 'NullField',
  },
  prompt: {
    'ui:widget': 'TextareaWidget',
  },
  unrecognizedPrompt: {
    'ui:widget': 'TextareaWidget',
  },
  invalidPrompt: {
    'ui:widget': 'TextareaWidget',
  },
  value: {
    'ui:field': 'NullField',
  },
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
    autoEndDialog: {
      'ui:field': 'NullField',
    },
    generator: {
      'ui:field': 'NullField',
    },
    ...globalFields,
    'ui:order': ['property', 'outputBinding', 'recognizer', 'events', '*'],
  },
  'Microsoft.BeginDialog': {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
    },
    inputBindings: {
      'ui:field': 'NullField',
    },
    outputBinding: {
      'ui:field': 'NullField',
    },
  },
  'Microsoft.CodeStep': {
    codeHandler: {
      'ui:field': 'CodeField',
    },
    ...globalFields,
  },
  'Microsoft.ConditionalSelector': {
    ifFalse: {
      'ui:field': 'SelectorField',
    },
    ifTrue: {
      'ui:field': 'SelectorField',
    },
    ...globalFields,
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
    // ...globalFields,  // we do not want to exclude the property field here
    'ui:order': ['method', 'url', 'body', 'property', 'responseTypes', 'headers', '*'],
  },
  'Microsoft.IfCondition': {
    actions: {
      'ui:field': 'StepsField',
    },
    elseActions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
  },
  'Microsoft.IfPropertyRule': {
    conditionals: {
      items: {
        events: {
          'ui:field': 'RulesField',
        },
      },
    },
    ...globalFields,
  },
  'Microsoft.OnActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnBeginDialog': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnConversationUpdateActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnDialogEvent': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['events', 'constraint', '*', 'actions'],
  },
  'Microsoft.OnEndOfConversationActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnEvent': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnEventActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnHandoffActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnIntent': {
    intent: {
      'ui:widget': 'IntentWidget',
    },
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['intent', 'constraint', 'entities', '*'],
  },
  'Microsoft.OnInvokeActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnMessageActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnMessageDeleteActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnMessageReactionActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnMessageUpdateActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnTypingActivity': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.OnUnknownIntent': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['constraint', '*', 'actions'],
  },
  'Microsoft.MostSpecificSelector': {
    selector: {
      'ui:field': 'SelectorField',
    },
    ...globalFields,
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
    // ConfirmInput defaults to YES/NO. using confirmchoices is complex
    // - must provide yes/no in special format along with alternatives that have to be handled
    // TODO: Implement confirmChoices-specific widget with appropriate business events.
    confirmChoices: {
      'ui:field': 'NullField',
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
  },
  'Microsoft.ChoiceInput': {
    inputBindings: {
      'ui:field': 'NullField',
    },
    outputBinding: {
      'ui:field': 'NullField',
    },
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
    ...globalFields,
  },
  'Microsoft.Rule': {
    actions: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
  },
  'Microsoft.SwitchCondition': {
    cases: {
      'ui:field': 'CasesField',
    },
    default: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
  },
  'Microsoft.SendActivity': {
    ...globalFields,
    activity: {
      'ui:field': 'LgEditorField',
    },
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
