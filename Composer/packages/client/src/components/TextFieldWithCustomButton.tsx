// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useRef, Fragment, useEffect } from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { NeutralColors } from '@uifabric/fluent-theme';

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

const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

const customerLabel = css`
  font-size: ${FontSizes.size12};
  margin-right: 5px;
`;

const disabledTextFieldStyle = {
  root: {
    selectors: {
      '.ms-TextField-field': {
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
    fontSize: FontSizes.size12,
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
    fontSize: FontSizes.size12,
  },
};

const errorTextStyle = css`
  margin-bottom: 5px;
`;

type TextFieldWithCustomButtonProps = {
  label: string;
  ariaLabelledby: string;
  buttonText: string;
  errorMessage;
  placeholder: string;
  placeholderOnDisable: string;
  value: string;
  onBlur?: (value) => void;
  onChange?: (e, value) => void;
  required: boolean;
};

const errorElement = (errorText: string) => {
  if (!errorText) return '';
  return (
    <div css={errorContainer}>
      <Icon iconName="ErrorBadge" styles={errorIcon} />
      <div css={errorTextStyle}>{errorText}</div>
    </div>
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

export const TextFieldWithCustomButton: React.FC<TextFieldWithCustomButtonProps> = (props) => {
  const {
    label,
    placeholder,
    placeholderOnDisable,
    onChange,
    required,
    ariaLabelledby,
    value,
    buttonText,
    onBlur,
    errorMessage,
  } = props;
  const [isDisabled, setDisabled] = useState<boolean>(!value);
  const textFieldComponentRef = useRef<ITextField>(null);
  const [autoFoucsOnTextField, setAutoFoucsOnTextField] = useState<boolean>();
  const [localValue, setLocalValue] = useState<string>(value);
  useEffect(() => {
    if (autoFoucsOnTextField) {
      textFieldComponentRef.current?.focus();
    }
  }, [autoFoucsOnTextField]);

  useEffect(() => {
    setLocalValue(value);
    setDisabled(!value);
  }, [value]);

  return (
    <Fragment>
      {isDisabled ? (
        <TextField
          disabled
          errorMessage={required ? errorElement(errorMessage) : ''}
          label={label}
          placeholder={placeholderOnDisable}
          required={required}
          styles={disabledTextFieldStyle}
          onRenderLabel={onRenderLabel}
        />
      ) : (
        <TextField
          aria-labelledby={ariaLabelledby}
          componentRef={textFieldComponentRef}
          disabled={isDisabled}
          label={label}
          placeholder={placeholder}
          required={required}
          value={localValue}
          onBlur={() => {
            if (!localValue) {
              setDisabled(true);
            }
            onBlur && onBlur(localValue);
          }}
          onChange={(e, value) => {
            setLocalValue(value ?? '');
            onChange && onChange(e, value);
          }}
          onRenderLabel={onRenderLabel}
        />
      )}

      <ActionButton
        styles={actionButtonStyle}
        onClick={() => {
          setDisabled(false);
          setAutoFoucsOnTextField(true);
        }}
      >
        {buttonText}
      </ActionButton>
    </Fragment>
  );
};
