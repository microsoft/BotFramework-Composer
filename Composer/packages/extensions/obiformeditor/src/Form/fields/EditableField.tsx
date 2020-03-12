// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { NeutralColors } from '@uifabric/fluent-theme';
import { mergeStyleSets } from '@uifabric/styling';

interface EditableFieldProps extends ITextFieldProps {
  onChange: (e: any, newTitle?: string) => void;
  placeholder?: string;
  fontSize?: string;
  options?: any;
  ariaLabel?: string;
}

export const EditableField: React.FC<EditableFieldProps> = props => {
  const { styles = {}, placeholder, fontSize, onChange, onBlur, value, ariaLabel, options = {}, ...rest } = props;
  const { transparentBorder } = options;
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
    borderColor = localValue || transparentBorder ? 'transparent' : NeutralColors.gray30;
  }

  console.log(ariaLabel);

  return (
    <div onMouseEnter={() => setEditing(true)} onMouseLeave={() => !hasFocus && setEditing(false)}>
      <TextField
        placeholder={placeholder || value}
        value={localValue}
        styles={mergeStyleSets(
          {
            root: { margin: '5px 0 7px 0' },
            field: {
              fontSize: fontSize,
              selectors: {
                '::placeholder': {
                  fontSize: fontSize,
                },
              },
            },
            fieldGroup: {
              borderColor,
              transition: 'border-color 0.1s linear',
              selectors: {
                ':hover': {
                  borderColor: hasFocus ? undefined : NeutralColors.gray30,
                },
              },
            },
          },
          styles
        )}
        onBlur={handleCommit}
        onFocus={() => setHasFocus(true)}
        onChange={handleChange}
        autoComplete="off"
        ariaLabel={ariaLabel}
        {...rest}
      />
    </div>
  );
};
