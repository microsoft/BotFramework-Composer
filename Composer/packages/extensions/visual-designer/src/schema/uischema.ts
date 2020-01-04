// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes } from '@bfc/shared';

import { ActionCard } from '../widgets/ActionCard';

import { UISchema } from './uischema.types';

export const uiSchema: UISchema = {
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
