// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';
import formatMessage from 'format-message';

import { RecognizerField, IntentField } from './components/fields';

const triggerUiSchema = {
  order: ['condition', '*'],
  hidden: ['actions'],
};

const DefaultUISchema: UISchema = {
  [SDKTypes.AdaptiveDialog]: {
    description: 'This configures a data driven dialog via a collection of events and actions.',
    helpLink: 'https://aka.ms/botframework',
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
  [SDKTypes.AttachmentInput]: {
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.BeginDialog]: {
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
  },
  [SDKTypes.CancelAllDialogs]: {
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'property', '*'],
  },
  [SDKTypes.ChoiceInput]: {
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.ConfirmInput]: {
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.DateTimeInput]: {
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.DebugBreak]: { label: () => formatMessage('Debug Break') },
  [SDKTypes.DeleteProperties]: {
    label: () => formatMessage('Delete Properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.DeleteProperty]: {
    label: () => formatMessage('Delete a Property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.DeleteProperties]: {
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
  [SDKTypes.EndDialog]: {
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKTypes.EndDialog]: {
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKTypes.Foreach]: {
    order: ['itemsProperty', '*'],
    hidden: ['actions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKTypes.ForeachPage]: {
    order: ['itemsProperty', 'pageSize', '*'],
    hidden: ['actions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKTypes.HttpRequest]: {
    order: ['method', 'url', 'body', 'headers', '*'],
    helpLink: 'https://aka.ms/bfc-using-http',
  },
  [SDKTypes.IfCondition]: {
    hidden: ['actions', 'elseActions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKTypes.LogAction]: {
    helpLink: 'https://aka.ms/bfc-debugging-bots',
  },
  [SDKTypes.LuisRecognizer]: {
    helpLink: 'https://aka.ms/BFC-Using-LU',
  },
  [SDKTypes.MultiLanguageRecognizer]: {
    helpLink: 'https://aka.ms/BFC-Using-LU',
  },
  [SDKTypes.NumberInput]: {
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.OAuthInput]: {
    helpLink: 'https://aka.ms/bfc-using-oauth',
  },
  [SDKTypes.OAuthInput]: { order: ['connectionName', '*'] },
  [SDKTypes.OnActivity]: { ...triggerUiSchema },
  [SDKTypes.OnBeginDialog]: { ...triggerUiSchema },
  [SDKTypes.OnCancelDialog]: { ...triggerUiSchema },
  [SDKTypes.OnCondition]: { ...triggerUiSchema },
  [SDKTypes.OnConversationUpdateActivity]: {
    helpLink:
      'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-conversations?view=azure-bot-service-4.0#conversation-lifetime',
    ...triggerUiSchema,
  },
  [SDKTypes.OnCustomEvent]: { ...triggerUiSchema },
  [SDKTypes.OnDialogEvent]: { ...triggerUiSchema },
  [SDKTypes.OnEndOfConversationActivity]: { ...triggerUiSchema },
  [SDKTypes.OnError]: { ...triggerUiSchema },
  [SDKTypes.OnEventActivity]: { ...triggerUiSchema },
  [SDKTypes.OnHandoffActivity]: { ...triggerUiSchema },
  [SDKTypes.OnIntent]: {
    order: ['intent', 'condition', 'entities', '*'],
    hidden: ['actions'],
    properties: {
      intent: {
        field: IntentField,
      },
    },
  },
  [SDKTypes.OnInvokeActivity]: { ...triggerUiSchema },
  [SDKTypes.OnMessageActivity]: { ...triggerUiSchema },
  [SDKTypes.OnMessageDeleteActivity]: { ...triggerUiSchema },
  [SDKTypes.OnMessageReactionActivity]: { ...triggerUiSchema },
  [SDKTypes.OnMessageUpdateActivity]: { ...triggerUiSchema },
  [SDKTypes.OnRepromptDialog]: { ...triggerUiSchema },
  [SDKTypes.OnTypingActivity]: { ...triggerUiSchema },
  [SDKTypes.OnUnknownIntent]: { ...triggerUiSchema },
  [SDKTypes.QnAMakerDialog]: {
    helpLink: 'https://aka.ms/bfc-using-QnA',
  },
  [SDKTypes.Recognizer]: { field: RecognizerField },
  [SDKTypes.RegexRecognizer]: { hidden: ['entities'] },
  [SDKTypes.RepeatDialog]: {
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['options', 'includeActivity', '*'],
  },
  [SDKTypes.ReplaceDialog]: {
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'options', 'includeActivity', '*'],
  },
  [SDKTypes.SendActivity]: {
    helpLink: 'https://aka.ms/bfc-send-activity',
    order: ['activity', '*'],
  },
  [SDKTypes.SetProperty]: {
    helpLink: 'https://aka.ms/bfc-using-memory',
    label: () => formatMessage('Set a Property'),
  },
  [SDKTypes.SetProperties]: {
    helpLink: 'https://aka.ms/bfc-using-memory',
    label: () => formatMessage('Set Properties'),
  },
  [SDKTypes.SkillDialog]: {
    helpLink: 'https://aka.ms/bfc-call-skill',
  },
  [SDKTypes.SwitchCondition]: {
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
    hidden: ['default'],
    properties: { cases: { hidden: ['actions'] } },
  },
  [SDKTypes.TextInput]: {
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.TraceActivity]: {
    helpLink: 'https://aka.ms/bfc-debugging-bots',
  },
  [SDKTypes.Recognizer]: {
    helpLink: 'https://aka.ms/BFC-Using-LU',
  },
};

export default DefaultUISchema;
