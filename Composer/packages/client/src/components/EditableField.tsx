// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css, SerializedStyles } from '@emotion/core';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { TextField, ITextFieldStyles, ITextFieldProps, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { mergeStyleSets } from '@uifabric/styling';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';

import { FieldConfig, useForm } from '../hooks/useForm';
import { colors } from '../constants';

const allowedNavigationKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp', 'Home', 'End'];

//------------------------
const defaultContainerStyle = (hasFocus, hasErrors) => css`
  display: flex;
  width: 100%;
  outline: ${hasErrors
    ? `2px solid ${colors.errorIcon}`
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

// turncat to show two line.
const maxCharacterNumbers = 120;

const isMultiLineText = (value?: string): boolean => {
  if (!value) return false;
  const valueTrimmed = value.trim();
  return (
    valueTrimmed.length > maxCharacterNumbers ||
    valueTrimmed.includes('\r') ||
    valueTrimmed.includes('\r\n') ||
    valueTrimmed.includes('\n')
  );
};

//------------------------
type IconProps = {
  iconStyles?: Partial<IIconProps>;
  iconName: string;
  onClick?: () => void;
};

interface EditableFieldProps extends Omit<ITextFieldProps, 'onChange' | 'onFocus' | 'onBlur'> {
  expanded?: boolean;
  componentFocusOnMount?: boolean;
  fontSize?: string;
  styles?: Partial<ITextFieldStyles>;
  transparentBorder?: boolean;
  ariaLabel?: string;
  error?: string | JSX.Element;
  extraContent?: string;
  containerStyles?: SerializedStyles;
  className?: string;
  depth: number;
  description?: string;
  disabled?: boolean;
  resizable?: boolean;
  requiredMessage?: string;
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
    componentFocusOnMount = false,
    containerStyles,
    depth,
    required,
    requiredMessage,
    extraContent = '',
    styles = {},
    iconProps,
    placeholder,
    fontSize,
    expanded = false,
    onChange,
    onFocus,
    onBlur,
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
  const [hasBeenEdited, setHasBeenEdited] = useState<boolean>(false);
  const [multiline, setMultiline] = useState<boolean>(true);

  const formConfig: FieldConfig<{ value: string }> = {
    value: {
      required: required,
      defaultValue: value,
    },
  };
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);

  const fieldRef = useRef<ITextField>(null);
  useEffect(() => {
    if (componentFocusOnMount) {
      fieldRef.current?.focus();
    }
  }, []);
  useEffect(() => {
    if (!hasBeenEdited || value !== formData.value) {
      updateField('value', value);
    }
  }, [value]);

  useEffect(() => {
    if (isMultiLineText(formData.value)) {
      setMultiline(true);
      return;
    }

    if (expanded || hasFocus) {
      if (isMultiLineText(formData.value)) {
        setMultiline(true);
      }
    }
    setMultiline(false);
  }, [expanded, hasFocus]);

  const resetValue = () => {
    updateField('value', '');
    setHasBeenEdited(true);
    fieldRef.current?.focus();
  };

  const handleChange = (_e, newValue?: string) => {
    if (isMultiLineText(newValue)) setMultiline(true);
    updateField('value', newValue);
    setHasBeenEdited(true);
    onChange(newValue);
  };

  const handleCommit = () => {
    setHasFocus(false);
    setEditing(false);

    // update view after resetValue
    if (!formData.value) {
      updateField('value', value);
    }
    onBlur?.(id, formData.value);
  };

  const handleOnFocus = () => {
    setHasFocus(true);
    onFocus?.();
  };

  const cancel = () => {
    setHasFocus(false);
    setEditing(false);
    updateField('value', value);
    fieldRef.current?.blur();
  };

  // press Enter to submit, Shift+Enter get a new line,
  const handleOnKeyDown = (e) => {
    // This prevents host DetailsList's FocusZone from stealing the focus and consuming the navigation keys.
    if (allowedNavigationKeys.includes(e.key)) {
      e.stopPropagation();
    }
    const enterOnField = e.key === 'Enter' && hasFocus;
    if (enterOnField && !multiline) {
      setMultiline(true);
    }
    if (enterOnField && !e.shiftKey) {
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

  const hasEditingErrors = hasErrors && hasBeenEdited;

  return (
    <Fragment>
      <div
        css={[defaultContainerStyle(hasFocus, hasEditingErrors), containerStyles]}
        data-test-id={'EditableFieldContainer'}
      >
        <TextField
          key={`${id}-${expanded}-${multiline}-${hasFocus}`} // force update component to trigger autoAdjustHeight
          ariaLabel={ariaLabel}
          autoAdjustHeight={expanded}
          autoComplete="off"
          className={className}
          componentRef={fieldRef}
          multiline={multiline}
          placeholder={placeholder || value}
          resizable={false}
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
                      background: hasFocus || hasEditingErrors ? NeutralColors.white : 'inherit',
                    },
                  },
                },
              },
              styles
            ) as Partial<ITextFieldStyles>
          }
          value={
            hasFocus || !extraContent || expanded
              ? formData.value
              : `${
                  formData.value.length > maxCharacterNumbers
                    ? formData.value.substring(0, maxCharacterNumbers) + '...'
                    : formData.value
                } ${extraContent}`
          }
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
      {hasErrors && hasBeenEdited && (
        <span style={{ color: colors.errorIcon }}>{requiredMessage || formErrors.value}</span>
      )}
      {error && <span style={{ color: colors.errorIcon }}>{error}</span>}
    </Fragment>
  );
};

export { EditableField };
