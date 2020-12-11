// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useRef, Fragment, useEffect } from 'react';
import { TextField, ITextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { NeutralColors } from '@uifabric/fluent-theme';

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
  onRenderLabel?: IRenderFunction<ITextFieldProps>;
  required?: boolean;
  id?: string;
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

const defaultRenderLabel = (props, defaultRender) => {
  return defaultRender(props);
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
    onRenderLabel = defaultRenderLabel,
  } = props;
  const [isDisabled, setDisabled] = useState<boolean>(!value);
  const fieldComponentRef = useRef<ITextField>(null);
  const [autoFoucsOnTextField, setAutoFoucsOnTextField] = useState<boolean>();
  const [localValue, setLocalValue] = useState<string>(value);
  useEffect(() => {
    if (autoFoucsOnTextField) {
      fieldComponentRef.current?.focus();
    }
  }, [autoFoucsOnTextField]);

  useEffect(() => {
    setLocalValue(value);
    setDisabled(!value);
  }, [value]);

  const commonProps = {
    id,
    label,
    required,
    onRenderLabel,
    'aria-label': ariaLabel,
    componentRef: fieldComponentRef,
  };

  return (
    <Fragment>
      {isDisabled ? (
        <TextField
          {...commonProps}
          disabled
          errorMessage={required ? errorElement(errorMessage) : ''}
          placeholder={placeholderOnDisable}
          styles={disabledTextFieldStyle}
        />
      ) : (
        <TextField
          {...commonProps}
          disabled={isDisabled}
          placeholder={placeholder}
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
