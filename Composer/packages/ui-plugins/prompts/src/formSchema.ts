// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema, UIOptions } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import { StringField, JsonField } from '@bfc/adaptive-form';

import { PromptField } from './PromptField';

const choiceSchema: UIOptions = {
  order: ['value', 'synonyms', 'actions', '*'],
  properties: {
    value: {
      label: () => formatMessage('Choice Name'),
    },
    synonyms: {
      label: () => formatMessage('Synonyms (Optional)'),
      field: StringField,
      serializer: {
        get: value => (Array.isArray(value) ? value.join(', ') : value),
        set: value => (typeof value === 'string' ? value.split(', ') : value),
      },
      placeholder: () => formatMessage('Add multiple comma-separated synonyms'),
    },
    action: {
      field: JsonField,
    },
  },
};

const formSchema: UISchema = {
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

export default formSchema;
