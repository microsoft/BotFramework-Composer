// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import get from 'lodash/get';
import { FieldProps, useShellApi } from '@bfc/extension';
import { SchemaField } from '@bfc/adaptive-form';

import { tabs, tabsContainer, settingsContainer, settingsHeader } from './styles';
import { BotAsks } from './BotAsks';
import { UserInput } from './UserInput';
import { PromptSettings } from './PromptSettings';
import { GetSchema, PromptFieldChangeHandler, InputDialogKeys } from './types';

const OTHER_FIELDS: InputDialogKeys[] = [
  'unrecognizedPrompt',
  'validations',
  'invalidPrompt',
  'value',
  'defaultValueResponse',
];

const PromptField: React.FC<FieldProps> = props => {
  const { shellApi, focusedSteps, focusedTab } = useShellApi();

  const getSchema: GetSchema = field => {
    const fieldSchema = get(props.schema, ['properties', field]);

    return fieldSchema;
  };

  const updateField: PromptFieldChangeHandler = field => data => {
    props.onChange({ ...props.value, [field]: data });
  };

  const handleTabChange = (item?: PivotItem) => {
    if (item) {
      shellApi.onFocusSteps(focusedSteps, item.props.itemKey);
    }
  };

  return (
    <div>
      <div css={tabsContainer}>
        <Pivot linkSize={PivotLinkSize.large} selectedKey={focusedTab} styles={tabs} onLinkClick={handleTabChange}>
          <PivotItem headerText={formatMessage('Bot Asks')} itemKey="botAsks">
            <BotAsks {...props} getSchema={getSchema} onChange={updateField} />
          </PivotItem>
          <PivotItem headerText={formatMessage('User Input')} itemKey="userInput">
            <UserInput {...props} getSchema={getSchema} onChange={updateField} />
          </PivotItem>
          <PivotItem headerText={formatMessage('Other')} itemKey="other">
            {OTHER_FIELDS.map(f => (
              <SchemaField
                key={f}
                depth={props.depth}
                id={`${props.id}.${f}`}
                name={f}
                rawErrors={props.rawErrors}
                schema={getSchema(f)}
                uiOptions={props.uiOptions.properties?.[f] || {}}
                value={props.value?.[f]}
                onChange={updateField(f)}
              />
            ))}
          </PivotItem>
        </Pivot>
      </div>

      <div css={settingsContainer}>
        <h3 css={settingsHeader}>{formatMessage('Prompt settings')}</h3>
        <PromptSettings {...props} getSchema={getSchema} onChange={updateField} />
      </div>
    </div>
  );
};

export { PromptField };
