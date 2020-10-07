// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension-client';
import { Intellisense } from '@bfc/intellisense';
import React from 'react';

import { getIntellisenseUrl } from '../../utils/getIntellisenseUrl';
import { ExpressionSwitchWindow } from '../ExpressionSwitchWindow';

import { JsonField } from './JsonField';
import { NumberField } from './NumberField';
import { StringField } from './StringField';

export const IntellisenseTextField: React.FC<FieldProps<string>> = function IntellisenseTextField(props) {
  const { id, value = '', onChange, uiOptions, focused: defaultFocused } = props;

  const completionListOverrideResolver = (value: string) => {
    if (value === '') {
      return <ExpressionSwitchWindow type={'String'} onSwitchToExpression={() => onChange('=')} />;
    } else {
      return null;
    }
  };

  return (
    <Intellisense
      completionListOverrideResolver={completionListOverrideResolver}
      focused={defaultFocused}
      id={`intellisense-${id}`}
      scopes={uiOptions.intellisenseScopes || []}
      url={getIntellisenseUrl()}
      value={value}
      onBlur={props.onBlur}
      onChange={onChange}
    >
      {({ textFieldValue, focused, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField }) => (
        <StringField
          {...props}
          focused={focused}
          id={id}
          value={textFieldValue}
          onBlur={undefined} // onBlur managed by Intellisense
          onChange={(newValue) => onValueChanged(newValue || '')}
          onClick={onClickTextField}
          onKeyDown={onKeyDownTextField}
          onKeyUp={onKeyUpTextField}
        />
      )}
    </Intellisense>
  );
};

export const IntellisenseNumberField: React.FC<FieldProps<string>> = function IntellisenseNumberField(props) {
  const { id, value = '', onChange, uiOptions } = props;

  const completionListOverrideResolver = (value: string) => {
    if (value === '') {
      return <ExpressionSwitchWindow type={'Number'} onSwitchToExpression={() => onChange('=')} />;
    } else {
      return null;
    }
  };

  return (
    <Intellisense
      completionListOverrideResolver={completionListOverrideResolver}
      id={`intellisense-${id}`}
      scopes={uiOptions.intellisenseScopes || []}
      url={getIntellisenseUrl()}
      value={value}
      onChange={onChange}
    >
      {({ textFieldValue, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField }) => (
        <NumberField
          {...props}
          id={id}
          value={textFieldValue}
          onChange={(newValue) => onValueChanged(newValue || 0)}
          onClick={onClickTextField}
          onKeyDown={onKeyDownTextField}
          onKeyUp={onKeyUpTextField}
        />
      )}
    </Intellisense>
  );
};

export const IntellisenseJSONField: React.FC<FieldProps<string>> = function IntellisenseJSONField(props) {
  const { id, value = '', onChange, focused: defaultFocused, schema } = props;

  const completionListOverrideResolver = (value: any) => {
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return (
        <ExpressionSwitchWindow
          type="Object"
          onSwitchToExpression={() => {
            onChange('=');
          }}
        />
      );
    } else if (Array.isArray(value) && value.length === 0) {
      return (
        <ExpressionSwitchWindow
          type="Array"
          onSwitchToExpression={() => {
            onChange('=');
          }}
        />
      );
    }
    return null;
  };

  const defaultValue = schema.type === 'object' ? {} : [];

  return (
    <Intellisense
      completionListOverrideResolver={completionListOverrideResolver}
      focused={defaultFocused}
      id={`intellisense-${id}`}
      scopes={['expressions']}
      url={getIntellisenseUrl()}
      value={value || defaultValue}
      onBlur={props.onBlur}
      onChange={onChange}
    >
      {({ textFieldValue, onValueChanged }) => (
        <JsonField
          {...props}
          style={{ height: 100 }}
          value={textFieldValue}
          onBlur={undefined} // onBlur managed by Intellisense
          onChange={onValueChanged}
        />
      )}
    </Intellisense>
  );
};
