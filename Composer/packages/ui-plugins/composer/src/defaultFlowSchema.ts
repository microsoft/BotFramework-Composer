// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';
import { FlowUISchema } from '@bfc/extension-client';

export const DefaultFlowSchema: FlowUISchema = {
  [SDKKinds.SendActivity]: {
    widget: 'ActionCard',
    body: '=action.activity',
  },
  [SDKKinds.AttachmentInput]: {
    widget: 'ActionCard',
    body: '=action.prompt',
  },
  [SDKKinds.ConfirmInput]: {
    widget: 'ActionCard',
    body: '=action.prompt',
  },
  [SDKKinds.DateTimeInput]: {
    widget: 'ActionCard',
    body: '=action.prompt',
  },
  [SDKKinds.NumberInput]: {
    widget: 'ActionCard',
    body: '=action.prompt',
  },
  [SDKKinds.TextInput]: {
    widget: 'ActionCard',
    body: '=action.prompt',
  },
  [SDKKinds.ChoiceInput]: {
    widget: 'ActionCard',
    body: '=action.prompt',
  },
  [SDKKinds.BeginDialog]: {
    widget: 'ActionCard',
    body: {
      widget: 'DialogRef',
      dialog: '=action.dialog',
    },
    footer: {
      widget: 'PropertyDescription',
      property: '=action.resultProperty',
      description: '= Return value',
    },
    hideFooter: '=!action.resultProperty',
  },
  [SDKKinds.BeginSkill]: {
    widget: 'ActionCard',
    colors: { theme: '#004578', color: '#FFFFFF', icon: '#FFFFFF' },
    icon: 'Library',
    body: {
      widget: 'ResourceOperation',
      operation: 'Host',
      resource: '=coalesce(action.skillEndpoint, "?")',
      singleline: true,
    },
    footer: {
      widget: 'PropertyDescription',
      property: '=action.resultProperty',
      description: '= Result',
    },
    hideFooter: '=!action.resultProperty',
  },
  [SDKKinds.ReplaceDialog]: {
    widget: 'ActionCard',
    body: {
      widget: 'DialogRef',
      dialog: '=action.dialog',
    },
  },
  [SDKKinds.EditArray]: {
    widget: 'ActionCard',
    body: {
      widget: 'ResourceOperation',
      operation: '=coalesce(action.changeType, "?")',
      resource: '=coalesce(action.itemsProperty, "?")',
    },
    footer: {
      widget: 'PropertyDescription',
      property: '=action.resultProperty',
      description: '= Result',
    },
    hideFooter: '=!action.resultProperty',
  },
  [SDKKinds.SetProperty]: {
    widget: 'ActionCard',
    body: '${coalesce(action.property, "?")} : ${coalesce(action.value, "?")}',
  },
  [SDKKinds.SetProperties]: {
    widget: 'ActionCard',
    body: {
      widget: 'ListOverview',
      items: '=foreach(action.assignments, x => concat(coalesce(x.property, "?"), " : ", coalesce(x.value, "?")))',
    },
  },
  [SDKKinds.DeleteProperty]: {
    widget: 'ActionCard',
    body: '=action.property',
  },
  [SDKKinds.DeleteProperties]: {
    widget: 'ActionCard',
    body: {
      widget: 'ListOverview',
      items: '=action.properties',
    },
  },
  [SDKKinds.DeleteActivity]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Delete activity',
    },
    body: {
      widget: 'PropertyDescription',
      property: '=coalesce(action.activityId, "?")',
      description: '= ActivityId',
    },
  },
  [SDKKinds.UpdateActivity]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Update activity',
    },
    body: '=action.activity',
  },
  [SDKKinds.CancelAllDialogs]: {
    widget: 'ActionCard',
    body: {
      widget: 'PropertyDescription',
      property: '=coalesce(action.eventName, "?")',
      description: '(Event)',
    },
  },
  [SDKKinds.EmitEvent]: {
    widget: 'ActionCard',
    body: {
      widget: 'PropertyDescription',
      property: '=coalesce(action.eventName, "?")',
      description: '(Event)',
    },
  },
  [SDKKinds.HttpRequest]: {
    widget: 'ActionCard',
    body: {
      widget: 'ResourceOperation',
      operation: '=action.method',
      resource: '=action.url',
      singleline: true,
    },
    footer: {
      widget: 'PropertyDescription',
      property: '=action.resultProperty',
      description: '= Result property',
    },
    hideFooter: '=!action.resultProperty',
  },
  [SDKKinds.EditActions]: {
    widget: 'ActionCard',
    body: '=action.changeType',
  },
  [SDKKinds.QnAMakerDialog]: {
    widget: 'ActionCard',
    body: '=action.hostname',
  },
  [SDKKinds.OAuthInput]: {
    widget: 'ActionCard',
    body: {
      widget: 'ResourceOperation',
      operation: 'Connection',
      resource: '=coalesce(action.connectionName, "?")',
      singleline: true,
    },
    footer: {
      widget: 'PropertyDescription',
      property: '=action.property',
      description: '= Token property',
    },
    hideFooter: '=!action.property',
  },
  [SDKKinds.TelemetryTrackEvent]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Telemetry - Trace Event',
    },
    body: {
      widget: 'PropertyDescription',
      property: '=coalesce(action.eventName, "?")',
      description: '(Event)',
    },
  },
};
