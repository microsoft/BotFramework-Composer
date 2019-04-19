import { RulesField, StepsField, SelectorField } from '../Form/fields';

export const uiSchema = {
  'Microsoft.AdaptiveDialog': {
    rules: {
      'ui:field': RulesField,
    },
    steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.EventRule': {
    steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.IntentRule': {
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
};
