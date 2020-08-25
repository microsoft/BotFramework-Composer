// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import React from 'react';
import get from 'lodash/get';
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
      body: (data) => data.condition,
    },
  },
  [SDKKinds.SwitchCondition]: {
    widget: 'SwitchConditionWidget',
    nowrap: true,
    judgement: {
      widget: 'ActionCard',
      body: (data) => data.condition,
    },
  },
  [SDKKinds.Foreach]: {
    widget: 'ForeachWidget',
    nowrap: true,
    loop: {
      widget: 'ActionCard',
      body: (data) => `${formatMessage('Each value in')} {${data.itemsProperty || '?'}}`,
    },
  },
  [SDKKinds.ForeachPage]: {
    widget: 'ForeachWidget',
    nowrap: true,
    loop: {
      widget: 'ActionCard',
      body: (data) => {
        const pageSizeString = get(data, 'pageSize', '?');
        const propString = get(data, 'itemsProperty', '?');
        return formatMessage('Each page of {pageSizeString} in {propString}', { pageSizeString, propString });
      },
    },
  },
  [SDKKinds.SendActivity]: {
    widget: 'ActionCard',
    body: (data) => data.activity,
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
      dialog: (data) => data.dialog,
      getRefContent: (data) => (dialogRef) => (
        <>
          {dialogRef || '?'} <FixedInfo>{formatMessage('(Dialog)')}</FixedInfo>
        </>
      ),
    },
    footer: (data) =>
      data.property ? (
        <>
          {data.property} <FixedInfo>{formatMessage('= Return value')}</FixedInfo>
        </>
      ) : null,
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
    footer: (data) =>
      data.resultProperty ? (
        <>
          {data.resultProperty}
          <FixedInfo>{formatMessage(' = Result')}</FixedInfo>
        </>
      ) : null,
  },
  [SDKKinds.ReplaceDialog]: {
    widget: 'ActionCard',
    body: {
      widget: 'DialogRef',
      dialog: (data) => data.dialog,
      getRefContent: (data) => (dialogRef) => (
        <>
          {dialogRef || '?'} <FixedInfo>{formatMessage('(Dialog)')}</FixedInfo>
        </>
      ),
    },
  },
  [SDKKinds.EditArray]: {
    widget: 'ActionCard',
    body: (data) => (
      <>
        <FixedInfo>{data.changeType || '?'}</FixedInfo> {data.itemsProperty || '?'}
      </>
    ),
    footer: (data) =>
      data.resultProperty ? (
        <>
          {data.resultProperty}
          <FixedInfo>{formatMessage(' = Result')}</FixedInfo>
        </>
      ) : null,
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
    body: (data) => data.activity,
  },
  [SDKKinds.DeleteProperty]: {
    widget: 'ActionCard',
    body: (data) => data.property,
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
    footer: (data) =>
      data.resultProperty ? (
        <>
          {data.resultProperty}
          <FixedInfo>{formatMessage(' = Result property')}</FixedInfo>
        </>
      ) : null,
  },
  [SDKKinds.EditActions]: {
    widget: 'ActionCard',
    body: (data) => data.changeType,
  },
  [SDKKinds.QnAMakerDialog]: {
    widget: 'ActionCard',
    body: (data) => data.hostname,
  },
  [SDKKinds.OAuthInput]: {
    widget: 'ActionCard',
    body: (data) => <SingleLineDiv>{data.connectionName}</SingleLineDiv>,
    footer: (data) =>
      data.tokenProperty ? (
        <>
          {data.tokenProperty}
          <FixedInfo>{formatMessage(' = Token Property')}</FixedInfo>
        </>
      ) : null,
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
