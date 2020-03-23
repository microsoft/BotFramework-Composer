// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { SDKTypes } from '@bfc/shared';

import { BFDWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';
import { LuEditorWidget } from './LuEditorWidget';
import { RegexEditorWidget } from './RegexEditorWidget';

const EMPTY_OPTION = { key: '', text: '' };

interface IntentWidgetProps extends BFDWidgetProps {
  recognizerType?: string;
}

export const IntentWidget: React.FC<IntentWidgetProps> = props => {
  const {
    disabled,
    onChange,
    id,
    onFocus,
    onBlur,
    value,
    formContext,
    placeholder,
    label,
    schema,
    recognizerType,
  } = props;
  const { description } = schema;

  let options: IDropdownOption[] = [];

  switch (recognizerType) {
    case SDKTypes.RegexRecognizer:
    case SDKTypes.LuisRecognizer:
      break;
    default:
      options = [EMPTY_OPTION];
      break;
  }

  const handleChange = (_e, option): void => {
    if (option) {
      onChange(option.key);
    }
  };

  return (
    <>
      {recognizerType === SDKTypes.ValueRecognizer && (
        <>
          <WidgetLabel label={label} description={description} id={id} />
          <Dropdown
            id={id.replace(/\.|#/g, '')}
            onBlur={() => onBlur && onBlur(id, value)}
            onChange={handleChange}
            onFocus={() => onFocus && onFocus(id, value)}
            options={options}
            selectedKey={value || null}
            responsiveMode={ResponsiveMode.large}
            disabled={disabled || options.length === 1}
            placeholder={options.length > 1 ? placeholder : formatMessage('No intents configured for this dialog')}
          />
        </>
      )}
      {recognizerType === SDKTypes.LuisRecognizer && (
        <LuEditorWidget formContext={formContext} name={value} height={316} />
      )}
      {recognizerType === SDKTypes.RegexRecognizer && <RegexEditorWidget formContext={formContext} name={value} />}
    </>
  );
};
