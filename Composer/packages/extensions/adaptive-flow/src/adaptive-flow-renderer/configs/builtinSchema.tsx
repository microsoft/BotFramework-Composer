// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';
import React from 'react';
import { SingleLineDiv, ListOverview, PropertyAssignment } from '@bfc/ui-shared';

import { FlowSchema, FlowWidget } from '../types/flowRenderer.types';
import { ObiColors } from '../constants/ElementColors';

const BaseInputSchema: FlowWidget = {
  widget: 'ActionCard',
  body: (data) => data.prompt,
};

const builtinVisualSDKSchema: FlowSchema = {
  default: {
    widget: 'ActionHeader',
  },
  custom: {
    widget: 'ActionHeader',
    colors: { theme: ObiColors.Gray20, color: ObiColors.White },
  },
  [SDKKinds.IfCondition]: {
    widget: 'IfConditionWidget',
    nowrap: true,
    judgement: {
      widget: 'ActionCard',
      body: '${coalesce(action.condition, "<condition>")}',
    },
  },
  [SDKKinds.SwitchCondition]: {
    widget: 'SwitchConditionWidget',
    nowrap: true,
    judgement: {
      widget: 'ActionCard',
      body: '${coalesce(action.condition, "<condition>")}',
    },
  },
  [SDKKinds.Foreach]: {
    widget: 'ForeachWidget',
    nowrap: true,
    loop: {
      widget: 'ActionCard',
      body: 'Each value in ${coalesce(action.itemsProperty, "?")}',
    },
  },
  [SDKKinds.ForeachPage]: {
    widget: 'ForeachWidget',
    nowrap: true,
    loop: {
      widget: 'ActionCard',
      body: 'Each page of ${action.pageSize} in ${action.propString}',
    },
  },
  [SDKKinds.SendActivity]: {
    widget: 'ActionCard',
    body: '${action.activity}',
  },
  [SDKKinds.AttachmentInput]: BaseInputSchema,
  [SDKKinds.ConfirmInput]: BaseInputSchema,
  [SDKKinds.DateTimeInput]: BaseInputSchema,
  [SDKKinds.NumberInput]: BaseInputSchema,
  [SDKKinds.TextInput]: BaseInputSchema,
  [SDKKinds.ChoiceInput]: BaseInputSchema,
  [SDKKinds.BeginDialog]: {
    widget: 'ActionCard',
    body: {
      widget: 'DialogRef',
      dialog: '${action.dialog}',
    },
    footer: {
      widget: 'PropertyDescription',
      property: '${action.resultProperty}',
      description: '= Return value',
    },
    hideFooter: '${!action.resultProperty}',
  },
  [SDKKinds.BeginSkill]: {
    widget: 'ActionCard',
    colors: { theme: ObiColors.DarkBlue, color: ObiColors.White, icon: ObiColors.White },
    icon: 'Library',
    body: {
      widget: 'ResourceOperation',
      operation: 'Host',
      resource: '${coalesce(action.skillEndpoint, "?")}',
      singleline: true,
    },
    footer: {
      widget: 'PropertyDescription',
      property: '${action.resultProperty}',
      description: '= Result',
    },
    hideFooter: '${!action.resultProperty}',
  },
  [SDKKinds.ReplaceDialog]: {
    widget: 'ActionCard',
    body: {
      widget: 'DialogRef',
      dialog: '${action.dialog}',
    },
  },
  [SDKKinds.EditArray]: {
    widget: 'ActionCard',
    body: {
      widget: 'ResourceOperation',
      operation: '${coalesce(action.changeType, "?")}',
      resource: '${coalesce(action.itemsProperty, "?")}',
    },
    footer: {
      widget: 'PropertyDescription',
      property: '${action.resultProperty}',
      description: '= Result',
    },
    hideFooter: '${!action.resultProperty}',
  },
  [SDKKinds.SetProperty]: {
    widget: 'ActionCard',
    body: (data) => <PropertyAssignment property={data.property} value={data.value} />,
  },
  [SDKKinds.SetProperties]: {
    widget: 'ActionCard',
    body: (data) => (
      <ListOverview
        itemPadding={8}
        items={data.assignments}
        renderItem={({ property, value }) => <PropertyAssignment property={property} value={value} />}
      />
    ),
  },
  [SDKKinds.DeleteProperty]: {
    widget: 'ActionCard',
    body: '${action.property}',
  },
  [SDKKinds.DeleteProperties]: {
    widget: 'ActionCard',
    body: (data) => (
      <ListOverview
        itemPadding={8}
        items={data.properties}
        renderItem={(item) => (
          <SingleLineDiv height={16} title={item}>
            {item}
          </SingleLineDiv>
        )}
      />
    ),
  },
  [SDKKinds.DeleteActivity]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Delete activity',
    },
    body: {
      widget: 'PropertyDescription',
      property: '${coalesce(action.activityId, "?")}',
      description: '= ActivityId',
    },
  },
  [SDKKinds.UpdateActivity]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Update activity',
    },
    body: '${action.activity}',
  },
  [SDKKinds.CancelAllDialogs]: {
    widget: 'ActionCard',
    body: {
      widget: 'PropertyDescription',
      property: '${coalesce(action.eventName, "?")}',
      description: '(Event)',
    },
  },
  [SDKKinds.EmitEvent]: {
    widget: 'ActionCard',
    body: {
      widget: 'PropertyDescription',
      property: '${coalesce(action.eventName, "?")}',
      description: '(Event)',
    },
  },
  [SDKKinds.HttpRequest]: {
    widget: 'ActionCard',
    body: {
      widget: 'ResourceOperation',
      operation: '${action.method}',
      resource: '${action.url}',
      singleline: true,
    },
    footer: {
      widget: 'PropertyDescription',
      property: '${action.resultProperty}',
      description: '= Result property',
    },
    hideFooter: '${!action.resultProperty}',
  },
  [SDKKinds.EditActions]: {
    widget: 'ActionCard',
    body: '${action.changeType}',
  },
  [SDKKinds.QnAMakerDialog]: {
    widget: 'ActionCard',
    body: '${action.hostname}',
  },
  [SDKKinds.OAuthInput]: {
    widget: 'ActionCard',
    body: {
      widget: 'ResourceOperation',
      operation: 'OAuth',
      resource: '${coalesce(action.connectionName, "?")}',
      singleline: true,
    },
    footer: {
      widget: 'PropertyDescription',
      property: '${action.property}',
      description: '= Token property',
    },
    hideFooter: '${!action.property}',
  },
  [SDKKinds.TelemetryTrackEvent]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Telemetry - Trace Event',
    },
    body: {
      widget: 'PropertyDescription',
      property: '${coalesce(action.eventName, "?")}',
      description: '(Event)',
    },
  },
};

export default builtinVisualSDKSchema;
