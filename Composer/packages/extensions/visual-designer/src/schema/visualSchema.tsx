// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds, getInputType } from '@bfc/shared';
import formatMessage from 'format-message';
import React from 'react';
import get from 'lodash/get';

import { ElementIcon } from '../utils/obiPropertyResolver';
import { ObiColors } from '../constants/ElementColors';
import { SingleLineDiv, BorderedDiv, FixedInfo } from '../components/elements/styledComponents';
import { ListOverview } from '../components/common/ListOverview';

import { VisualSchema, VisualWidget } from './visualSchema.types';

const BaseInputSchema: VisualWidget = {
  widget: 'PromptWidget',
  botAsks: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: data => `Bot Asks (${getInputType(data.$kind)})`,
      icon: ElementIcon.MessageBot,
      colors: {
        theme: ObiColors.BlueMagenta20,
        icon: ObiColors.BlueMagenta30,
      },
    },
    body: {
      widget: 'ActivityRenderer',
      field: 'prompt',
      defaultContent: '<prompt>',
    },
  },
  userInput: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: data => `User Input (${getInputType(data.$kind)})`,
      disableSDKTitle: true,
      icon: ElementIcon.User,
      menu: 'none',
      colors: {
        theme: ObiColors.LightBlue,
        icon: ObiColors.AzureBlue,
      },
    },
    body: data =>
      data.$kind === SDKKinds.ChoiceInput && Array.isArray(data.choices) && data.choices.length ? (
        <ListOverview
          items={data.choices}
          renderItem={item => {
            const value = typeof item === 'object' ? item.value : item;
            return (
              <BorderedDiv height={20} title={value}>
                {value}
              </BorderedDiv>
            );
          }}
        />
      ) : (
        <>{data.choices}</>
      ),
    footer: data =>
      data.property ? (
        <>
          {data.property} <FixedInfo>= Input({getInputType(data.$kind)})</FixedInfo>
        </>
      ) : null,
  },
};

export const visualSchema: VisualSchema = {
  default: {
    widget: 'ActionHeader',
  },
  [SDKKinds.IfCondition]: {
    widget: 'IfConditionWidget',
    judgement: {
      widget: 'ActionCard',
      body: data => data.condition,
    },
  },
  [SDKKinds.SwitchCondition]: {
    widget: 'SwitchConditionWidget',
    judgement: {
      widget: 'ActionCard',
      body: data => data.condition,
    },
  },
  [SDKKinds.Foreach]: {
    widget: 'ForeachWidget',
    loop: {
      widget: 'ActionCard',
      body: data => `${formatMessage('Each value in')} {${data.itemsProperty || '?'}}`,
    },
  },
  [SDKKinds.ForeachPage]: {
    widget: 'ForeachWidget',
    loop: {
      widget: 'ActionCard',
      body: data => {
        const pageSizeString = get(data, 'pageSize', '?');
        const propString = get(data, 'itemsProperty', '?');
        return `${formatMessage('Each page of')} ${pageSizeString} ${formatMessage('in')} {${propString}}`;
      },
    },
  },
  [SDKKinds.SendActivity]: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      icon: ElementIcon.MessageBot,
      colors: {
        theme: ObiColors.BlueMagenta20,
        icon: ObiColors.BlueMagenta30,
      },
    },
    body: {
      widget: 'ActivityRenderer',
      field: 'activity',
    },
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
      dialog: data => data.dialog,
      getRefContent: data => dialogRef => (
        <>
          {dialogRef || '?'} <FixedInfo>(Dialog)</FixedInfo>
        </>
      ),
    },
    footer: data =>
      data.property ? (
        <>
          {data.property} <FixedInfo>= Return value</FixedInfo>
        </>
      ) : null,
  },
  [SDKKinds.SkillDialog]: {
    widget: 'ActionCard',
    body: data => (
      <SingleLineDiv>
        <FixedInfo>Host </FixedInfo>
        {data.skillEndpoint || '?'}
      </SingleLineDiv>
    ),
    footer: data =>
      data.resultProperty ? (
        <>
          {data.resultProperty}
          <FixedInfo> = Result</FixedInfo>
        </>
      ) : null,
  },
  [SDKKinds.ReplaceDialog]: {
    widget: 'ActionCard',
    body: {
      widget: 'DialogRef',
      dialog: data => data.dialog,
      getRefContent: data => dialogRef => (
        <>
          {dialogRef || '?'} <FixedInfo>(Dialog)</FixedInfo>
        </>
      ),
    },
  },
  [SDKKinds.EditArray]: {
    widget: 'ActionCard',
    body: data => (
      <>
        <FixedInfo>{data.changeType || '?'}</FixedInfo> {data.itemsProperty || '?'}
      </>
    ),
    footer: data =>
      data.resultProperty ? (
        <>
          {data.resultProperty}
          <FixedInfo> = Result</FixedInfo>
        </>
      ) : null,
  },
  [SDKKinds.SetProperty]: {
    widget: 'ActionCard',
    body: data => `${data.property || '?'} : ${data.value || '?'}`,
  },
  [SDKKinds.SetProperties]: {
    widget: 'ActionCard',
    body: data => (
      <ListOverview
        items={data.assignments}
        itemPadding={8}
        renderItem={({ property, value }) => {
          const v = typeof value === 'object' ? JSON.stringify(value) : value;
          const content = `${property} : ${v}`;
          return (
            <SingleLineDiv height={16} title={content}>
              {content}
            </SingleLineDiv>
          );
        }}
      />
    ),
  },
  [SDKKinds.DeleteProperty]: {
    widget: 'ActionCard',
    body: data => data.property,
  },
  [SDKKinds.DeleteProperties]: {
    widget: 'ActionCard',
    body: data => (
      <ListOverview
        items={data.properties}
        itemPadding={8}
        renderItem={item => (
          <SingleLineDiv height={16} title={item}>
            {item}
          </SingleLineDiv>
        )}
      />
    ),
  },
  [SDKKinds.CancelAllDialogs]: {
    widget: 'ActionCard',
    body: data =>
      data.eventName ? (
        <>
          {data.eventName || '?'}
          <FixedInfo> (Event)</FixedInfo>
        </>
      ) : null,
  },
  [SDKKinds.EmitEvent]: {
    widget: 'ActionCard',
    body: data => (
      <>
        {data.eventName || '?'}
        <FixedInfo> (Event)</FixedInfo>
      </>
    ),
  },
  [SDKKinds.HttpRequest]: {
    widget: 'ActionCard',
    body: data => (
      <SingleLineDiv>
        <FixedInfo>{data.method} </FixedInfo>
        {data.url}
      </SingleLineDiv>
    ),
    footer: data =>
      data.resultProperty ? (
        <>
          {data.resultProperty}
          <FixedInfo> = Result property</FixedInfo>
        </>
      ) : null,
  },
  [SDKKinds.EditActions]: {
    widget: 'ActionCard',
    body: data => data.changeType,
  },
  [SDKKinds.QnAMakerDialog]: {
    widget: 'ActionCard',
    body: data => data.hostname,
  },
  [SDKKinds.OAuthInput]: {
    widget: 'ActionCard',
    body: data => <SingleLineDiv>{data.connectionName}</SingleLineDiv>,
    footer: data =>
      data.tokenProperty ? (
        <>
          {data.tokenProperty}
          <FixedInfo> = Token Property</FixedInfo>
        </>
      ) : null,
  },
};
