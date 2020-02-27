// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps, useShellApi } from '@bfc/extension';
import { DialogInfo, LuFile } from '@bfc/indexers';
import formatMessage from 'format-message';

const EMPTY_OPTION = { key: '', text: '' };

function luIntentOptions(currentDialog: DialogInfo, luFiles: LuFile[]): IDropdownOption[] {
  const { id } = currentDialog;
  const luFile = luFiles.find(({ id: fileId }) => fileId === id);
  return (luFile?.intents || []).reduce((acc, { Name: intent }) => [...acc, { key: intent, text: intent }], [
    EMPTY_OPTION,
  ]);
}

function regexIntentOptions(currentDialog: DialogInfo): IDropdownOption[] {
  const {
    content: { recognizer },
  } = currentDialog;
  return (recognizer?.intents || []).reduce(
    (acc, { intent }) => (!!intent ? [...acc, { key: intent, text: intent }] : acc),
    [EMPTY_OPTION]
  );
}

function recognizerType(currentDialog: DialogInfo): RecognizerType | null {
  const { recognizer } = currentDialog.content;
  if (recognizer) {
    if (typeof recognizer === 'object' && recognizer.$type === 'Microsoft.RegexRecognizer') {
      return RecognizerType.regex;
    } else if (typeof recognizer === 'string') {
      return RecognizerType.luis;
    }
  }

  return null;
}

enum RecognizerType {
  'regex',
  'luis',
}

export const SelectIntent: React.FC<FieldProps> = ({
  description,
  disabled,
  id,
  label,
  onBlur,
  onChange,
  onFocus,
  value,
  placeholder,
  uiOptions,
}) => {
  const { currentDialog, luFiles } = useShellApi();

  const handleChange = (_, option): void => {
    if (option) {
      onChange(option.key);
    }
  };

  const options = useMemo(() => {
    const type = recognizerType(currentDialog);

    return type === RecognizerType.luis
      ? luIntentOptions(currentDialog, luFiles)
      : type === RecognizerType.regex
      ? regexIntentOptions(currentDialog)
      : [EMPTY_OPTION];
  }, [currentDialog, luFiles]);

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} />
      <Dropdown
        disabled={disabled || options.length === 1}
        id={id}
        options={options}
        placeholder={options.length > 1 ? placeholder : formatMessage('No intents configured for this dialog')}
        responsiveMode={ResponsiveMode.large}
        selectedKey={value || null}
        onBlur={() => onBlur && onBlur(id, value)}
        onChange={handleChange}
        onFocus={() => onFocus && onFocus(id, value)}
      />
    </React.Fragment>
  );
};
