// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes, getInputType } from '@bfc/shared';
import React from 'react';

import { ActionCard } from '../widgets/ActionCard';
import { ActivityRenderer } from '../widgets/ActivityRenderer';
import { DialogRefCard } from '../widgets/DialogRefCard';
import { PromptWidget } from '../widgets/PromptWidget';
import { ElementIcon } from '../utils/obiPropertyResolver';
import { ObiColors } from '../constants/ElementColors';

import { UISchema, UIWidget } from './uischema.types';

const BaseInputSchema: UIWidget = {
  'ui:widget': PromptWidget,
  botAsks: {
    'ui:widget': ActivityRenderer,
    title: data => `Bot Asks (${getInputType(data.$type)})`,
    field: 'prompt',
    defaultContent: '<prompt>',
    icon: ElementIcon.MessageBot,
    colors: {
      theme: ObiColors.BlueMagenta20,
      icon: ObiColors.BlueMagenta30,
    },
  },
  userInput: {
    'ui:widget': ActionCard,
    title: data => `User Answers (${getInputType(data.$type)})`,
    disableSDKTitle: true,
    icon: ElementIcon.User,
    menu: 'none',
    content: data => data.property || '<property>',
    colors: {
      theme: ObiColors.LightBlue,
      icon: ObiColors.AzureBlue,
    },
  },
};

export const uiSchema: UISchema = {
  default: {
    'ui:widget': ActionCard,
  },
  [SDKTypes.SendActivity]: {
    'ui:widget': ActivityRenderer,
    field: 'activity',
    icon: ElementIcon.MessageBot,
    colors: {
      theme: ObiColors.BlueMagenta20,
      icon: ObiColors.BlueMagenta30,
    },
  },
  [SDKTypes.AttachmentInput]: BaseInputSchema,
  [SDKTypes.ConfirmInput]: BaseInputSchema,
  [SDKTypes.DateTimeInput]: BaseInputSchema,
  [SDKTypes.NumberInput]: BaseInputSchema,
  [SDKTypes.TextInput]: BaseInputSchema,
  [SDKTypes.ChoiceInput]: BaseInputSchema,
  [SDKTypes.BeginDialog]: {
    'ui:widget': DialogRefCard,
    dialog: data => data.dialog,
  },
  [SDKTypes.ReplaceDialog]: {
    'ui:widget': DialogRefCard,
    dialog: data => data.dialog,
    getRefContent: data => dialogRef => <>Switch to {dialogRef}</>,
  },
  [SDKTypes.EditArray]: {
    'ui:widget': ActionCard,
    content: data => `${data.changeType} {${data.itemsProperty || '?'}}`,
  },
  [SDKTypes.InitProperty]: {
    'ui:widget': ActionCard,
    content: data => `{${data.property || '?'}} = new ${data.type || '?'}`,
  },
  [SDKTypes.SetProperty]: {
    'ui:widget': ActionCard,
    content: data => `{${data.property || '?'}} = ${data.value || '?'}`,
  },
  [SDKTypes.SetProperties]: {
    'ui:widget': ActionCard,
    content: data => `Set ${Array.isArray(data.assignments) ? data.assignments.length : 0} property values`,
  },
  [SDKTypes.DeleteProperty]: {
    'ui:widget': ActionCard,
    content: data => data.property,
  },
  [SDKTypes.DeleteProperties]: {
    'ui:widget': ActionCard,
    content: data => `Delete ${Array.isArray(data.properties) ? data.properties.length : 0} properties`,
  },
  [SDKTypes.EndDialog]: {
    'ui:widget': ActionCard,
    content: 'End this dialog',
  },
  [SDKTypes.CancelAllDialogs]: {
    'ui:widget': ActionCard,
    content: 'Cancel all active dialogs',
  },
  [SDKTypes.EndTurn]: {
    'ui:widget': ActionCard,
    content: 'Wait for another message',
  },
  [SDKTypes.EmitEvent]: {
    'ui:widget': ActionCard,
    content: data => data.eventName,
  },
  [SDKTypes.HttpRequest]: {
    'ui:widget': ActionCard,
    content: data => data.url,
  },
  [SDKTypes.TraceActivity]: {
    'ui:widget': ActionCard,
    content: data => data.name,
  },
  [SDKTypes.LogAction]: {
    'ui:widget': ActionCard,
    content: data => data.text,
  },
  [SDKTypes.EditActions]: {
    'ui:widget': ActionCard,
    content: data => data.changeType,
  },
  [SDKTypes.QnAMakerDialog]: {
    'ui:widget': ActionCard,
    content: data => data.hostname,
  },
  [SDKTypes.OAuthInput]: {
    'ui:widget': ActionCard,
    content: data => data.tokenProperty,
  },
};
