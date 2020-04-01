// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds, getInputType } from '@bfc/shared';
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
      title: data => `Bot Asks (${getInputType(data.$kind)})`,
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

export const uiSchema: UISchema = {
  default: {
    'ui:widget': ActionCard,
  },
  [SDKKinds.IfCondition]: {
    'ui:widget': IfConditionWidget,
    judgement: {
      'ui:widget': ActionCard,
      content: data => data.condition,
    },
  },
  [SDKKinds.SwitchCondition]: {
    'ui:widget': SwitchConditionWidget,
    judgement: {
      'ui:widget': ActionCard,
      content: data => data.condition,
    },
  },
  [SDKKinds.Foreach]: {
    'ui:widget': ForeachWidget,
    loop: {
      'ui:widget': ActionCard,
      content: data => `${formatMessage('Each value in')} {${data.itemsProperty || '?'}}`,
    },
  },
  [SDKKinds.ForeachPage]: {
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
  [SDKKinds.SendActivity]: {
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
  [SDKKinds.AttachmentInput]: BaseInputSchema,
  [SDKKinds.ConfirmInput]: BaseInputSchema,
  [SDKKinds.DateTimeInput]: BaseInputSchema,
  [SDKKinds.NumberInput]: BaseInputSchema,
  [SDKKinds.TextInput]: BaseInputSchema,
  [SDKKinds.ChoiceInput]: BaseInputSchema,
  [SDKKinds.BeginDialog]: {
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
  [SDKKinds.SkillDialog]: {
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
  [SDKKinds.ReplaceDialog]: {
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
  [SDKKinds.EditArray]: {
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
  [SDKKinds.SetProperty]: {
    'ui:widget': ActionCard,
    content: data => `${data.property || '?'} : ${data.value || '?'}`,
  },
  [SDKKinds.SetProperties]: {
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
  [SDKKinds.DeleteProperty]: {
    'ui:widget': ActionCard,
    content: data => data.property,
  },
  [SDKKinds.DeleteProperties]: {
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
  [SDKKinds.EndDialog]: {
    'ui:widget': ActionHeader,
  },
  [SDKKinds.RepeatDialog]: {
    'ui:widget': ActionHeader,
  },
  [SDKKinds.CancelAllDialogs]: {
    'ui:widget': ActionCard,
    content: data =>
      data.eventName ? (
        <>
          {data.eventName || '?'}
          <FixedInfo> (Event)</FixedInfo>
        </>
      ) : null,
  },
  [SDKKinds.EndTurn]: {
    'ui:widget': ActionHeader,
  },
  [SDKKinds.EmitEvent]: {
    'ui:widget': ActionCard,
    content: data => (
      <>
        {data.eventName || '?'}
        <FixedInfo> (Event)</FixedInfo>
      </>
    ),
  },
  [SDKKinds.HttpRequest]: {
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
  [SDKKinds.TraceActivity]: {
    'ui:widget': ActionHeader,
  },
  [SDKKinds.LogAction]: {
    'ui:widget': ActionHeader,
  },
  [SDKKinds.EditActions]: {
    'ui:widget': ActionCard,
    content: data => data.changeType,
  },
  [SDKKinds.QnAMakerDialog]: {
    'ui:widget': ActionCard,
    content: data => data.hostname,
  },
  [SDKKinds.OAuthInput]: {
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
