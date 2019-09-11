import React from 'react';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react';
import get from 'lodash.get';
import formatMessage from 'format-message';
import omit from 'lodash.omit';

import { LuFile, DialogInfo } from '../../types';
import { BFDWidgetProps, FormContext } from '../types';

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
    options = options.concat(Object.keys(recognizer.intents).map(i => ({ key: i, text: i })));
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
  const { disabled, onChange, id, onFocus, onBlur, value, formContext, placeholder, ...rest } = props;
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
      <Dropdown
        {...omit(rest, ['label', 'description'])}
        id={id.replace(/\.|#/g, '')}
        onBlur={() => onBlur(id, value)}
        onChange={handleChange}
        onFocus={() => onFocus(id, value)}
        options={options}
        selectedKey={value || null}
        responsiveMode={ResponsiveMode.large}
        disabled={disabled || options.length === 1}
        placeholder={options.length > 1 ? placeholder : formatMessage('No intents configured for this dialog')}
      />
    </>
  );
};
