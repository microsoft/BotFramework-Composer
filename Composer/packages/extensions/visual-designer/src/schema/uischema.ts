// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes } from '@bfc/shared';

import { ActionCard } from '../widgets/ActionCard';
import { generateSDKTitle } from '../components/nodes/utils';

import { UISchema } from './uischema.types';

export const uiSchema: UISchema = {
  [SDKTypes.EditArray]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => `${data.changeType} {${data.itemsProperty || '?'}}`,
  },
  [SDKTypes.InitProperty]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => `{${data.property || '?'}} = new ${data.type || '?'}`,
  },
  [SDKTypes.SetProperty]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => `{${data.property || '?'}} = ${data.value || '?'}`,
  },
  [SDKTypes.SetProperties]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => `Set ${Array.isArray(data.assignments) ? data.assignments.length : 0} property values`,
  },
  [SDKTypes.DeleteProperty]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => `Delete ${Array.isArray(data.properties) ? data.properties.length : 0} properties`,
  },
  [SDKTypes.EndDialog]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: 'End this dialog',
  },
  [SDKTypes.CancelAllDialogs]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: 'Cancel all active dialogs',
  },
  [SDKTypes.EndTurn]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: 'Wait for another message',
  },
  [SDKTypes.EmitEvent]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => data.eventName,
  },
  [SDKTypes.HttpRequest]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => data.url,
  },
  [SDKTypes.TraceActivity]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => data.name,
  },
  [SDKTypes.LogAction]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => data.text,
  },
  [SDKTypes.EditActions]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => data.changeType,
  },
  [SDKTypes.QnAMakerDialog]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => data.hostname,
  },
  [SDKTypes.OAuthInput]: {
    'ui:widget': ActionCard,
    title: generateSDKTitle(),
    content: data => data.tokenProperty,
  },
};
