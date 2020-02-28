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
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      prompt: {
        label: () => formatMessage('Prompt for Attachment'),
      },
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
    },
  },
  [SDKTypes.ChoiceInput]: {
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      prompt: {
        label: () => formatMessage('Prompt with multi-choice'),
      },
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
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      prompt: {
        label: () => formatMessage('Prompt for confirmation'),
      },
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
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      prompt: {
        label: () => formatMessage('Prompt for a date'),
      },
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
    },
  },
  [SDKTypes.NumberInput]: {
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      prompt: {
        label: () => formatMessage('Prompt for a number'),
      },
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
    },
  },
  [SDKTypes.TextInput]: {
    field: PromptField,
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
    properties: {
      prompt: {
        label: () => formatMessage('Prompt for text'),
      },
      validations: {
        label: () => formatMessage('Validation Rules'),
        placeholder: () => formatMessage('Add new validation rule here'),
      },
    },
  },
};

export default uiSchema;
