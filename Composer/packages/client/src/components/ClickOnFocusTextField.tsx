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
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';

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
  font-size: ${FontSizes.small};
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

const ActionButtonStyle = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    marginLeft: 0,
    marginTop: -12,
    paddingLeft: 0,
  },
};

interface ClickOnFocusTextField {
  label: string;
  ariaLabelledby: string;
  buttonText: string;
  placeholder: string;
  placeholderOnDisable: string;
  value: string;
  onChange: (e, value) => void;
  required: boolean;
}

const onRenderLabel = (props: ITextFieldProps | undefined) => {
  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {props?.label} </div>
      <TooltipHost content={props?.label}>
        <Icon iconName={'Unknown'} styles={unknownIconStyle(props?.required)} />
      </TooltipHost>
    </div>
  );
};

const ClickOnFocusTextField: React.FC<ClickOnFocusTextField> = (props) => {
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
      {!isDisabled && (
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
            setLocalValue(value ? value : '');
            onChange(e, value);
          }}
          onRenderLabel={onRenderLabel}
        />
      )}

      {isDisabled && (
        <TextField
          disabled
          label={label}
          placeholder={placeholderOnDisable}
          required={required}
          styles={disabledTextFieldStyle}
          onRenderLabel={onRenderLabel}
        />
      )}

      <ActionButton
        styles={ActionButtonStyle}
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

export default ClickOnFocusTextField;
