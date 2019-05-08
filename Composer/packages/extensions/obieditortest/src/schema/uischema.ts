import { CasesField, RulesField, StepsField, SelectorField, RecognizerField, JsonField } from '../Form/fields';

export const uiSchema = {
  'Microsoft.AdaptiveDialog': {
    'ui:order': ['*', 'recognizer', 'selector'],
    selector: {
      'ui:field': SelectorField,
    },
    recognizer: {
      'ui:field': RecognizerField,
    },
    rules: {
      'ui:field': RulesField,
    },
    steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.EventRule': {
    'ui:order': ['*', 'steps'],
    steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.IntentRule': {
    'ui:order': ['intent', 'constraint', 'entities', '*'],
    steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.UnknownIntentRule': {
    steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.Rule': {
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
  'Microsoft.IfCondition': {
    steps: {
      'ui:field': StepsField,
    },
    elseSteps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.ConditionalSelector': {
    ifTrue: {
      'ui:field': SelectorField,
    },
    ifFalse: {
      'ui:field': SelectorField,
    },
  },
  'Microsoft.MostSpecificSelector': {
    selector: {
      'ui:field': SelectorField,
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
  'Microsoft.HttpRequest': {
    'ui:order': ['*', 'body'],
    body: {
      'ui:field': JsonField,
    },
  },
};
