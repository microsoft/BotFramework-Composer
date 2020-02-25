// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';
import { EditableField } from '@bfc/adaptive-form';
import formatMessage from 'format-message';

import { PromptField } from './PromptField';
import { SynonymsField } from './SynonymsField';

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

const uiSchema: UISchema = {
  [SDKTypes.AttachmentInput]: {
    label: 'Prompt for Attachment',
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
    },
  },
  [SDKTypes.ChoiceInput]: {
    label: 'Prompt with multi-choice',
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
      choices: {
        placeholder: () => formatMessage('Expression'),
        ...choiceSchema,
      },
    },
  },
  [SDKTypes.ConfirmInput]: {
    label: 'Prompt for confirmation',
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
      confirmChoices: {
        label: () => formatMessage('Confirm Choices'),
        ...choiceSchema,
      },
    },
  },
  [SDKTypes.DateTimeInput]: {
    label: 'Prompt for a date',
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
    },
  },
  [SDKTypes.NumberInput]: {
    label: 'Prompt for a number',
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
    },
  },
  [SDKTypes.TextInput]: {
    label: 'Prompt for text',
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
    },
  },
};

export default uiSchema;
