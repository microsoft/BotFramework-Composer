import { AdaptiveDialog, RulesSection, StepsField } from '../Form/fields';

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
      'ui:field': RulesSection,
    },
    steps: {
      'ui:field': StepsField,
    },
  },
};
