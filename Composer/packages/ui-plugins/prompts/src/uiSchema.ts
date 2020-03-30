// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';
import { EditableField } from '@bfc/adaptive-form';
import formatMessage from 'format-message';

import { PromptField } from './PromptField';

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
      field: EditableField,
      serializer: {
        get: value => (Array.isArray(value) ? value.join(', ') : value),
        set: value => (typeof value === 'string' ? value.split(', ') : value),
      },
      placeholder: () => formatMessage('Add multiple comma-separated synonyms'),
    },
  },
};

const uiSchema: UISchema = {
  [SDKKinds.AttachmentInput]: {
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
  [SDKKinds.ChoiceInput]: {
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
  [SDKKinds.ConfirmInput]: {
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
  [SDKKinds.DateTimeInput]: {
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
  [SDKKinds.NumberInput]: {
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
  [SDKKinds.TextInput]: {
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
