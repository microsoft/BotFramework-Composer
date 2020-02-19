// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';
import { EditableField } from '@bfc/adaptive-form';
import formatMessage from 'format-message';

import { PromptField } from './PromptField';
import { SynonymsField } from './SynonymsField';

const PROMPT_TYPES = [
  SDKTypes.AttachmentInput,
  SDKTypes.ChoiceInput,
  SDKTypes.ConfirmInput,
  SDKTypes.DateTimeInput,
  SDKTypes.NumberInput,
  SDKTypes.TextInput,
];

const choiceSchema = {
  'ui:hidden': ['action'],
  properties: {
    value: {
      'ui:label': () => formatMessage('Choice Name'),
      'ui:field': EditableField,
      'ui:placeholder': () => formatMessage('Add new option here'),
    },
    synonyms: {
      'ui:label': () => formatMessage('Synonyms (Optional)'),
      'ui:field': SynonymsField,
      'ui:placeholder': () => formatMessage('Add multiple comma-separated synonyms'),
    },
  },
};

const promptFieldsSchemas = PROMPT_TYPES.reduce((schemas, type) => {
  schemas[type] = {
    'ui:field': PromptField,
    properties: {
      validations: {
        'ui:label': () => formatMessage('Validation Rules'),
        'ui:placeholder': () => formatMessage('Add new validation rule here'),
      },
      choices: {
        'ui:placeholder': () => formatMessage('Expression'),
        ...choiceSchema,
      },
      confirmChoices: {
        'ui:label': () => formatMessage('Confirm Choices'),
        ...choiceSchema,
      },
    },
  };
  return schemas;
}, {});

const uiSchema: UISchema = {
  ...promptFieldsSchemas,
};

export default uiSchema;
