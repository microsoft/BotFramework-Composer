// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FlowWidget, PluginConfig, UIOptions } from '@bfc/extension-client';
import { SDKKinds, getInputType, PromptTab, PromptTabTitles } from '@bfc/shared';
import { VisualEditorColors as Colors, ListOverview, BorderedDiv, FixedInfo } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { StringField, JsonField } from '@bfc/adaptive-form';

import { ExpectedResponsesField } from './ExpectedResponsesField';

const PROMPTS_ORDER = [
  '*',
  'unrecognizedPrompt',
  'validations',
  'invalidPrompt',
  'defaultValueResponse',
  'maxTurnCount',
  'defaultValue',
  'allowInterruptions',
  'alwaysPrompt',
  'recognizerOptions',
];

const createPromptFieldSet = (userAskFields: string[]) => [
  { title: PromptTabTitles[PromptTab.BOT_ASKS], itemKey: PromptTab.BOT_ASKS, fields: ['prompt'] },
  { title: PromptTabTitles[PromptTab.USER_INPUT], itemKey: PromptTab.USER_INPUT, fields: userAskFields },
  {
    title: PromptTabTitles[PromptTab.OTHER],
    itemKey: PromptTab.OTHER,
    fields: [
      { title: () => formatMessage('Recognizers'), fields: ['recognizerOptions', 'unrecognizedPrompt'] },
      { title: () => formatMessage('Validation'), fields: ['validations', 'invalidPrompt'] },
      { title: () => formatMessage('Prompt Configurations'), fields: ['*'] },
    ],
  },
];

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
      title: (data) => `${PromptTabTitles[PromptTab.BOT_ASKS]()} (${getInputType(data.$kind)})`,
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
      title: (data) => `${PromptTabTitles[PromptTab.USER_INPUT]()} (${getInputType(data.$kind)})`,
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
    <React.Fragment>
      {data.property} <FixedInfo>= Input({getInputType(data.$kind)})</FixedInfo>
    </React.Fragment>
  ) : null;

const ChoiceInputBody = (data) =>
  Array.isArray(data.choices) && data.choices.length ? (
    <ListOverview
      itemInterval={4}
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
    <React.Fragment>{data.choices}</React.Fragment>
  );

