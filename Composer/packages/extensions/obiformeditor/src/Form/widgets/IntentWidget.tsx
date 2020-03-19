// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { DialogInfo } from '@bfc/indexers';

import { BFDWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';
import { LuEditorWidget } from './LuEditorWidget';
import { RegexEditorWidget } from './RegexEditorWidget';

const EMPTY_OPTION = { key: '', text: '' };

enum RecognizerType {
  'none',
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

  return RecognizerType.none;
}

export const IntentWidget: React.FC<BFDWidgetProps> = props => {
  const { disabled, onChange, id, onFocus, onBlur, value, formContext, placeholder, label, schema } = props;
  const { description } = schema;
  const { currentDialog } = formContext;

  const type = recognizerType(currentDialog);
  let options: IDropdownOption[] = [];

  switch (type) {
    case RecognizerType.regex:
    case RecognizerType.luis:
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
      {type === RecognizerType.none && (
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
      {type === RecognizerType.luis && <LuEditorWidget formContext={formContext} name={value} height={316} />}
      {type === RecognizerType.regex && <RegexEditorWidget formContext={formContext} name={value} />}
    </>
  );
};
