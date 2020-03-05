// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { RecognizerField } from './components/fields';
import formatMessage = require('format-message');

const triggerUiSchema = {
  order: ['condition', '*'],
  hidden: ['actions'],
};

const DefaultUISchema: UISchema = {
  [SDKTypes.AdaptiveDialog]: {
    order: ['recognizer', '*'],
    hidden: ['triggers', 'autoEndDialog', 'generator', 'selector', 'schema'],
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
  [SDKTypes.BeginDialog]: {
    order: ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
  },
  [SDKTypes.CancelAllDialogs]: { order: ['dialog', 'property', '*'] },
  [SDKTypes.DebugBreak]: { label: () => formatMessage('Debug Break') },
  [SDKTypes.DeleteProperties]: {
    label: () => formatMessage('Delete Properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.DeleteProperty]: {
    label: () => formatMessage('Delete a Property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.EditActions]: { label: () => formatMessage('Modify active dialog') },
  [SDKTypes.EditArray]: {
    label: () => formatMessage('Edit an Array Property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.EmitEvent]: {
    label: () => formatMessage('Emit a custom event'),
    helpLink: 'https://aka.ms/bfc-custom-events',
  },
  [SDKTypes.Foreach]: { order: ['itemsProperty', '*'], hidden: ['actions'] },
  [SDKTypes.ForeachPage]: { order: ['itemsProperty', 'pageSize', '*'], hidden: ['actions'] },
  [SDKTypes.HttpRequest]: { order: ['method', 'url', 'body', 'headers', '*'] },
  [SDKTypes.IfCondition]: { hidden: ['actions', 'elseActions'] },
  [SDKTypes.OAuthInput]: { order: ['connectionName', '*'] },
  [SDKTypes.OnActivity]: { ...triggerUiSchema },
  [SDKTypes.OnBeginDialog]: { ...triggerUiSchema },
  [SDKTypes.OnCancelDialog]: { ...triggerUiSchema },
  [SDKTypes.OnCondition]: { ...triggerUiSchema },
  [SDKTypes.OnConversationUpdateActivity]: { ...triggerUiSchema },
  [SDKTypes.OnCustomEvent]: { ...triggerUiSchema },
  [SDKTypes.OnDialogEvent]: { ...triggerUiSchema },
  [SDKTypes.OnEndOfConversationActivity]: { ...triggerUiSchema },
  [SDKTypes.OnError]: { ...triggerUiSchema },
  [SDKTypes.OnEventActivity]: { ...triggerUiSchema },
  [SDKTypes.OnHandoffActivity]: { ...triggerUiSchema },
  [SDKTypes.OnIntent]: {
    order: ['intent', 'condition', 'entities', '*'],
    hidden: ['actions'],
  },
  [SDKTypes.OnInvokeActivity]: { ...triggerUiSchema },
  [SDKTypes.OnMessageActivity]: { ...triggerUiSchema },
  [SDKTypes.OnMessageDeleteActivity]: { ...triggerUiSchema },
  [SDKTypes.OnMessageReactionActivity]: { ...triggerUiSchema },
  [SDKTypes.OnMessageUpdateActivity]: { ...triggerUiSchema },
  [SDKTypes.OnRepromptDialog]: { ...triggerUiSchema },
  [SDKTypes.OnTypingActivity]: { ...triggerUiSchema },
  [SDKTypes.OnUnknownIntent]: { ...triggerUiSchema },
  [SDKTypes.Recognizer]: { field: RecognizerField },
  [SDKTypes.RegexRecognizer]: { hidden: ['entities'] },
  [SDKTypes.RepeatDialog]: { order: ['options', 'includeActivity', '*'] },
  [SDKTypes.ReplaceDialog]: {
    order: ['dialog', 'options', 'includeActivity', '*'],
  },
  [SDKTypes.SendActivity]: { order: ['activity', '*'] },
  [SDKTypes.SetProperties]: {
    label: () => formatMessage('Set Properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.SetProperty]: { label: () => formatMessage('Set a Property'), helpLink: 'https://aka.ms/bfc-using-memory' },
  [SDKTypes.SwitchCondition]: {
    hidden: ['default'],
    properties: { cases: { hidden: ['actions'] } },
  },
};

export default DefaultUISchema;
