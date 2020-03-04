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
import { SingleLineDiv, BorderedDiv, Text } from '../components/elements/styledComponents';
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
      data.$type === SDKTypes.ChoiceInput ? (
        <ListOverview
          items={data.choices}
          renderItem={item => (
            <BorderedDiv height={20} title={item.value}>
              {item.value}
            </BorderedDiv>
          )}
        />
      ) : null,
    footer: data =>
      data.property
        ? [<Text>{data.property}</Text>, <Text color="#757575"> = Input({getInputType(data.$type)})</Text>]
        : null,
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
      title: formatMessage('Branch'),
      content: data => data.condition,
    },
  },
  [SDKTypes.SwitchCondition]: {
    'ui:widget': SwitchConditionWidget,
    judgement: {
      'ui:widget': ActionCard,
      title: formatMessage('Branch'),
      content: data => data.condition,
    },
  },
  [SDKTypes.Foreach]: {
    'ui:widget': ForeachWidget,
    loop: {
      'ui:widget': ActionCard,
      title: formatMessage('Loop: For Each'),
      content: data => `${formatMessage('Each value in')} {${data.itemsProperty || '?'}}`,
    },
  },
  [SDKTypes.ForeachPage]: {
    'ui:widget': ForeachWidget,
    loop: {
      'ui:widget': ActionCard,
      title: formatMessage('Loop: For Each Page'),
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
    },
  },
  [SDKTypes.ReplaceDialog]: {
    'ui:widget': CardTemplate,
    header: {
      'ui:widget': ActionHeader,
    },
    body: {
      'ui:widget': DialogRef,
      dialog: data => data.dialog,
      getRefContent: data => dialogRef => <>Switch to {dialogRef}</>,
    },
  },
  [SDKTypes.EditArray]: {
    'ui:widget': ActionCard,
    content: data => `${data.changeType} {${data.itemsProperty || '?'}}`,
  },
  [SDKTypes.SetProperty]: {
    'ui:widget': ActionCard,
    content: data => `{${data.property || '?'}} = ${data.value || '?'}`,
  },
  [SDKTypes.SetProperties]: {
    'ui:widget': ActionCard,
    content: data => (
      <ListOverview
        items={data.assignments}
        itemPadding={8}
        renderItem={item => {
          const content = `${item.property} = ${item.value}`;
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
    content: data => `Delete ${Array.isArray(data.properties) ? data.properties.length : 0} properties`,
  },
  [SDKTypes.EndDialog]: {
    'ui:widget': ActionHeader,
  },
  [SDKTypes.RepeatDialog]: {
    'ui:widget': ActionHeader,
  },
  [SDKTypes.CancelAllDialogs]: {
    'ui:widget': ActionHeader,
  },
  [SDKTypes.EndTurn]: {
    'ui:widget': ActionHeader,
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
    'ui:widget': ActionCard,
    content: data => data.tokenProperty,
  },
};
