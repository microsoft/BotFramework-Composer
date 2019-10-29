/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React from 'react';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react';
import get from 'lodash.get';
import formatMessage from 'format-message';
import { LuFile, DialogInfo, RegexRecognizer } from 'shared';

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
    const intents: { name: string }[] = get(luFile, 'parsedContent.LUISJsonStructure.intents', []);

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
