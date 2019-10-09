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
