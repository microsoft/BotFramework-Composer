// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import mergeWith from 'lodash/mergeWith';
import {
  PluginConfig,
  FormUISchema,
  UISchema,
  MenuUISchema,
  FlowUISchema,
  RecognizerUISchema,
  TriggerUISchema,
} from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import { IntentField, RecognizerField, QnAActionsField } from '@bfc/adaptive-form';

import { DefaultMenuSchema } from './defaultMenuSchema';
import { DefaultFlowSchema } from './defaultFlowSchema';
import { DefaultRecognizerSchema } from './defaultRecognizerSchema';
import { DefaultTriggerSchema } from './defaultTriggerSchema';

const DefaultFormSchema: FormUISchema = {
  [SDKKinds.AdaptiveDialog]: {
    label: () => formatMessage('Adaptive dialog'),
    description: () => formatMessage('This configures a data driven dialog via a collection of events and actions.'),
    helpLink: 'https://aka.ms/bf-composer-docs-dialog',
    order: ['recognizer', '*'],
    hidden: ['triggers', 'generator', 'selector', 'dialogs'],
    properties: {
      recognizer: {
        label: () => formatMessage('Language Understanding'),
        description: () =>
          formatMessage(
            'To understand what the user says, your dialog needs a "Recognizer"; that includes example words and sentences that users may use.',
          ),
      },
    },
  },
  [SDKKinds.AttachmentInput]: {
    label: () => formatMessage('Prompt for a file or an attachment'),
    subtitle: () => formatMessage('Attachment input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.BeginDialog]: {
    label: () => formatMessage('Begin a new dialog'),
    subtitle: () => formatMessage('Begin dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
  },
  [SDKKinds.OnCancelDialog]: {
    label: () => formatMessage('Dialog cancelled'),
    subtitle: () => formatMessage('Cancel dialog event'),
  },
  [SDKKinds.CancelAllDialogs]: {
    label: () => formatMessage('Cancel all active dialogs'),
    subtitle: () => formatMessage('Cancel all dialogs'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'property', '*'],
  },
  [SDKKinds.ChoiceInput]: {
    label: () => formatMessage('Prompt with multi-choice'),
    subtitle: () => formatMessage('Choice input'),

    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.ConfirmInput]: {
    label: () => formatMessage('Prompt for confirmation'),
    subtitle: () => formatMessage('Confirm input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.DateTimeInput]: {
    label: () => formatMessage('Prompt for a date or a time'),
    subtitle: () => formatMessage('Date time input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.DebugBreak]: { label: () => formatMessage('Debug Break') },
  [SDKKinds.DeleteProperties]: {
    label: () => formatMessage('Delete properties'),
    subtitle: () => formatMessage('Delete properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKKinds.DeleteProperty]: {
    label: () => formatMessage('Delete a property'),
    subtitle: () => formatMessage('Delete property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  // [SDKKinds.DeleteProperties]: {
  //   label: () => formatMessage('Delete Properties'),
  //   helpLink: 'https://aka.ms/bfc-using-memory',
  // },
  [SDKKinds.EditActions]: {
    label: () => formatMessage('Modify active dialog'),
    subtitle: () => formatMessage('Edit actions'),
  },
  [SDKKinds.EditArray]: {
    label: () => formatMessage('Edit an array property'),
    subtitle: () => formatMessage('Edit array'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKKinds.EmitEvent]: {
    label: () => formatMessage('Emit a custom event'),
    subtitle: () => formatMessage('Emit event'),
    helpLink: 'https://aka.ms/bfc-custom-events',
  },
  [SDKKinds.EndDialog]: {
    label: () => formatMessage('End this dialog'),
    subtitle: () => formatMessage('End dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKKinds.EndTurn]: {
    label: () => formatMessage('End turn'),
    subtitle: () => formatMessage('End turn'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKKinds.Foreach]: {
    label: () => formatMessage('Loop: For each item'),
    subtitle: () => formatMessage('For each'),
    order: ['itemsProperty', '*'],
    hidden: ['actions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKKinds.ForeachPage]: {
    label: () => formatMessage('Loop: For each page (multiple items)'),
    subtitle: () => formatMessage('For each page'),
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
    subtitle: () => formatMessage('HTTP request'),
    order: ['method', 'url', 'body', 'headers', '*'],
    helpLink: 'https://aka.ms/bfc-using-http',
  },
  [SDKKinds.IfCondition]: {
    label: () => formatMessage('Branch: If/else'),
    subtitle: () => formatMessage('If condition'),
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
  [SDKKinds.OnQnAMatch]: {
    label: () => formatMessage('QnA Intent recognized'),
    subtitle: () => formatMessage('QnA intent recognized'),
    order: ['actions', 'condition', '*'],
    hidden: ['entities'],
    properties: {
      actions: {
        field: QnAActionsField,
      },
    },
  },
};

const synthesizeUISchema = (
  formSchema: FormUISchema,
  menuSchema: MenuUISchema,
  flowSchema: FlowUISchema,
  triggerSchema: TriggerUISchema,
  recognizerSchema: RecognizerUISchema,
): UISchema => {
  let uischema: UISchema = {};
  uischema = mergeWith(uischema, formSchema, (origin, formOption) => ({ ...origin, form: formOption }));
  uischema = mergeWith(uischema, menuSchema, (origin, menuOption) => ({ ...origin, menu: menuOption }));
  uischema = mergeWith(uischema, flowSchema, (origin, flowOption) => ({ ...origin, flow: flowOption }));
  uischema = mergeWith(uischema, triggerSchema, (origin, triggerOption) => ({ ...origin, trigger: triggerOption }));
  uischema = mergeWith(uischema, recognizerSchema, (origin, opt) => ({ ...origin, recognizer: opt }));
  return uischema;
};

const config: PluginConfig = {
  uiSchema: synthesizeUISchema(
    DefaultFormSchema,
    DefaultMenuSchema,
    DefaultFlowSchema,
    DefaultTriggerSchema,
    DefaultRecognizerSchema,
  ),
};

export default config;
