// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import get from 'lodash/get';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import { SchemaField } from '@bfc/adaptive-form';
import { PromptTab, PromptTabTitles } from '@bfc/shared';

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

const PromptField: React.FC<FieldProps> = (props) => {
  const { shellApi, focusedSteps, focusedTab } = useShellApi();

  const getSchema: GetSchema = (field) => {
    const fieldSchema = get(props.schema, ['properties', field]);

    return fieldSchema;
  };

  const getError = (field) => {
    if (typeof props.rawErrors === 'object') {
      return props.rawErrors[field];
    }
  };

  const updateField: PromptFieldChangeHandler = (field) => (data) => {
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
        <PivotItem headerText={PromptTabTitles[PromptTab.BOT_ASKS]()} itemKey={PromptTab.BOT_ASKS}>
          <BotAsks {...props} getError={getError} getSchema={getSchema} onChange={updateField} />
        </PivotItem>
        <PivotItem headerText={PromptTabTitles[PromptTab.USER_INPUT]()} itemKey={PromptTab.USER_INPUT}>
          <UserInput {...props} getError={getError} getSchema={getSchema} onChange={updateField} />
        </PivotItem>
        <PivotItem headerText={PromptTabTitles[PromptTab.OTHER]()} itemKey={PromptTab.OTHER}>
          {OTHER_FIELDS.filter((f) => getSchema(f)).map((f) => (
            <SchemaField
              key={f}
              definitions={props.definitions}
              depth={props.depth}
              id={`${props.id}.${f}`}
              name={f}
              rawErrors={getError(f)}
              schema={getSchema(f)}
              uiOptions={props.uiOptions.properties?.[f] || {}}
              value={props.value?.[f]}
              onChange={updateField(f)}
            />
          ))}
        </PivotItem>
      </Pivot>
    </div>
  );
};

export { PromptField };
