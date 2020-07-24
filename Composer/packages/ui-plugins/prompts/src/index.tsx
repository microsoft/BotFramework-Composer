// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FlowWidget, PluginConfig, UIOptions } from '@bfc/extension';
import { SDKKinds, getInputType, PromptTab, PropmtTabTitles } from '@bfc/shared';
import { VisualEditorColors as Colors, ListOverview, BorderedDiv, FixedInfo } from '@bfc/ui-shared';
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
        get: (value) => (Array.isArray(value) ? value.join(', ') : value),
        set: (value) => (typeof value === 'string' ? value.split(', ') : value),
      },
      placeholder: () => formatMessage('Add multiple comma-separated synonyms'),
    },
    action: {
      field: JsonField,
    },
  },
};

const generateInputSchema = (inputBody?, inputFooter?): FlowWidget => ({
  widget: 'PromptWidget',
  nowrap: true,
  botAsks: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: (data) => `${PropmtTabTitles[PromptTab.BOT_ASKS]} (${getInputType(data.$kind)})`,
      icon: 'MessageBot',
      colors: {
        theme: Colors.BlueMagenta20,
        icon: Colors.BlueMagenta30,
      },
    },
    body: {
      widget: 'LgWidget',
      field: 'prompt',
      defaultContent: '<prompt>',
    },
  },
  userInput: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: (data) => `${PropmtTabTitles[PromptTab.USER_INPUT]} (${getInputType(data.$kind)})`,
      disableSDKTitle: true,
      icon: 'User',
      menu: 'none',
      colors: {
        theme: Colors.LightBlue,
        icon: Colors.AzureBlue,
      },
    },
    body: inputBody,
    footer: inputFooter,
  },
});

const PropertyInfo = (data) =>
  data.property ? (
    <>
      {data.property} <FixedInfo>= Input({getInputType(data.$kind)})</FixedInfo>
    </>
  ) : null;

const ChoiceInputBody = (data) =>
  Array.isArray(data.choices) && data.choices.length ? (
    <ListOverview
      items={data.choices}
      renderItem={(item) => {
        const value = typeof item === 'object' ? item.value : item;
        return (
          <BorderedDiv height={20} title={value}>
            {value}
          </BorderedDiv>
        );
      }}
    />
  ) : (
    <>{data.choices}</>
  );

const ChoiceInputSchema = generateInputSchema(ChoiceInputBody, PropertyInfo);
const BaseInputSchema = generateInputSchema(PropertyInfo);

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.AttachmentInput]: {
      form: {
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
      flow: BaseInputSchema,
    },
    [SDKKinds.ChoiceInput]: {
      form: {
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
      flow: ChoiceInputSchema,
    },
    [SDKKinds.ConfirmInput]: {
      form: {
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
      flow: BaseInputSchema,
    },
    [SDKKinds.DateTimeInput]: {
      form: {
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
      flow: BaseInputSchema,
    },
    [SDKKinds.NumberInput]: {
      form: {
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
      flow: BaseInputSchema,
    },
    [SDKKinds.TextInput]: {
      form: {
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
      flow: BaseInputSchema,
    },
  },
};

export default config;
