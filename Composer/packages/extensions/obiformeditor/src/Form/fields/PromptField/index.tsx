// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { IdSchema } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react';
import get from 'lodash.get';
import { PromptTab } from '@bfc/shared';

import { BaseField } from '../BaseField';
import { BFDFieldProps } from '../../types';

import { tabs, tabsContainer, settingsContainer } from './styles';
import { BotAsks } from './BotAsks';
import { UserInput } from './UserInput';
import { Other } from './Other';
import { PromptSettings } from './PromptSettings';
import { GetSchema, PromptFieldChangeHandler } from './types';

export const PromptField: React.FC<BFDFieldProps> = props => {
  const { formContext } = props;
  const { shellApi, focusedTab, focusedSteps } = formContext;
  const promptSettingsIdSchema = ({ __id: props.idSchema.__id + 'promptSettings' } as unknown) as IdSchema;

  const getSchema: GetSchema = field => {
    const fieldSchema = get(props.schema, ['properties', field]);

    return fieldSchema;
  };

  const updateField: PromptFieldChangeHandler = field => data => {
    props.onChange({ ...props.formData, [field]: data });
  };

  const handleTabChange = (item?: PivotItem) => {
    if (item) {
      shellApi.onFocusSteps(focusedSteps, item.props.itemKey);
    }
  };

  return (
    <BaseField {...props}>
      <div css={tabsContainer}>
        <Pivot
          linkSize={PivotLinkSize.large}
          styles={tabs}
          selectedKey={focusedTab || PromptTab.BOT_ASKS}
          onLinkClick={handleTabChange}
        >
          <PivotItem headerText={formatMessage('Bot Asks')} itemKey={PromptTab.BOT_ASKS}>
            <BotAsks {...props} onChange={updateField} getSchema={getSchema} />
          </PivotItem>
          <PivotItem headerText={formatMessage('User Input')} itemKey={PromptTab.USER_INPUT}>
            <UserInput {...props} onChange={updateField} getSchema={getSchema} />
          </PivotItem>
          <PivotItem headerText={formatMessage('Other')} itemKey={PromptTab.OTHER}>
            <Other {...props} onChange={updateField} getSchema={getSchema} />
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
            <PromptSettings {...props} onChange={updateField} getSchema={getSchema} />
          </BaseField>
        </div>
      </div>
    </BaseField>
  );
};
