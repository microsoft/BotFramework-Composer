// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import get from 'lodash/get';
import { FieldProps, useShellApi } from '@bfc/extension';
import { SchemaField } from '@bfc/adaptive-form';
import { PromptTab } from '@bfc/shared';

import { tabs } from './styles';
import { BotAsks } from './BotAsks';
import { UserInput } from './UserInput';
import { GetSchema, PromptFieldChangeHandler, InputDialogKeys } from './types';

const OTHER_FIELDS: InputDialogKeys[] = [
  'unrecognizedPrompt',
  'validations',
  'invalidPrompt',
  'defaultValueResponse',
  'maxTurnCount',
  'defaultValue',
  'allowInterruptions',
  'alwaysPrompt',
  'recognizerOptions',
];

const PromptField: React.FC<FieldProps> = props => {
  const { shellApi, focusedSteps, focusedTab } = useShellApi();

  const getSchema: GetSchema = field => {
    const fieldSchema = get(props.schema, ['properties', field]);

    return fieldSchema;
  };

  const getError = field => {
    if (typeof props.rawErrors === 'object') {
      return props.rawErrors[field];
    }
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
      <Pivot linkSize={PivotLinkSize.large} selectedKey={focusedTab} styles={tabs} onLinkClick={handleTabChange}>
        <PivotItem headerText={formatMessage('Bot Asks')} itemKey={PromptTab.BOT_ASKS}>
          <BotAsks {...props} getSchema={getSchema} onChange={updateField} getError={getError} />
        </PivotItem>
        <PivotItem headerText={formatMessage('User Input')} itemKey={PromptTab.USER_INPUT}>
          <UserInput {...props} getSchema={getSchema} onChange={updateField} getError={getError} />
        </PivotItem>
        <PivotItem headerText={formatMessage('Other')} itemKey={PromptTab.OTHER}>
          {OTHER_FIELDS.filter(f => getSchema(f)).map(f => (
            <SchemaField
              key={f}
              depth={props.depth}
              id={`${props.id}.${f}`}
              name={f}
              rawErrors={getError(f)}
              schema={getSchema(f)}
              uiOptions={props.uiOptions.properties?.[f] || {}}
              value={props.value?.[f]}
              onChange={updateField(f)}
              definitions={props.definitions}
            />
          ))}
        </PivotItem>
      </Pivot>
    </div>
  );
};

export { PromptField };
