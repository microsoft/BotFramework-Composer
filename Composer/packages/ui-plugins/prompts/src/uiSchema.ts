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
  hidden: ['action'],
  properties: {
    value: {
      label: () => formatMessage('Choice Name'),
      field: EditableField,
      placeholder: () => formatMessage('Add new option here'),
    },
    synonyms: {
      label: () => formatMessage('Synonyms (Optional)'),
      field: SynonymsField,
      placeholder: () => formatMessage('Add multiple comma-separated synonyms'),
    },
  },
};

const promptFieldsSchemas = PROMPT_TYPES.reduce((schemas, type) => {
  schemas[type] = {
    field: PromptField,
    properties: {
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
      choices: {
        placeholder: () => formatMessage('Expression'),
        ...choiceSchema,
      },
      confirmChoices: {
        label: () => formatMessage('Confirm Choices'),
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
