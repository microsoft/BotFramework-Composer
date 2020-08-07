// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, FormUISchema, RecognizerSchema, UISchema, MenuUISchema } from '@bfc/extension';
import { IntentField, RecognizerField, RegexIntentField } from '@bfc/adaptive-form';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import mapValues from 'lodash/mapValues';

import { DefaultMenuSchema } from './defaultMenuSchema';

const DefaultRecognizers: RecognizerSchema[] = [
  {
    id: 'none',
    displayName: () => formatMessage('None'),
    isSelected: (data) => data === undefined,
    handleRecognizerChange: (props) => props.onChange(undefined),
    renameIntent: () => {},
  },
  {
    id: SDKKinds.RegexRecognizer,
    displayName: () => formatMessage('Regular Expression'),
    editor: RegexIntentField,
    isSelected: (data) => {
      return typeof data === 'object' && data.$kind === SDKKinds.RegexRecognizer;
    },
    handleRecognizerChange: (props) => {
      props.onChange({ $kind: SDKKinds.RegexRecognizer, intents: [] });
    },
    renameIntent: async (intentName, newIntentName, shellData, shellApi) => {
      const { currentDialog } = shellData;
      shellApi.renameRegExIntent(currentDialog.id, intentName, newIntentName);
    },
  },
];

const DefaultFormSchema: FormUISchema = {
  [SDKKinds.AdaptiveDialog]: {
    label: () => formatMessage('Adaptive dialog'),
    description: () => formatMessage('This configures a data driven dialog via a collection of events and actions.'),
    helpLink: 'https://aka.ms/bf-composer-docs-dialog',
    order: ['recognizer', '*'],
    hidden: ['triggers', 'generator', 'selector', 'schema'],
    properties: {
      recognizer: {
        label: () => formatMessage('Language Understanding'),
        description: () =>
          formatMessage(
            'To understand what the user says, your dialog needs a "Recognizer"; that includes example words and sentences that users may use.'
          ),
      },
    },
  },
  [SDKKinds.AttachmentInput]: {
    label: () => formatMessage('Prompt for a file or an attachment'),
    subtitle: () => formatMessage('Attachment Input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.BeginDialog]: {
    label: () => formatMessage('Begin a new dialog'),
    subtitle: () => formatMessage('Begin Dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
  },
  [SDKKinds.OnCancelDialog]: {
    label: () => formatMessage('Dialog cancelled'),
    subtitle: () => formatMessage('Cancel dialog event'),
  },
  [SDKKinds.CancelAllDialogs]: {
    label: () => formatMessage('Cancel all active dialogs'),
    subtitle: () => formatMessage('Cancel All Dialogs'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'property', '*'],
  },
  [SDKKinds.ChoiceInput]: {
    label: () => formatMessage('Prompt with multi-choice'),
    subtitle: () => formatMessage('Choice Input'),

    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.ConfirmInput]: {
    label: () => formatMessage('Prompt for confirmation'),
    subtitle: () => formatMessage('Confirm Input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.DateTimeInput]: {
    label: () => formatMessage('Prompt for a date or a time'),
    subtitle: () => formatMessage('Date Time Input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.DebugBreak]: { label: () => formatMessage('Debug Break') },
  [SDKKinds.DeleteProperties]: {
    label: () => formatMessage('Delete properties'),
    subtitle: () => formatMessage('Delete Properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKKinds.DeleteProperty]: {
    label: () => formatMessage('Delete a property'),
    subtitle: () => formatMessage('Delete Property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  // [SDKKinds.DeleteProperties]: {
  //   label: () => formatMessage('Delete Properties'),
  //   helpLink: 'https://aka.ms/bfc-using-memory',
  // },
  [SDKKinds.EditActions]: {
    label: () => formatMessage('Modify active dialog'),
    subtitle: () => formatMessage('Edit Actions'),
  },
  [SDKKinds.EditArray]: {
    label: () => formatMessage('Edit an array property'),
    subtitle: () => formatMessage('Edit Array'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKKinds.EmitEvent]: {
    label: () => formatMessage('Emit a custom event'),
    subtitle: () => formatMessage('Emit Event'),
    helpLink: 'https://aka.ms/bfc-custom-events',
  },
  [SDKKinds.EndDialog]: {
    label: () => formatMessage('End this dialog'),
    subtitle: () => formatMessage('End Dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKKinds.EndTurn]: {
    label: () => formatMessage('End turn'),
    subtitle: () => formatMessage('End Turn'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKKinds.Foreach]: {
    label: () => formatMessage('Loop: For each item'),
    subtitle: () => formatMessage('For Each'),
    order: ['itemsProperty', '*'],
    hidden: ['actions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKKinds.ForeachPage]: {
    label: () => formatMessage('Loop: For each page (multiple items)'),
    subtitle: () => formatMessage('For Each Page'),
    order: ['itemsProperty', 'pageSize', '*'],
    hidden: ['actions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKKinds.ContinueLoop]: {
    label: () => formatMessage('Continue loop'),
    subtitle: () => formatMessage('Continue loop'),
  },
  [SDKKinds.BreakLoop]: {
    label: () => formatMessage('Break out of loop'),
    subtitle: () => formatMessage('Break out of loop'),
  },
  [SDKKinds.HttpRequest]: {
    label: () => formatMessage('Send an HTTP request'),
    subtitle: () => formatMessage('HTTP Request'),
    order: ['method', 'url', 'body', 'headers', '*'],
    helpLink: 'https://aka.ms/bfc-using-http',
  },
  [SDKKinds.IfCondition]: {
    label: () => formatMessage('Branch: If/Else'),
    subtitle: () => formatMessage('If Condition'),
    hidden: ['actions', 'elseActions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKKinds.IRecognizer]: {
    field: RecognizerField,
    helpLink: 'https://aka.ms/BFC-Using-LU',
  },
  [SDKKinds.OnIntent]: {
    properties: {
      intent: {
        field: IntentField,
      },
    },
  },
};

const synthesizeUISchema = (formSchema: FormUISchema, menuSchema: MenuUISchema): UISchema => {
  const uiSchema: UISchema = mapValues(formSchema, (val) => ({ form: val }));
  for (const [$kind, menuConfig] of Object.entries(menuSchema)) {
    if (uiSchema[$kind]) {
      uiSchema[$kind].menu = menuConfig;
    } else {
      uiSchema[$kind] = { menu: menuConfig };
    }
  }
  return uiSchema;
};

const config: PluginConfig = {
  uiSchema: synthesizeUISchema(DefaultFormSchema, DefaultMenuSchema),
  recognizers: DefaultRecognizers,
};

export default config;
