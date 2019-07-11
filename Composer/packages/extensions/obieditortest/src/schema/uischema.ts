import {
  CasesField,
  CodeField,
  JsonField,
  RecognizerField,
  RulesField,
  SelectorField,
  StepsField,
  NullField,
  LgEditorField,
} from '../Form/fields';
import { DialogSelectWidget, TextareaWidget } from '../Form/widgets';

const globalFields = {
  property: {
    'ui:field': NullField,
  },
  inputBindings: {
    'ui:field': NullField,
  },
  outputBinding: {
    'ui:field': NullField,
  },
};

const activityFields = {
  prompt: {
    'ui:widget': TextareaWidget,
  },
  unrecognizedPrompt: {
    'ui:widget': TextareaWidget,
  },
  invalidPrompt: {
    'ui:widget': TextareaWidget,
  },
  value: {
    'ui:widget': NullField,
  },
  allowInterruptions: {
    'ui:field': NullField,
  },
};

export const uiSchema = {
  'Microsoft.AdaptiveDialog': {
    recognizer: {
      'ui:field': RecognizerField,
      'ui:title': 'Language Understanding',
      'ui:description':
        'To understand what the user says, your dialog needs a ‘Recognizer’ that includes example words and sentences that users may use.',
    },
    rules: {
      'ui:field': RulesField,
    },
    selector: {
      'ui:field': SelectorField,
    },
    steps: {
      'ui:field': StepsField,
    },
    autoEndDialog: {
      'ui:field': NullField,
    },
    ...globalFields,
    'ui:order': ['property', 'outputBinding', 'recognizer', 'rules', 'steps', '*', 'selector'],
  },
  'Microsoft.BeginDialog': {
    dialog: {
      'ui:widget': DialogSelectWidget,
    },
    ...globalFields,
  },
  'Microsoft.CodeStep': {
    codeHandler: {
      'ui:field': CodeField,
    },
    ...globalFields,
  },
  'Microsoft.ConditionalSelector': {
    ifFalse: {
      'ui:field': SelectorField,
    },
    ifTrue: {
      'ui:field': SelectorField,
    },
    ...globalFields,
  },
  'Microsoft.EditSteps': {
    Steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.EventRule': {
    steps: {
      'ui:field': StepsField,
    },
    ...globalFields,
    'ui:order': ['*', 'steps'],
  },
  'Microsoft.Foreach': {
    Steps: {
      'ui:field': StepsField,
    },
    'ui:order': ['*', 'ListProperty', 'IndexProperty', 'ValueProperty', 'Steps'],
  },
  'Microsoft.ForeachPage': {
    Steps: {
      'ui:field': StepsField,
    },
    'ui:order': ['*', 'ListProperty', 'PageSize', 'ValueProperty', 'Steps'],
  },
  'Microsoft.HttpRequest': {
    body: {
      'ui:field': JsonField,
    },
    // ...globalFields,  // we do not want to exclude the property field here
    'ui:order': ['*', 'body'],
  },
  'Microsoft.IfCondition': {
    elseSteps: {
      'ui:field': StepsField,
    },
    steps: {
      'ui:field': StepsField,
    },
    ...globalFields,
  },
  'Microsoft.IfPropertyRule': {
    conditionals: {
      items: {
        rules: {
          'ui:field': RulesField,
        },
      },
    },
    ...globalFields,
  },
  'Microsoft.IntentRule': {
    steps: {
      'ui:field': StepsField,
    },
    ...globalFields,
    'ui:order': ['intent', 'constraint', 'entities', '*'],
  },
  'Microsoft.MostSpecificSelector': {
    selector: {
      'ui:field': SelectorField,
    },
    ...globalFields,
  },
  'Microsoft.TextInput': {
    ...activityFields,
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'validations',
      'value',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'defaultValue',
      '*',
    ],
  },
  'Microsoft.NumberInput': {
    ...activityFields,
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'validations',
      'value',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'defaultValue',
      '*',
    ],
  },
  'Microsoft.ConfirmInput': {
    ...activityFields,
    // ConfirmInput defaults to YES/NO. using confirmchoices is complex
    // - must provide yes/no in special format along with alternatives that have to be handled
    // TODO: Implement confirmChoices-specific widget with appropriate business rules.
    confirmChoices: {
      'ui:field': NullField,
    },
    'ui:order': [
      'prompt',
      'property',
      'style',
      'defaultLocale',
      'validations',
      'value',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'defaultValue',
      '*',
    ],
  },
  'Microsoft.ChoiceInput': {
    inputBindings: {
      'ui:field': NullField,
    },
    outputBinding: {
      'ui:field': NullField,
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
      'value',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'defaultValue',
      '*',
    ],
  },
  'Microsoft.OAuthInput': {
    ...activityFields,
    'ui:order': ['connectionName', '*'],
  },
  'Microsoft.AttachmentInput': {
    ...activityFields,
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'validations',
      'value',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'defaultValue',
      '*',
    ],
  },
  'Microsoft.ReplaceDialog': {
    dialog: {
      'ui:widget': DialogSelectWidget,
    },
    ...globalFields,
  },
  'Microsoft.Rule': {
    steps: {
      'ui:field': StepsField,
    },
    ...globalFields,
  },
  'Microsoft.SwitchCondition': {
    cases: {
      'ui:field': CasesField,
    },
    default: {
      'ui:field': StepsField,
    },
    ...globalFields,
  },
  'Microsoft.UnknownIntentRule': {
    steps: {
      'ui:field': StepsField,
    },
    ...globalFields,
  },
  'Microsoft.SendActivity': {
    activity: {
      'ui:field': LgEditorField,
    },
  },
};
