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
};

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
  value: {
    'ui:widget': 'NullField',
  },
};

export const uiSchema = {
  'Microsoft.AdaptiveDialog': {
    recognizer: {
      'ui:field': 'RecognizerField',
    },
    rules: {
      'ui:field': 'RulesField',
    },
    selector: {
      'ui:field': 'SelectorField',
    },
    steps: {
      'ui:field': 'StepsField',
    },
    autoEndDialog: {
      'ui:field': 'NullField',
    },
    generator: {
      'ui:field': 'NullField',
    },
    ...globalFields,
    'ui:order': ['property', 'outputBinding', 'recognizer', 'rules', 'steps', '*', 'selector'],
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
  'Microsoft.EditSteps': {
    steps: {
      'ui:field': 'StepsField',
    },
  },
  'Microsoft.ConversationUpdateActivityRule': {
    steps: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['events', 'constraint', '*', 'steps'],
  },
  'Microsoft.EventRule': {
    steps: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['events', 'constraint', '*', 'steps'],
  },
  'Microsoft.Foreach': {
    steps: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['listProperty', 'valueProperty', 'indexProperty', 'steps', '*'],
  },
  'Microsoft.ForeachPage': {
    steps: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['listProperty', 'pageSize', 'valueProperty', 'steps', '*'],
  },
  'Microsoft.HttpRequest': {
    body: {
      'ui:field': 'JsonField',
    },
    // ...globalFields,  // we do not want to exclude the property field here
    'ui:order': ['method', 'url', 'body', 'property', 'responseTypes', 'headers', '*'],
  },
  'Microsoft.IfCondition': {
    elseSteps: {
      'ui:field': 'StepsField',
    },
    steps: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
  },
  'Microsoft.IfPropertyRule': {
    conditionals: {
      items: {
        rules: {
          'ui:field': 'RulesField',
        },
      },
    },
    ...globalFields,
  },
  'Microsoft.IntentRule': {
    intent: {
      'ui:widget': 'IntentWidget',
    },
    steps: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
    'ui:order': ['intent', 'constraint', 'entities', '*'],
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
    // TODO: Implement confirmChoices-specific widget with appropriate business rules.
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
    steps: {
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
  'Microsoft.UnknownIntentRule': {
    steps: {
      'ui:field': 'StepsField',
    },
    ...globalFields,
  },
  'Microsoft.SendActivity': {
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
