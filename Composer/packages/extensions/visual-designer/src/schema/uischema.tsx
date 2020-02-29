// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes, getInputType } from '@bfc/shared';
import formatMessage from 'format-message';
import React from 'react';
import get from 'lodash/get';

import { ActionCard } from '../widgets/ActionCard';
import { ActivityRenderer } from '../widgets/ActivityRenderer';
import { DialogRefCard } from '../widgets/DialogRefCard';
import { PromptWidget } from '../widgets/PromptWidget';
import { IfConditionWidget } from '../widgets/IfConditionWidget';
import { SwitchConditionWidget } from '../widgets/SwitchConditionWidget';
import { ForeachWidget } from '../widgets/ForeachWidget';
import { ActionHeader } from '../widgets/ActionHeader';
import { ElementIcon } from '../utils/obiPropertyResolver';
import { ObiColors } from '../constants/ElementColors';
import { SingleLineDiv, BorderedDiv } from '../components/elements/styledComponents';
import { PropertyAssignmentSize, ChoiceInputSize } from '../constants/ElementSizes';
import { ListOverview } from '../components/common/ListOverview';

import { UISchema, UIWidget } from './uischema.types';

const BaseInputSchema: UIWidget = {
  'ui:widget': PromptWidget,
  botAsks: {
    'ui:widget': ActivityRenderer,
    title: data => `Bot Asks (${getInputType(data.$type)})`,
    field: 'prompt',
    defaultContent: '<prompt>',
    icon: ElementIcon.MessageBot,
    colors: {
      theme: ObiColors.BlueMagenta20,
      icon: ObiColors.BlueMagenta30,
    },
  },
  userInput: {
    'ui:widget': ActionCard,
    title: data => `User Input (${getInputType(data.$type)})`,
    disableSDKTitle: true,
    icon: ElementIcon.User,
    menu: 'none',
    content: data => data.property || '<property>',
    colors: {
      theme: ObiColors.LightBlue,
      icon: ObiColors.AzureBlue,
    },
  },
};

const ChoiceInputSchema: UIWidget = Object.assign({}, BaseInputSchema, {
  userInput: {
    'ui:widget': ActionCard,
    title: data => `User Input (${getInputType(data.$type)})`,
    disableSDKTitle: true,
    icon: ElementIcon.User,
    menu: 'none',
    content: data => <SingleLineDiv>{data.property || '<property>'}</SingleLineDiv>,
    children: data => {
      const renderItem = item => {
        const content = item.value;
        return (
          <BorderedDiv width={ChoiceInputSize.width} height={ChoiceInputSize.height} title={content}>
            {content}
          </BorderedDiv>
        );
      };
      return <ListOverview items={data.choices} renderItem={renderItem} maxCount={3} />;
    },
    colors: {
      theme: ObiColors.LightBlue,
      icon: ObiColors.AzureBlue,
    },
  },
});
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
    'ui:widget': ActivityRenderer,
    field: 'activity',
    icon: ElementIcon.MessageBot,
    colors: {
      theme: ObiColors.BlueMagenta20,
      icon: ObiColors.BlueMagenta30,
    },
  },
  [SDKTypes.AttachmentInput]: BaseInputSchema,
  [SDKTypes.ConfirmInput]: BaseInputSchema,
  [SDKTypes.DateTimeInput]: BaseInputSchema,
  [SDKTypes.NumberInput]: BaseInputSchema,
  [SDKTypes.TextInput]: BaseInputSchema,
  [SDKTypes.ChoiceInput]: ChoiceInputSchema,
  [SDKTypes.BeginDialog]: {
    'ui:widget': DialogRefCard,
    dialog: data => data.dialog,
  },
  [SDKTypes.ReplaceDialog]: {
    'ui:widget': DialogRefCard,
    dialog: data => data.dialog,
    getRefContent: data => dialogRef => <>Switch to {dialogRef}</>,
  },
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
    children: data => {
      const renderItem = item => {
        const content = `${item.property} = ${item.value}`;
        return (
          <SingleLineDiv
            width={PropertyAssignmentSize.width}
            height={PropertyAssignmentSize.height}
            title={content}
            style={{ paddingLeft: '3px' }}
          >
            {content}
          </SingleLineDiv>
        );
      };
      return <ListOverview items={data.assignments} renderItem={renderItem} maxCount={3} />;
    },
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
