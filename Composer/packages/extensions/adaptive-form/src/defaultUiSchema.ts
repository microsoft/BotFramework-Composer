// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { RecognizerField } from './components/fields';
import formatMessage = require('format-message');

const globalHiddenProperties = ['$type', '$id', '$copy', '$designer', 'id'];
const triggerUiSchema = {
  order: ['condition', '*'],
  hidden: ['actions', ...globalHiddenProperties],
};

const DefaultUISchema: UISchema = {
  [SDKTypes.Recognizer]: {
    field: RecognizerField,
  },
  [SDKTypes.AdaptiveDialog]: {
    order: ['recognizer', '*'],
    hidden: ['triggers', 'autoEndDialog', 'generator', 'selector', 'schema', ...globalHiddenProperties],
    properties: {
      recognizer: {
        label: () => formatMessage('Language Understanding'),
        description: () =>
          formatMessage(
            'To understand what the user says, your dialog needs a &lsquo;Recognizer&rsquo; that includes example words and sentences that users may use.'
          ),
      },
    },
  },
  [SDKTypes.BeginDialog]: {
    order: ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.CancelAllDialogs]: {
    order: ['dialog', 'property', '*'],
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.ConditionalSelector]: {
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.DebugBreak]: {
    label: 'Debug Breack',
  },
  [SDKTypes.DeleteProperty]: {
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.DeleteProperties]: {
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.EditActions]: {
    label: 'Modify active dialog',
  },
  [SDKTypes.EditArray]: {
    label: 'Edit an Array Property',
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.EmitEvent]: {
    label: 'Emit a custom event',
    helpLink: 'https://aka.ms/bfc-custom-events',
  },
  [SDKTypes.EditArray]: {
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.EndDialog]: {
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.EndTurn]: {
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.Foreach]: {
    order: ['itemsProperty', '*'],
    hidden: ['actions', ...globalHiddenProperties],
  },
  [SDKTypes.ForeachPage]: {
    order: ['itemsProperty', 'pageSize', '*'],
    hidden: ['actions', ...globalHiddenProperties],
  },
  [SDKTypes.HttpRequest]: {
    order: ['method', 'url', 'body', 'headers', '*'],
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.IfCondition]: {
    hidden: ['actions', 'elseActions', ...globalHiddenProperties],
  },
  [SDKTypes.SetProperty]: {
    label: 'Set a Property',
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.SetProperties]: {
    label: 'Set Properties',
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.DeleteProperty]: {
    label: 'Delete a Property',
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.DeleteProperties]: {
    label: 'Delete Properties',
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.OnActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnBeginDialog]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnCancelDialog]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnCondition]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnConversationUpdateActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnCustomEvent]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnDialogEvent]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnEndOfConversationActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnError]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnEventActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnHandoffActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnIntent]: {
    order: ['intent', 'condition', 'entities', '*'],
    hidden: ['actions', ...globalHiddenProperties],
    // properties: {
    //   intent: {
    //     widget: 'IntentWidget',
    //   },
    // },
  },
  [SDKTypes.OnInvokeActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnMessageActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnMessageDeleteActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnMessageReactionActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnMessageUpdateActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnRepromptDialog]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnTypingActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnUnknownIntent]: {
    ...triggerUiSchema,
  },
  [SDKTypes.MostSpecificSelector]: {
    hidden: [...globalHiddenProperties],
    // properties: {
    //   selector: {
    //     // field: 'SelectorField',
    //   },
    // },
  },
  [SDKTypes.OAuthInput]: {
    order: ['connectionName', '*'],
  },
  [SDKTypes.RegexRecognizer]: {
    hidden: ['entities', ...globalHiddenProperties],
  },
  [SDKTypes.ReplaceDialog]: {
    hidden: [...globalHiddenProperties],
    order: ['dialog', 'options', 'includeActivity', '*'],
  },
  [SDKTypes.RepeatDialog]: {
    hidden: [...globalHiddenProperties],
    order: ['options', 'includeActivity', '*'],
  },
  [SDKTypes.SetProperty]: {
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.SetProperties]: {
    hidden: [...globalHiddenProperties],
  },
  [SDKTypes.SwitchCondition]: {
    hidden: ['default', ...globalHiddenProperties],
    properties: {
      cases: {
        hidden: ['actions'],
      },
    },
  },
  [SDKTypes.SendActivity]: {
    hidden: [...globalHiddenProperties],
    order: ['activity', '*'],
  },
};

export default DefaultUISchema;
