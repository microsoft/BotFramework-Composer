// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { TextField, ITextFieldStyles, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { NeutralColors } from '@uifabric/fluent-theme';
import { mergeStyleSets } from '@uifabric/styling';

interface EditableFieldProps extends Omit<ITextFieldProps, 'onChange' | 'onFocus' | 'onBlur'> {
  fontSize?: string;
  styles?: Partial<ITextFieldStyles>;
  transparentBorder?: boolean;
  ariaLabel?: string;
  error?: string | JSX.Element;

  className?: string;
  depth: number;
  description?: string;
  disabled?: boolean;
  id: string;
  name: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  value?: string;

  onChange: (newValue?: string) => void;
  onFocus?: (id: string, value?: string) => void;
  onBlur?: (id: string, value?: string) => void;
}

const EditableField: React.FC<EditableFieldProps> = (props) => {
  const {
    depth,
    styles = {},
    placeholder,
    fontSize,
    multiline = false,
    onChange,
    onBlur,
    value,
    id,
    error,
    className,
    transparentBorder,
    ariaLabel,
  } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<string | undefined>(value);
  const [hasBeenEdited, setHasBeenEdited] = useState<boolean>(false);

  useEffect(() => {
    if (!hasBeenEdited || value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (_e: any, newValue?: string) => {
    setLocalValue(newValue);
    setHasBeenEdited(true);
    onChange(newValue);
  };

  const handleCommit = () => {
    setHasFocus(false);
    setEditing(false);
    onBlur && onBlur(id, localValue);
  };

  let borderColor: string | undefined = undefined;

  if (!editing && !error) {
    borderColor = localValue || transparentBorder || depth > 1 ? 'transparent' : NeutralColors.gray30;
  }

  return (
    <div
      className={className}
      onMouseEnter={() => setEditing(true)}
      onMouseLeave={() => !hasFocus && setEditing(false)}
    >
      <TextField
        ariaLabel={ariaLabel}
        autoComplete="off"
        errorMessage={error as string}
        multiline={multiline}
        placeholder={placeholder || value}
        styles={
          mergeStyleSets(
            {
              root: { margin: '0', width: '100%' },
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
          ) as Partial<ITextFieldStyles>
        }
        value={localValue}
        onBlur={handleCommit}
        onChange={handleChange}
        onFocus={() => setHasFocus(true)}
      />
    </div>
  );
};

export { EditableField };
