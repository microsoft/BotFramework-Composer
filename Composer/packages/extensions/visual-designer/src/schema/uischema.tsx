// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes, getInputType } from '@bfc/shared';
import formatMessage from 'format-message';
import React from 'react';
import get from 'lodash/get';

import { ActionCard } from '../widgets/ActionCard';
import { ActivityRenderer } from '../widgets/ActivityRenderer';
import { DialogRef } from '../widgets/DialogRef';
import { PromptWidget } from '../widgets/PromptWidget';
import { IfConditionWidget } from '../widgets/IfConditionWidget';
import { SwitchConditionWidget } from '../widgets/SwitchConditionWidget';
import { ForeachWidget } from '../widgets/ForeachWidget';
import { ActionHeader } from '../widgets/ActionHeader';
import { ElementIcon } from '../utils/obiPropertyResolver';
import { ObiColors } from '../constants/ElementColors';
import { SingleLineDiv, BorderedDiv, FixedInfo } from '../components/elements/styledComponents';
import { ListOverview } from '../components/common/ListOverview';
import { CardTemplate } from '../components/nodes/templates/CardTemplate';

import { UISchema, UIWidget } from './uischema.types';

const BaseInputSchema: UIWidget = {
  'ui:widget': PromptWidget,
  botAsks: {
    'ui:widget': CardTemplate,
    header: {
      'ui:widget': ActionHeader,
      title: data => `Bot Asks (${getInputType(data.$type)})`,
      icon: ElementIcon.MessageBot,
      colors: {
        theme: ObiColors.BlueMagenta20,
        icon: ObiColors.BlueMagenta30,
      },
    },
    body: {
      'ui:widget': ActivityRenderer,
      field: 'prompt',
      defaultContent: '<prompt>',
    },
  },
  userInput: {
    'ui:widget': CardTemplate,
    header: {
      'ui:widget': ActionHeader,
      title: data => `User Input (${getInputType(data.$type)})`,
      disableSDKTitle: true,
      icon: ElementIcon.User,
      menu: 'none',
      colors: {
        theme: ObiColors.LightBlue,
        icon: ObiColors.AzureBlue,
      },
    },
    body: data =>
      data.$type === SDKTypes.ChoiceInput && Array.isArray(data.choices) && data.choices.length ? (
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
          {data.property} <FixedInfo>= Input({getInputType(data.$type)})</FixedInfo>
        </>
      ) : null,
  },
};

export const uiSchema: UISchema = {
  default: {
    'ui:widget': ActionCard,
  },
  [SDKTypes.IfCondition]: {
    'ui:widget': IfConditionWidget,
    judgement: {
      'ui:widget': ActionCard,
      content: data => data.condition,
    },
  },
  [SDKTypes.SwitchCondition]: {
    'ui:widget': SwitchConditionWidget,
    judgement: {
      'ui:widget': ActionCard,
      content: data => data.condition,
    },
  },
  [SDKTypes.Foreach]: {
    'ui:widget': ForeachWidget,
    loop: {
      'ui:widget': ActionCard,
      content: data => `${formatMessage('Each value in')} {${data.itemsProperty || '?'}}`,
    },
  },
  [SDKTypes.ForeachPage]: {
    'ui:widget': ForeachWidget,
    loop: {
      'ui:widget': ActionCard,
      content: data => {
        const pageSizeString = get(data, 'pageSize', '?');
        const propString = get(data, 'itemsProperty', '?');
        return `${formatMessage('Each page of')} ${pageSizeString} ${formatMessage('in')} {${propString}}`;
      },
    },
  },
  [SDKTypes.SendActivity]: {
    'ui:widget': CardTemplate,
    header: {
      'ui:widget': ActionHeader,
      icon: ElementIcon.MessageBot,
      colors: {
        theme: ObiColors.BlueMagenta20,
        icon: ObiColors.BlueMagenta30,
      },
    },
    body: {
      'ui:widget': ActivityRenderer,
      field: 'activity',
    },
  },
  [SDKTypes.AttachmentInput]: BaseInputSchema,
  [SDKTypes.ConfirmInput]: BaseInputSchema,
  [SDKTypes.DateTimeInput]: BaseInputSchema,
  [SDKTypes.NumberInput]: BaseInputSchema,
  [SDKTypes.TextInput]: BaseInputSchema,
  [SDKTypes.ChoiceInput]: BaseInputSchema,
  [SDKTypes.BeginDialog]: {
    'ui:widget': CardTemplate,
    header: {
      'ui:widget': ActionHeader,
    },
    body: {
      'ui:widget': DialogRef,
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
  [SDKTypes.SkillDialog]: {
    'ui:widget': CardTemplate,
    header: {
      'ui:widget': ActionHeader,
    },
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
  [SDKTypes.ReplaceDialog]: {
    'ui:widget': ActionCard,
    content: {
      'ui:widget': DialogRef,
      dialog: data => data.dialog,
      getRefContent: data => dialogRef => (
        <>
          {dialogRef || '?'} <FixedInfo>(Dialog)</FixedInfo>
        </>
      ),
    },
  },
  [SDKTypes.EditArray]: {
    'ui:widget': CardTemplate,
    header: {
      'ui:widget': ActionHeader,
    },
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
  [SDKTypes.SetProperty]: {
    'ui:widget': ActionCard,
    content: data => `${data.property || '?'} : ${data.value || '?'}`,
  },
  [SDKTypes.SetProperties]: {
    'ui:widget': ActionCard,
    content: data => (
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
  [SDKTypes.DeleteProperty]: {
    'ui:widget': ActionCard,
    content: data => data.property,
  },
  [SDKTypes.DeleteProperties]: {
    'ui:widget': ActionCard,
    content: data => (
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
  [SDKTypes.EndDialog]: {
    'ui:widget': ActionHeader,
  },
  [SDKTypes.RepeatDialog]: {
    'ui:widget': ActionHeader,
  },
  [SDKTypes.CancelAllDialogs]: {
    'ui:widget': ActionCard,
    content: data =>
      data.eventName ? (
        <>
          {data.eventName || '?'}
          <FixedInfo> (Event)</FixedInfo>
        </>
      ) : null,
  },
  [SDKTypes.EndTurn]: {
    'ui:widget': ActionHeader,
  },
  [SDKTypes.EmitEvent]: {
    'ui:widget': ActionCard,
    content: data => (
      <>
        {data.eventName || '?'}
        <FixedInfo> (Event)</FixedInfo>
      </>
    ),
  },
  [SDKTypes.HttpRequest]: {
    'ui:widget': CardTemplate,
    header: {
      'ui:widget': ActionHeader,
    },
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
  [SDKTypes.TraceActivity]: {
    'ui:widget': ActionHeader,
  },
  [SDKTypes.LogAction]: {
    'ui:widget': ActionHeader,
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
    'ui:widget': CardTemplate,
    header: {
      'ui:widget': ActionHeader,
    },
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
