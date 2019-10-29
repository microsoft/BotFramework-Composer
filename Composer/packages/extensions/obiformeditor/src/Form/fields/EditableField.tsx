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
import React, { useState, useEffect } from 'react';
import { TextField, ITextFieldStyles, ITextFieldProps } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';
import { mergeStyles } from '@uifabric/styling';

interface EditableFieldProps extends ITextFieldProps {
  onChange: (e: any, newTitle?: string) => void;
  styleOverrides?: Partial<ITextFieldStyles>;
  placeholder?: string;
  fontSize?: string;
}

export const EditableField: React.FC<EditableFieldProps> = props => {
  const { styleOverrides = {}, placeholder, fontSize, onChange, onBlur, value, ...rest } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<string | undefined>(value);
  const [hasBeenEdited, setHasBeenEdited] = useState<boolean>(false);

  useEffect(() => {
    if (!hasBeenEdited) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (_e: any, newValue?: string) => {
    setLocalValue(newValue);
    setHasBeenEdited(true);
    onChange(_e, newValue);
  };

  const handleCommit = (e: React.FocusEvent<HTMLInputElement>) => {
    setHasFocus(false);
    setEditing(false);
    onBlur && onBlur(e);
  };

  let borderColor: string | undefined = undefined;

  if (!editing) {
    borderColor = localValue ? 'transparent' : NeutralColors.gray30;
  }

  return (
    <div onMouseEnter={() => setEditing(true)} onMouseLeave={() => !hasFocus && setEditing(false)}>
      <TextField
        placeholder={placeholder || value}
        value={localValue}
        styles={{
          root: mergeStyles({ margin: '5px 0 7px -9px' }, styleOverrides.root),
          field: mergeStyles(
            {
              fontSize: fontSize,
              selectors: {
                '::placeholder': {
                  fontSize: fontSize,
                },
              },
            },
            styleOverrides.field
          ),
          fieldGroup: mergeStyles(
            {
              borderColor,
              transition: 'border-color 0.1s linear',
              selectors: {
                ':hover': {
                  borderColor: hasFocus ? undefined : NeutralColors.gray30,
                },
              },
            },
            styleOverrides.fieldGroup
          ),
        }}
        onBlur={handleCommit}
        onFocus={() => setHasFocus(true)}
        onChange={handleChange}
        autoComplete="off"
        {...rest}
      />
    </div>
  );
};