const ChoiceInputSchema = generateInputSchema(ChoiceInputBody, PropertyInfo);
const BaseInputSchema = generateInputSchema(PropertyInfo);

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.AttachmentInput]: {
      form: {
        fieldsets: createPromptFieldSet(['property', 'outputFormat', 'value']),
        helpLink: 'https://aka.ms/bfc-ask-for-user-input',
        order: PROMPTS_ORDER,
        properties: {
          prompt: {
            label: () => formatMessage('Ask a question - file or attachment'),
            description: () => formatMessage('Ask a question to collect user input (file or attachment)'),
          },
          validations: {
            label: () => formatMessage('Validation Rules'),
            helpLink: 'https://aka.ms/bf-composer-docs-ask-input#prompt-settings-and-validation',
            placeholder: () => formatMessage('Add new validation rule here'),
          },
        },
      },
      flow: BaseInputSchema,
    },
    [SDKKinds.ChoiceInput]: {
      form: {
        fieldsets: createPromptFieldSet([
          'property',
          'outputFormat',
          'value',
          'expectedResponses',
          'defaultLocale',
          'style',
          'choices',
          'choiceOptions',
        ]),
        helpLink: 'https://aka.ms/bfc-ask-for-user-input',
        order: PROMPTS_ORDER,
        properties: {
          prompt: {
            label: () => formatMessage('Ask a question - multi choice'),
            description: () => formatMessage('Ask a question to collect user input (choice)'),
          },
          validations: {
            label: () => formatMessage('Validation Rules'),
            helpLink: 'https://aka.ms/bf-composer-docs-ask-input#prompt-settings-and-validation',
            placeholder: () => formatMessage('Add new validation rule here'),
          },
          choices: {
            placeholder: () => formatMessage('Expression'),
            ...choiceSchema,
          },
          expectedResponses: {
            additionalField: true,
            field: ExpectedResponsesField,
          },
        },
      },
      flow: ChoiceInputSchema,
    },
    [SDKKinds.ConfirmInput]: {
      form: {
        fieldsets: createPromptFieldSet([
          'property',
          'outputFormat',
          'value',
          'expectedResponses',
          'defaultLocale',
          'style',
          'confirmChoices',
          'choiceOptions',
        ]),
        helpLink: 'https://aka.ms/bfc-ask-for-user-input',
        order: PROMPTS_ORDER,
        properties: {
          prompt: {
            label: () => formatMessage('Ask a question - confirmation'),
            description: () => formatMessage('Ask a question to collect user input (confirmation)'),
          },
          validations: {
            label: () => formatMessage('Validation Rules'),
            helpLink: 'https://aka.ms/bf-composer-docs-ask-input#prompt-settings-and-validation',
            placeholder: () => formatMessage('Add new validation rule here'),
          },
          confirmChoices: {
            label: () => formatMessage('Confirm Choices'),
            ...choiceSchema,
          },
          expectedResponses: {
            additionalField: true,
            field: ExpectedResponsesField,
          },
        },
      },
      flow: BaseInputSchema,
    },
    [SDKKinds.DateTimeInput]: {
      form: {
        fieldsets: createPromptFieldSet(['property', 'outputFormat', 'value', 'expectedResponses']),
        helpLink: 'https://aka.ms/bfc-ask-for-user-input',
        order: PROMPTS_ORDER,
        properties: {
          prompt: {
            label: () => formatMessage('Ask a question - date or time'),
            description: () => formatMessage('Ask a question to collect user input (date or time)'),
          },
          validations: {
            label: () => formatMessage('Validation Rules'),
            helpLink: 'https://aka.ms/bf-composer-docs-ask-input#prompt-settings-and-validation',
            placeholder: () => formatMessage('Add new validation rule here'),
          },
          expectedResponses: {
            additionalField: true,
            field: ExpectedResponsesField,
          },
        },
      },
      flow: BaseInputSchema,
    },
    [SDKKinds.NumberInput]: {
      form: {
        fieldsets: createPromptFieldSet(['property', 'outputFormat', 'value', 'expectedResponses', 'defaultLocale']),
        helpLink: 'https://aka.ms/bfc-ask-for-user-input',
        order: PROMPTS_ORDER,
        properties: {
          prompt: {
            label: () => formatMessage('Ask a question - number'),
            description: () => formatMessage('Ask a question to collect user input (number)'),
          },
          validations: {
            label: () => formatMessage('Validation Rules'),
            helpLink: 'https://aka.ms/bf-composer-docs-ask-input#prompt-settings-and-validation',
            placeholder: () => formatMessage('Add new validation rule here'),
          },
          expectedResponses: {
            additionalField: true,
            field: ExpectedResponsesField,
          },
        },
      },
      flow: BaseInputSchema,
    },
    [SDKKinds.TextInput]: {
      form: {
        fieldsets: createPromptFieldSet(['property', 'outputFormat', 'value', 'expectedResponses']),
        helpLink: 'https://aka.ms/bfc-ask-for-user-input',
        order: PROMPTS_ORDER,
        properties: {
          prompt: {
            label: () => formatMessage('Ask a question - text'),
            description: () => formatMessage('Ask a question to collect user input (text)'),
          },
          validations: {
            label: () => formatMessage('Validation Rules'),
            helpLink: 'https://aka.ms/bf-composer-docs-ask-input#prompt-settings-and-validation',
            placeholder: () => formatMessage('Add new validation rule here'),
          },
          expectedResponses: {
            additionalField: true,
            field: ExpectedResponsesField,
          },
        },
      },
      flow: BaseInputSchema,
    },
    [SDKKinds.Ask]: {
      form: {
        properties: {
          activity: {
            label: () => formatMessage('Ask a question - send activity'),
            description: () => formatMessage('Ask a question to collect user input (send activity)'),
          },
        },
      },
    },
    [SDKKinds.OAuthInput]: {
      form: {
        properties: {
          defaultValueResponse: {
            label: () => formatMessage('Ask a question - OAuth login'),
            description: () => formatMessage('Ask a question to collect user input (OAuth login)'),
          },
        },
      },
    },
  },
};

export default config;
