import { AdaptiveDialog, RulesField, StepsField } from '../Form/fields';

const hideMetaData = {
  $ref: {
    'ui:widget': 'hidden',
  },
  $copy: {
    'ui:widget': 'hidden',
  },
  $id: {
    'ui:widget': 'hidden',
  },
  $type: {
    'ui:widget': 'hidden',
  },
};

export const uiSchema = {
  'Microsoft.AdaptiveDialog': {
    rules: {
      'ui:field': RulesField,
    },
    steps: {
      'ui:field': StepsField,
    },
  },
  'Microsoft.WelcomeRule': {
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
  'Microsoft.NoMatchRule': {
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
};
