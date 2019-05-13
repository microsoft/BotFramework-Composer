import {
  CasesField,
  RulesField,
  StepsField,
  SelectorField,
  RecognizerField,
  JsonField,
  CodeField,
} from '../Form/fields';

export const uiSchema = {
  'Microsoft.AdaptiveDialog': {
    recognizer: {
      'ui:field': RecognizerField,
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
    'ui:order': ['*', 'recognizer', 'selector'],
  },
  'Microsoft.CodeStep': {
    codeHandler: {
      'ui:field': CodeField,
    },
  },
  'Microsoft.ConditionalSelector': {
    ifFalse: {
      'ui:field': SelectorField,
    },
    ifTrue: {
      'ui:field': SelectorField,
    },
  },
  'Microsoft.EventRule': {
    steps: {
      'ui:field': StepsField,
    },
    'ui:order': ['*', 'steps'],
  },
  'Microsoft.HttpRequest': {
    body: {
      'ui:field': JsonField,
    },
    'ui:order': ['*', 'body'],
  },
  'Microsoft.IfCondition': {
    elseSteps: {
      'ui:field': StepsField,
    },
    steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.IfPropertyRule': {
    conditionals: {
      items: {
        rules: {
          'ui:field': RulesField,
        },
      },
    },
  },
  'Microsoft.IntentRule': {
    steps: {
      'ui:field': StepsField,
    },
    'ui:order': ['intent', 'constraint', 'entities', '*'],
  },
  'Microsoft.MostSpecificSelector': {
    selector: {
      'ui:field': SelectorField,
    },
  },
  'Microsoft.Rule': {
    steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.SwitchCondition': {
    cases: {
      'ui:field': CasesField,
    },
    default: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.UnknownIntentRule': {
    steps: {
      'ui:field': StepsField,
    },
  },
};
