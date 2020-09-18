// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useEffect, useRef } from 'react';
import { TextField, ITextFieldStyles, ITextFieldProps, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { mergeStyleSets } from '@uifabric/styling';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
//------------------------
const defaultContainerStyle = (isHovered) => css`
  display: flex;
  width: 100%;
  outline: ${isHovered ? `2px solid ${SharedColors.cyanBlue10}` : undefined};
  margin-top: 2px;
  :hover .ms-Button-icon {
    visibility: visible;
  }
`;

//------------------------
interface IconProps {
  iconStyles?: Partial<IIconProps>;
  iconName: string;
  onClick?: () => void;
}

interface EditableFieldProps extends Omit<ITextFieldProps, 'onChange' | 'onFocus' | 'onBlur'> {
  autoAdjustHeight?: boolean;
  fontSize?: string;
  styles?: Partial<ITextFieldStyles>;
  transparentBorder?: boolean;
  ariaLabel?: string;
  error?: string | JSX.Element;
  extraContent?: string;
  containerStyles?: any;
  className?: string;
  depth: number;
  description?: string;
  disabled?: boolean;
  resizable?: boolean;
  id: string;
  name: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  value?: string;
  iconProps?: IconProps;
  enableIcon?: boolean;
  onBlur?: (id: string, value?: string) => void;
  onChange: (newValue?: string) => void;
  onFocus?: () => void;
}

const EditableField: React.FC<EditableFieldProps> = (props) => {
  const {
    containerStyles,
    depth,
    extraContent = '',
    styles = {},
    iconProps,
    placeholder,
    fontSize,
    autoAdjustHeight = false,
    multiline = false,
    onChange,
    onFocus,
    onBlur,
    resizable = true,
    value,
    id,
    error,
    className,
    transparentBorder,
    ariaLabel,
    enableIcon = false,
  } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<string | undefined>(value);
  const [initialValue, setInitialValue] = useState<string | undefined>('');
  const [hasBeenEdited, setHasBeenEdited] = useState<boolean>(false);
  const fieldRef = useRef<ITextField>(null);
  useEffect(() => {
    if (!hasBeenEdited || value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (hasFocus) {
      setInitialValue(localValue);
    }
  }, [hasFocus]);

  const resetValue = () => {
    setLocalValue('');
    fieldRef.current?.focus();
  };

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

  const handleOnFocus = () => {
    setHasFocus(true);
    onFocus && onFocus();
  };

  const cancel = () => {
    setHasFocus(false);
    setEditing(false);
    setLocalValue(initialValue);
    fieldRef.current?.blur();
  };

  const handleOnKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleCommit();
    }
    if (e.key === 'Escape') {
      cancel();
    }
  };

  let borderColor: string | undefined = undefined;

  if (!editing && !error) {
    borderColor = localValue || transparentBorder || depth > 1 ? 'transparent' : NeutralColors.gray30;
  }
  return (
    <div className={'EditableField-container'} css={[defaultContainerStyle(hasFocus), containerStyles]}>
      <TextField
        key={`${id}${autoAdjustHeight}`} // force update component
        ariaLabel={ariaLabel}
        autoAdjustHeight={autoAdjustHeight}
        autoComplete="off"
        className={className}
        componentRef={fieldRef}
        errorMessage={error as string}
        multiline={multiline}
        placeholder={placeholder || value}
        resizable={resizable}
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
                  '.ms-TextField-field': {
                    background: hasFocus ? NeutralColors.white : 'inherit',
                  },
                },
              },
            },
            styles
          ) as Partial<ITextFieldStyles>
        }
        value={hasFocus ? localValue : localValue + extraContent}
        onBlur={handleCommit}
        onChange={handleChange}
        onFocus={handleOnFocus}
        onKeyDown={handleOnKeyDown}
        onMouseEnter={() => setEditing(true)}
        onMouseLeave={() => !hasFocus && setEditing(false)}
      />
      {enableIcon && (
        <IconButton
          iconProps={{
            iconName: iconProps?.iconName,
            styles: mergeStyleSets(
              {
                root: {
                  color: NeutralColors.black,
                  visibility: 'hidden',
                },
              },
              iconProps?.iconStyles
            ),
          }}
          styles={{
            root: {
              background: hasFocus ? NeutralColors.white : 'inherit',
            },
          }}
          onClick={iconProps?.onClick || resetValue}
        />
      )}
    </div>
  );
};

export { EditableField };
