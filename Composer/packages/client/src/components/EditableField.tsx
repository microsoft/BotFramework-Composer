// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css, SerializedStyles } from '@emotion/react';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { TextField, ITextFieldStyles, ITextFieldProps, ITextField } from '@fluentui/react/lib/TextField';
import { NeutralColors, SharedColors } from '@fluentui/theme';
import { mergeStyleSets } from '@fluentui/style-utilities';
import { IconButton } from '@fluentui/react/lib/Button';
import { IIconProps } from '@fluentui/react/lib/Icon';
import { Announced } from '@fluentui/react/lib/Announced';
import formatMessage from 'format-message';

import { FieldConfig, useForm } from '../hooks/useForm';
import { useAfterRender } from '../hooks/useAfterRender';

const allowedNavigationKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp', 'Home', 'End'];

//------------------------
const defaultContainerStyle = (hasFocus, hasErrors) => css`
  display: flex;
  width: 100%;
  margin-top: 2px;
  @media (forced-colors: none) {
    background: ${hasFocus || hasErrors ? NeutralColors.white : 'inherit'};
    outline: ${hasErrors
      ? `2px solid ${SharedColors.red10}`
      : hasFocus
      ? `2px solid ${SharedColors.cyanBlue10}`
      : undefined};
  }
  :hover .ms-Button-icon,
  :focus-within .ms-Button-icon {
    visibility: visible;
  }
  .ms-TextField-field {
    min-height: 35px;
    cursor: pointer;
    padding-left: ${hasFocus || hasErrors ? '8px' : '0px'};
    :focus {
      cursor: inherit;
    }
  }
`;

const requiredText = css`
  @media (forced-colors: none) {
    color: ${SharedColors.red20};
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
  error?: string;
  onBlur?: (id: string, value?: string) => void;
  onChange: (newValue?: string) => void;
  onFocus?: () => void;
  onNewLine?: () => void;
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
    onNewLine,
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
  const onAfterRender = useAfterRender();

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
    if (enterOnField && !multiline && e.shiftKey) {
      e.stopPropagation();
      if (onNewLine) {
        onNewLine();
        return;
      }
      setMultiline(true);
      updateField('value', e.target.value + '\n');
      // wait for the textarea to be rendered and then restore focus and selection
      onAfterRender(() => {
        const len = fieldRef.current?.value?.length;
        fieldRef.current?.focus();
        if (len) {
          fieldRef.current?.setSelectionRange(len, len);
        }
      });
    }
    if (enterOnField && !e.shiftKey) {
      // blur triggers commit, so call blur to avoid multiple commits
      fieldRef.current?.blur();
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
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
                    '@media (forced-colors: none)': {
                      '.ms-TextField-field': {
                        background: hasFocus || hasEditingErrors ? NeutralColors.white : 'inherit',
                      },
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
            aria-label={formatMessage('Remove item {name}', { name: formData.value })}
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
                '@media (forced-colors: none)': {
                  background: hasFocus ? NeutralColors.white : 'inherit',
                },
              },
            }}
            onClick={iconProps?.onClick || resetValue}
          />
        )}
      </div>
      {hasErrors && hasBeenEdited && <span css={requiredText}>{requiredMessage || formErrors.value}</span>}
      {error && <span css={requiredText}>{error}</span>}
      {hasErrors && hasBeenEdited && <Announced message={requiredMessage || formErrors.value} role="alert" />}
      {error && <Announced message={error} role="alert" />}
    </Fragment>
  );
};

export { EditableField };
