// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { RegexRecognizer } from '@bfc/shared';
import { DialogInfo } from '@bfc/indexers';

import { BFDWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';
import LuEditorWidget from './LuEditorWidget';

const EMPTY_OPTION = { key: '', text: '' };

enum RecognizerType {
  'regex',
  'luis',
}

function recognizerType(currentDialog: DialogInfo): RecognizerType | null {
  const recognizer = currentDialog.content.recognizer;
  if (!recognizer) {
    return null;
  }

  if (typeof recognizer === 'object' && recognizer.$type === 'Microsoft.RegexRecognizer') {
    return RecognizerType.regex;
  } else if (typeof recognizer === 'string') {
    return RecognizerType.luis;
  }

  return null;
}

function regexIntentOptions(currentDialog: DialogInfo): IDropdownOption[] {
  const recognizer = currentDialog.content.recognizer as RegexRecognizer;
  let options: IDropdownOption[] = [EMPTY_OPTION];

  if (!recognizer) {
    return options;
  }

  if (recognizer.intents) {
    options = options.concat(recognizer.intents.map(i => ({ key: i.intent, text: i.intent })));
  }

  return options;
}

export const IntentWidget: React.FC<BFDWidgetProps> = props => {
  const { disabled, onChange, id, onFocus, onBlur, value, formContext, placeholder, label, schema } = props;
  const { description } = schema;
  const { currentDialog } = formContext;
  let options: IDropdownOption[] = [];
  let widgetLabel = label;
  let isLuisSelected = false;

  switch (recognizerType(currentDialog)) {
    case RecognizerType.regex:
      options = regexIntentOptions(currentDialog);
      isLuisSelected = false;
      break;
    case RecognizerType.luis:
      widgetLabel = `Trigger phrases(intent name: #${value || ''})`;
      isLuisSelected = true;
      break;
    default:
      options = [EMPTY_OPTION];
      isLuisSelected = false;
      break;
  }

  const handleChange = (_e, option): void => {
    if (option) {
      onChange(option.key);
    }
  };

  return (
    <>
      <WidgetLabel label={widgetLabel} description={description} id={id} />
      {!isLuisSelected && (
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
      )}
      {isLuisSelected && <LuEditorWidget formContext={formContext} onChange={onChange} name={value} height={316} />}
    </>
  );
};
