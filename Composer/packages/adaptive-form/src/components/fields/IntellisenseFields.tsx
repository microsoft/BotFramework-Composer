// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension-client';
import { Intellisense } from '@bfc/intellisense';
import React from 'react';

import { getIntellisenseUrl } from '../../utils/getIntellisenseUrl';
import { ExpressionSwitchWindow } from '../ExpressionSwitchWindow';

import { NumberField } from './NumberField';
import { StringField } from './StringField';

export const IntellisenseTextField: React.FC<FieldProps<string>> = function IntellisenseField(props) {
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
      onChange={onChange}
    >
      {({ textFieldValue, focused, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField }) => (
        <StringField
          {...props}
          focused={focused}
          id={id}
          value={textFieldValue}
          onChange={(newValue) => onValueChanged(newValue || '')}
          onClick={onClickTextField}
          onKeyDown={onKeyDownTextField}
          onKeyUp={onKeyUpTextField}
        />
      )}
    </Intellisense>
  );
};

export const IntellisenseNumberField: React.FC<FieldProps<string>> = function IntellisenseField(props) {
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
