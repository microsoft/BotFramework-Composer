// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { BFDWidgetProps } from '../types';

import { ExpressionWidget } from './ExpressionWidget';
import { WidgetLabel } from './WidgetLabel';

const getInt = (value: string, step: number) => {
  return parseInt(value, 10) + step;
};

const getFloat = (value: string, step: number) => {
  return (parseFloat(value) + step).toFixed(step > 0 ? `${step}`.split('.')[1].length : step);
};

interface ITextWidgetProps extends BFDWidgetProps {
  hiddenErrMessage?: boolean;
  onValidate?: (err?: JSX.Element | string) => void;
}

export function TextWidget(props: ITextWidgetProps) {
  const {
    label,
    onBlur,
    onChange,
    onFocus,
    readonly,
    value,
    placeholder,
    schema,
    id,
    disabled,
    formContext,
    rawErrors,
    hiddenErrMessage,
    onValidate,
    options = {},
  } = props;
  const { description, examples = [], type, $role } = schema;
  const { hideLabel, transparentBorder } = options;
  let placeholderText = placeholder;

  if (!placeholderText && examples.length > 0) {
    placeholderText = `ex. ${examples.join(', ')}`;
  }

  const sharedProps = {
    disabled,
    id,
    value,
    autoComplete: 'off',
    onBlur: () => {
      onBlur && onBlur(id, value);
    },
    onChange: (_, newValue?: string) => onChange(newValue),
    onFocus: () => {
      onFocus && onFocus(id, value);
    },
    placeholder: placeholderText,
    readOnly: Boolean(schema.const) || readonly,
  };

  if ($role === 'expression') {
    return (
      <ExpressionWidget
        {...sharedProps}
        editable={transparentBorder}
        label={label}
        schema={schema}
        formContext={formContext}
        rawErrors={rawErrors}
        styles={{ root: { margin: 0 } }}
        hiddenErrMessage={hiddenErrMessage}
        onValidate={onValidate}
        options={options}
      />
    );
  }

  if (type === 'integer' || type === 'number') {
    const updateValue = (step: number) => (value: string) => {
      // if the number is a float, we need to convert to a fixed decimal place
      // in order to avoid floating point math rounding errors (ex. 1.2000000001)
      // ex. if step = 0.01, we fix to 2 decimals
      const newValue = type === 'integer' ? getInt(value, step) : getFloat(value, step);

      onChange(newValue);
      // need to allow form data to propagate before flushing to state
      setTimeout(() => onBlur && onBlur(id, value));
    };

    const step = type === 'integer' ? 1 : 0.1;

    return (
      <>
        {!hideLabel && <WidgetLabel label={label} description={description} id={id} />}
        <SpinButton
          onDecrement={updateValue(-step)}
          onIncrement={updateValue(step)}
          onValidate={updateValue(0)}
          disabled={Boolean(schema.const) || readonly || disabled}
          step={step}
          value={value}
          styles={{
            labelWrapper: { display: 'none' },
          }}
        />
      </>
    );
  }

  return (
    <>
      {!hideLabel && <WidgetLabel label={label} description={description} id={id} />}
      <TextField
        styles={{
          fieldGroup: {
            borderColor: transparentBorder ? 'transparent' : undefined,
            transition: 'border-color 0.1s linear',
            selectors: {
              ':hover': {
                borderColor: transparentBorder ? NeutralColors.gray30 : undefined,
              },
            },
          },
        }}
        ariaLabel={
          // if we hide the widget label above, ARIA will need the label to exist here instead
          hideLabel ? label : undefined
        }
        {...sharedProps}
      />
    </>
  );
}

TextWidget.defaultProps = {
  schema: {},
  options: {},
  onBlur: () => {},
  onFocus: () => {},
};
