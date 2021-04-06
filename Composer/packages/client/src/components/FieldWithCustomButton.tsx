// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useRef, Fragment, useEffect } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { SharedColors } from '@uifabric/fluent-theme';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';

const disabledTextFieldStyle = {
  root: {
    selectors: {
      '.ms-TextField-field': {
        background: '#ddf3db',
      },
      '.ms-Dropdown-title': {
        background: '#ddf3db',
      },
      'p > span': {
        width: '100%',
      },
    },
  },
};

const actionButtonStyle = {
  root: {
    fontSize: '12px',
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    marginLeft: 0,
    marginTop: -12,
    paddingLeft: 0,
  },
};

const errorContainer = css`
  display: flex;
  width: 100%;
  height: 48px;
  line-height: 48px;
  background: #fed9cc;
  color: ${NeutralColors.black};
`;

const errorIcon = {
  root: {
    color: '#A80000',
    marginRight: 8,
    paddingLeft: 12,
    fontSize: '12px',
  },
};

const errorTextStyle = css`
  margin-bottom: 5px;
`;

const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

const customerLabel = css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
`;

const unknownIconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 3,
        },
      },
    },
  };
};

type Props = {
  label: string;
  ariaLabel: string;
  buttonText: string;
  errorMessage?;
  placeholder: string;
  placeholderOnDisable: string;
  value: string;
  onBlur?: (value) => void;
  onChange?: (e, value) => void;
  required?: boolean;
  id?: string;
  options?: IDropdownOption[];
};

const errorElement = (errorText: string) => {
  if (!errorText) return '';
  return (
    <span css={errorContainer}>
      <Icon iconName="ErrorBadge" styles={errorIcon} />
      <span css={errorTextStyle}>{errorText}</span>
    </span>
  );
};

const onRenderLabel = (props) => {
  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {props.label} </div>
      <TooltipHost content={props.label}>
        <Icon iconName="Unknown" styles={unknownIconStyle(props.required)} />
      </TooltipHost>
    </div>
  );
};

export const FieldWithCustomButton: React.FC<Props> = (props) => {
  const {
    label,
    placeholder,
    placeholderOnDisable,
    onChange,
    required = false,
    ariaLabel,
    value,
    buttonText,
    onBlur,
    errorMessage,
    id = '',
    options,
  } = props;
  const [isDisabled, setDisabled] = useState<boolean>(!value);
  const fieldComponentRef = useRef<any>(null);
  const [autoFocusOnTextField, setAutoFocusOnTextField] = useState<boolean>();
  const [localValue, setLocalValue] = useState<string>(value);
  useEffect(() => {
    if (autoFocusOnTextField) {
      fieldComponentRef.current?.focus();
    }
  }, [autoFocusOnTextField]);

  useEffect(() => {
    setLocalValue(value);
    setDisabled(!value);
  }, [value]);

  const commonProps = {
    id,
    label,
    required,
    ariaLabel,
  };
  const commonDisabledProps = {
    disabled: true,
    componentRef: fieldComponentRef,
    placeholder: placeholderOnDisable,
    styles: disabledTextFieldStyle,
    onRenderLabel,
  };
  const commonEnabledProps = {
    disabled: false,
    placeholder,
    onBlur: () => {
      if (!localValue) {
        setDisabled(true);
      }
      onBlur?.(localValue);
    },
  };

  const disabledField =
    options == null ? (
      <TextField {...commonProps} {...commonDisabledProps} errorMessage={required ? errorElement(errorMessage) : ''} />
    ) : (
      <Dropdown
        {...commonProps}
        {...commonDisabledProps}
        errorMessage={required ? errorMessage : ''}
        options={options}
      />
    );

  const enabledField =
    options == null ? (
      <TextField
        {...commonProps}
        {...commonEnabledProps}
        value={localValue}
        onChange={(e, value) => {
          setLocalValue(value ?? '');
          onChange?.(e, value);
        }}
      />
    ) : (
      <Dropdown
        {...commonProps}
        {...commonEnabledProps}
        options={options}
        selectedKey={localValue}
        onChange={(e, option: IDropdownOption | undefined) => {
          setLocalValue((option?.key as string) ?? '');
          onChange?.(e, option?.key);
        }}
      />
    );

  return (
    <Fragment>
      {isDisabled ? disabledField : enabledField}
      <ActionButton
        styles={actionButtonStyle}
        onClick={() => {
          setDisabled(false);
          setAutoFocusOnTextField(true);
        }}
      >
        {buttonText}
      </ActionButton>
    </Fragment>
  );
};
