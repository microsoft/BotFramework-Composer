// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { RegexRecognizer } from '@bfc/shared';
import { LuFile, DialogInfo } from '@bfc/indexers';

import { BFDWidgetProps, FormContext } from '../types';

import { WidgetLabel } from './WidgetLabel';

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

function luIntentOptions(formContext: FormContext): IDropdownOption[] {
  const luFile: LuFile | void = formContext.luFiles.find(f => f.id === formContext.currentDialog.id);
  let options: IDropdownOption[] = [EMPTY_OPTION];

  if (luFile) {
    const intents: { name: string }[] = luFile.intents.map(({ Name: name }) => {
      return {
        name,
      };
    });

    options = options.concat(
      intents.map(i => ({
        key: i.name,
        text: i.name,
      }))
    );
  }

  return options;
}

export const IntentWidget: React.FC<BFDWidgetProps> = props => {
  const { disabled, onChange, id, onFocus, onBlur, value, formContext, placeholder, label, schema } = props;
  const { description } = schema;
  let options: IDropdownOption[] = [];

  switch (recognizerType(formContext.currentDialog)) {
    case RecognizerType.regex:
      options = regexIntentOptions(formContext.currentDialog);
      break;
    case RecognizerType.luis:
      options = luIntentOptions(formContext);
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
  );
};
