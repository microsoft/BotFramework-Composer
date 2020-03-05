// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { DialogInfo } from '@bfc/shared';

import { BFDWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';
import { LuEditorWidget } from './LuEditorWidget';

const EMPTY_OPTION = { key: '', text: '' };

enum RecognizerType {
  'regex',
  'luis',
}

function recognizerType({ content }: DialogInfo): RecognizerType | null {
  const { recognizer } = content;

  if (recognizer) {
    if (typeof recognizer === 'object' && recognizer.$type === 'Microsoft.RegexRecognizer') {
      return RecognizerType.regex;
    } else if (typeof recognizer === 'string') {
      return RecognizerType.luis;
    }
  }

  return null;
}

function regexIntentOptions({ content }: DialogInfo): IDropdownOption[] {
  const { recognizer } = content;
  return (recognizer?.intents || []).reduce(
    (acc, { intent }) => (intent ? [...acc, { key: intent, text: intent }] : acc),
    [EMPTY_OPTION]
  );
}

export const IntentWidget: React.FC<BFDWidgetProps> = props => {
  const { disabled, onChange, id, onFocus, onBlur, value, formContext, placeholder, label, schema } = props;
  const { description } = schema;
  const { currentDialog } = formContext;

  const type = recognizerType(currentDialog);
  const options: IDropdownOption[] = type === RecognizerType.regex ? regexIntentOptions(currentDialog) : [EMPTY_OPTION];

  const handleChange = (_e, option): void => {
    if (option) {
      onChange(option.key);
    }
  };

  return (
    <>
      {type === RecognizerType.luis ? (
        <LuEditorWidget formContext={formContext} name={value} height={316} />
      ) : (
        <>
          <WidgetLabel label={label} description={description} id={id} />
          <Dropdown
            id={id}
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
    </>
  );
};
