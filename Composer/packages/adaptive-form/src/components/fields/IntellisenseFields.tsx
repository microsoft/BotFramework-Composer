// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension-client';
import { Intellisense } from '@bfc/intellisense';
import React, { useRef, useState } from 'react';

import { getIntellisenseUrl } from '../../utils/getIntellisenseUrl';
import { ExpressionSwitchWindow } from '../expressions/ExpressionSwitchWindow';
import { ExpressionFieldToolbar } from '../expressions/ExpressionFieldToolbar';

import { JsonField } from './JsonField';
import { NumberField } from './NumberField';
import { StringField } from './StringField';

const noop = () => {};

export const IntellisenseTextField: React.FC<FieldProps<string>> = (props) => {
  const { id, value = '', onChange, uiOptions, focused: defaultFocused } = props;

  const completionListOverrideResolver = (value: string) => {
    return value === '' ? <ExpressionSwitchWindow kind={'String'} onSwitchToExpression={() => onChange('=')} /> : null;
  };

  const scopes = uiOptions.intellisenseScopes || [];
  const intellisenseServerUrlRef = useRef(getIntellisenseUrl());

  return (
    <Intellisense
      completionListOverrideResolver={completionListOverrideResolver}
      focused={defaultFocused}
      id={`intellisense-${id}`}
      scopes={scopes}
      url={intellisenseServerUrlRef.current}
      value={value}
      onBlur={props.onBlur}
      onChange={onChange}
    >
      {({
        textFieldValue,
        focused,
        cursorPosition,
        onValueChanged,
        onKeyDownTextField,
        onKeyUpTextField,
        onClickTextField,
      }) => (
        <StringField
          {...props}
          cursorPosition={cursorPosition}
          focused={focused}
          id={id}
          value={textFieldValue}
          onBlur={noop} // onBlur managed by Intellisense
          onChange={(newValue) => onValueChanged(newValue || '')}
          onClick={onClickTextField}
          onKeyDown={onKeyDownTextField}
          onKeyUp={onKeyUpTextField}
        />
      )}
    </Intellisense>
  );
};

export const IntellisenseExpressionField: React.FC<FieldProps<string>> = (props) => {
  const { id, value = '', onChange, focused: defaultFocused } = props;

  const scopes = ['expressions', 'user-variables'];
  const intellisenseServerUrlRef = useRef(getIntellisenseUrl());

  const [containerElm, setContainerElm] = useState<HTMLDivElement | null>(null);
  const [toolbarTargetElm, setToolbarTargetElm] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const focus = React.useCallback(
    (id: string, value?: string, event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event?.target) {
        event.stopPropagation();
        setToolbarTargetElm(event.target as HTMLInputElement | HTMLTextAreaElement);
      }
    },
    []
  );

  const onClearTarget = React.useCallback(() => {
    setToolbarTargetElm(null);
  }, []);

  return (
    <Intellisense
      focused={defaultFocused}
      id={`intellisense-${id}`}
      scopes={scopes}
      url={intellisenseServerUrlRef.current}
      value={value}
      onBlur={props.onBlur}
      onChange={onChange}
    >
      {({
        textFieldValue,
        focused,
        cursorPosition,
        onValueChanged,
        onKeyDownTextField,
        onKeyUpTextField,
        onClickTextField,
      }) => (
        <div ref={setContainerElm}>
          <StringField
            {...props}
            cursorPosition={cursorPosition}
            focused={focused}
            id={id}
            value={textFieldValue}
            onBlur={noop} // onBlur managed by Intellisense
            onChange={(newValue) => onValueChanged(newValue || '')}
            onClick={onClickTextField}
            onFocus={focus}
            onKeyDown={onKeyDownTextField}
            onKeyUp={onKeyUpTextField}
          />
          <ExpressionFieldToolbar
            container={containerElm}
            target={toolbarTargetElm}
            value={textFieldValue}
            onChange={onChange}
            onClearTarget={onClearTarget}
          />
        </div>
      )}
    </Intellisense>
  );
};

export const IntellisenseNumberField: React.FC<FieldProps<string>> = (props) => {
  const { id, value = '', onChange, uiOptions, focused: defaultFocused } = props;

  const completionListOverrideResolver = (value: string) => {
    return value === '' ? <ExpressionSwitchWindow kind={'Number'} onSwitchToExpression={() => onChange('=')} /> : null;
  };

  const scopes = uiOptions.intellisenseScopes || [];
  const intellisenseServerUrlRef = useRef(getIntellisenseUrl());

  return (
    <Intellisense
      completionListOverrideResolver={completionListOverrideResolver}
      focused={defaultFocused}
      id={`intellisense-${id}`}
      scopes={scopes}
      url={intellisenseServerUrlRef.current}
      value={value}
      onBlur={props.onBlur}
      onChange={onChange}
    >
      {({ textFieldValue, focused, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField }) => (
        <NumberField
          {...props}
          focused={focused}
          id={id}
          value={textFieldValue}
          onBlur={noop} // onBlur managed by Intellisense
          onChange={(newValue) => onValueChanged(newValue || 0)}
          onClick={onClickTextField}
          onKeyDown={onKeyDownTextField}
          onKeyUp={onKeyUpTextField}
        />
      )}
    </Intellisense>
  );
};

export const IntellisenseJSONField: React.FC<FieldProps<string>> = (props) => {
  const { id, value = '', onChange, focused: defaultFocused, schema } = props;

  const completionListOverrideResolver = (value: any) => {
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return (
        <ExpressionSwitchWindow
          kind="Object"
          onSwitchToExpression={() => {
            onChange('=');
          }}
        />
      );
    } else if (Array.isArray(value) && value.length === 0) {
      return (
        <ExpressionSwitchWindow
          kind="Array"
          onSwitchToExpression={() => {
            onChange('=');
          }}
        />
      );
    }
    return null;
  };

  const defaultValue = schema.type === 'object' ? {} : [];
  const scopes = ['expressions'];
  const intellisenseServerUrlRef = useRef(getIntellisenseUrl());

  return (
    <Intellisense
      completionListOverrideResolver={completionListOverrideResolver}
      focused={defaultFocused}
      id={`intellisense-${id}`}
      scopes={scopes}
      url={intellisenseServerUrlRef.current}
      value={value || defaultValue}
      onBlur={props.onBlur}
      onChange={onChange}
    >
      {({ textFieldValue, onValueChanged }) => (
        <JsonField
          {...props}
          style={{ height: 100 }}
          value={textFieldValue}
          onBlur={noop} // onBlur managed by Intellisense
          onChange={onValueChanged}
        />
      )}
    </Intellisense>
  );
};
