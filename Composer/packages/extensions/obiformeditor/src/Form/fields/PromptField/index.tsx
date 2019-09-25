/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react';

import { BaseField } from '../BaseField';

import { tabs } from './styles';
import { BotAsks } from './BotAsks';
import { UserAnswers } from './UserAnswers';

export const PromptField: React.FC<FieldProps> = props => {
  return (
    <BaseField {...props}>
      <Pivot linkSize={PivotLinkSize.large} styles={tabs}>
        <PivotItem headerText={formatMessage('Bot Asks')}>
          <BotAsks {...props} />
        </PivotItem>
        <PivotItem headerText={formatMessage('User Answers')}>user answers</PivotItem>
        <PivotItem headerText={formatMessage('Exceptions')}>exceptions</PivotItem>
      </Pivot>
    </BaseField>
  );
};
