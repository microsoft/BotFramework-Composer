/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps, IdSchema } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react';

import { BaseField } from '../BaseField';

import { tabs, tabsContainer, settingsContainer } from './styles';
import { BotAsks } from './BotAsks';
import { UserAnswers } from './UserAnswers';
import { Exceptions } from './Exceptions';
import { PromptSettings } from './PromptSettings';

export const PromptField: React.FC<FieldProps> = props => {
  const promptSettingsIdSchema = ({ __id: props.idSchema.__id + 'promptSettings' } as unknown) as IdSchema;

  return (
    <BaseField {...props}>
      <div css={tabsContainer}>
        <Pivot linkSize={PivotLinkSize.large} styles={tabs}>
          <PivotItem headerText={formatMessage('Bot Asks')} itemKey="botAsks">
            <BotAsks {...props} />
          </PivotItem>
          <PivotItem headerText={formatMessage('User Answers')} itemKey="userAnswers">
            <UserAnswers {...props} />
          </PivotItem>
          <PivotItem headerText={formatMessage('Exceptions')} itemKey="exceptions">
            <Exceptions {...props} />
          </PivotItem>
        </Pivot>
      </div>

      <div className="ObjectItem ObjectItemContainer" css={settingsContainer}>
        <div className="ObjectItemField">
          <BaseField
            formContext={props.formContext}
            formData={props.formData}
            idSchema={promptSettingsIdSchema}
            title={formatMessage('Prompt settings')}
            schema={{}}
          >
            <PromptSettings {...props} />
          </BaseField>
        </div>
      </div>
    </BaseField>
  );
};
