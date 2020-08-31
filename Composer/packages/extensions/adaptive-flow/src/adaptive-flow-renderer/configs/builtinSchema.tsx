// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import React from 'react';
import { FixedInfo, SingleLineDiv, ListOverview, PropertyAssignment } from '@bfc/ui-shared';

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
      property: (data) => data.resultProperty,
      description: '= Return value',
    },
    hideFooter: (data) => !data.resultProperty,
  },
  [SDKKinds.BeginSkill]: {
    widget: 'ActionCard',
    colors: { theme: ObiColors.DarkBlue, color: ObiColors.White, icon: ObiColors.White },
    icon: 'Library',
    body: (data) => (
      <SingleLineDiv>
        <FixedInfo>{formatMessage('Host ')}</FixedInfo>
        {data.skillEndpoint || '?'}
      </SingleLineDiv>
    ),
    footer: {
      widget: 'PropertyDescription',
      property: (data) => data.resultProperty,
      description: '= Result',
    },
    hideFooter: (data) => !data.resultProperty,
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
    body: (data) => (
      <>
        <FixedInfo>{data.changeType || '?'}</FixedInfo> {data.itemsProperty || '?'}
      </>
    ),
    footer: {
      widget: 'PropertyDescription',
      property: (data) => data.resultProperty,
      description: '= Result',
    },
    hideFooter: (data) => !data.resultProperty,
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
  [SDKKinds.DeleteActivity]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Delete activity',
    },
    body: (data) => (
      <>
        <FixedInfo>{data.activityId || '?'}</FixedInfo>
      </>
    ),
  },
  [SDKKinds.UpdateActivity]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Update activity',
    },
    body: '${action.activity}',
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
  [SDKKinds.CancelAllDialogs]: {
    widget: 'ActionCard',
    body: (data) =>
      data.eventName ? (
        <>
          {data.eventName || '?'}
          <FixedInfo>{formatMessage(' (Event)')}</FixedInfo>
        </>
      ) : null,
  },
  [SDKKinds.EmitEvent]: {
    widget: 'ActionCard',
    body: (data) => (
      <>
        {data.eventName || '?'}
        <FixedInfo>{formatMessage(' (Event)')}</FixedInfo>
      </>
    ),
  },
  [SDKKinds.HttpRequest]: {
    widget: 'ActionCard',
    body: (data) => (
      <SingleLineDiv>
        <FixedInfo>{data.method} </FixedInfo>
        {data.url}
      </SingleLineDiv>
    ),
    footer: {
      widget: 'PropertyDescription',
      property: (data) => data.resultProperty,
      description: '= Result property',
    },
    hideFooter: (data) => !data.resultProperty,
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
    // TODO: move single line / multi line as ActionCard config
    body: (data) => <SingleLineDiv>{data.connectionName}</SingleLineDiv>,
    footer: {
      widget: 'PropertyDescription',
      property: (data) => data.property,
      description: '= Token property',
    },
    hideFooter: (data) => !data.property,
  },
  [SDKKinds.TelemetryTrackEvent]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: 'Telemetry - Trace Event',
    },
    body: (data) => (
      <>
        {data.eventName || '?'}
        <FixedInfo>{formatMessage(' (Event)')}</FixedInfo>
      </>
    ),
  },
};

export default builtinVisualSDKSchema;
