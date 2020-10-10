// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { TextField, ITextFieldStyles, ITextFieldProps, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { mergeStyleSets } from '@uifabric/styling';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';

import { FieldConfig, useForm } from '../hooks/useForm';
//------------------------
const defaultContainerStyle = (hasFocus, hasErrors) => css`
  display: flex;
  width: 100%;
  outline: ${hasErrors
    ? `2px solid ${SharedColors.red10}`
    : hasFocus
    ? `2px solid ${SharedColors.cyanBlue10}`
    : undefined};
  background: ${hasFocus || hasErrors ? NeutralColors.white : 'inherit'};
  margin-top: 2px;
  :hover .ms-Button-icon {
    visibility: visible;
  }
  .ms-TextField-field {
    cursor: pointer;
    padding-left: ${hasFocus || hasErrors ? '8px' : '0px'};
    :focus {
      cursor: inherit;
    }
  }
`;

//------------------------
type IconProps = {
  iconStyles?: Partial<IIconProps>;
  iconName: string;
  onClick?: () => void;
};

interface EditableFieldProps extends Omit<ITextFieldProps, 'onChange' | 'onFocus' | 'onBlur'> {
  autoAdjustHeight?: boolean;
  componentFocusOnmount?: boolean;
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
  name?: string;
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
    componentFocusOnmount = false,
    containerStyles,
    depth,
    required,
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
  const [initialValue, setInitialValue] = useState<string | undefined>('');
  const [hasBeenEdited, setHasBeenEdited] = useState<boolean>(false);

  const formConfig: FieldConfig<{ value: string }> = {
    value: {
      required: required,
      defaultValue: value,
    },
  };
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);

  const fieldRef = useRef<ITextField>(null);
  useEffect(() => {
    if (componentFocusOnmount) {
      fieldRef.current?.focus();
    }
  }, []);
  useEffect(() => {
    if (!hasBeenEdited || value !== formData.value) {
      updateField('value', value);
    }
  }, [value]);

  useEffect(() => {
    if (hasFocus) {
      setInitialValue(formData.value);
    }
  }, [hasFocus]);

  const resetValue = () => {
    updateField('value', '');
    fieldRef.current?.focus();
  };

  const handleChange = (_e: any, newValue?: string) => {
    updateField('value', newValue);
    setHasBeenEdited(true);
    onChange(newValue);
  };

  const handleCommit = () => {
    setHasFocus(false);
    setEditing(false);
    onBlur && onBlur(id, formData.value);
  };

  const handleOnFocus = () => {
    setHasFocus(true);
    onFocus && onFocus();
  };

  const cancel = () => {
    setHasFocus(false);
    setEditing(false);
    updateField('value', initialValue);
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
    borderColor = formData.value || transparentBorder || depth > 1 ? 'transparent' : NeutralColors.gray30;
  }
  return (
    <Fragment>
      <div css={[defaultContainerStyle(hasFocus, hasErrors), containerStyles]} data-test-id={'EditableFieldContainer'}>
        <TextField
          key={`${id}${autoAdjustHeight}`} // force update component
          ariaLabel={ariaLabel}
          autoAdjustHeight={autoAdjustHeight}
          autoComplete="off"
          className={className}
          componentRef={fieldRef}
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
                      background: hasFocus || hasErrors ? NeutralColors.white : 'inherit',
                    },
                  },
                },
              },
              styles
            ) as Partial<ITextFieldStyles>
          }
          value={hasFocus ? formData.value : `${formData.value}${extraContent}`}
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
      {hasErrors && <span style={{ color: SharedColors.red20 }}>{formErrors.value}</span>}
      {error && <span style={{ color: SharedColors.red20 }}>{error}</span>}
    </Fragment>
  );
};

export { EditableField };
