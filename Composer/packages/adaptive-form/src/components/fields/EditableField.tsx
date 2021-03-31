// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { TextField, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import { NeutralColors } from '@uifabric/fluent-theme';
import { mergeStyleSets } from '@uifabric/styling';
import { FieldProps } from '@bfc/extension-client';

interface EditableFieldProps extends Omit<FieldProps, 'definitions'> {
  fontSize?: string;
  styles?: Partial<ITextFieldStyles>;
  ariaLabel?: string;
}

const EditableField: React.FC<EditableFieldProps> = (props) => {
  const { styles = {}, placeholder, fontSize, onChange, onBlur, value, id, error, className, ariaLabel } = props;
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
    onBlur?.(id, value);
  };

  let borderColor: string | undefined = undefined;

  if (!editing && !error) {
    borderColor = localValue ? 'transparent' : NeutralColors.gray30;
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
