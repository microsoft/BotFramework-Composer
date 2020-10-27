// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useRef, Fragment, useEffect } from 'react';
import { TextField, ITextFieldProps, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';

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

type ClickOnFocusTextFieldProps = {
  label: string;
  ariaLabelledby: string;
  buttonText: string;
  placeholder: string;
  placeholderOnDisable: string;
  value: string;
  onChange: (e, value) => void;
  required: boolean;
};

const onRenderLabel = (props: ITextFieldProps | undefined) => {
  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {props?.label} </div>
      <TooltipHost content={props?.label}>
        <Icon iconName="Unknown" styles={unknownIconStyle(props?.required)} />
      </TooltipHost>
    </div>
  );
};

export const ClickOnFocusTextField: React.FC<ClickOnFocusTextFieldProps> = (props) => {
  const { label, placeholder, placeholderOnDisable, onChange, required, ariaLabelledby, value, buttonText } = props;
  const [isDisabled, setDisabled] = useState<boolean>(!value);
  const textFieldComponentRef = useRef<ITextField>(null);
  const [autoFoucsOnTextField, setAutoFoucsOnTextField] = useState<boolean>();
  const [localValue, setLocalValue] = useState<string>(value);
  useEffect(() => {
    if (autoFoucsOnTextField) {
      textFieldComponentRef.current?.focus();
    }
  }, [autoFoucsOnTextField]);
  return (
    <Fragment>
      {isDisabled ? (
        <TextField
          disabled
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
          }}
          onChange={(e, value) => {
            setLocalValue(value ?? '');
            onChange(e, value);
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
