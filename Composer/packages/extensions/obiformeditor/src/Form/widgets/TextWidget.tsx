/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React from 'react';
import { TextField, SpinButton } from 'office-ui-fabric-react';

import { BFDWidgetProps } from '../types';

import { ExpressionWidget } from './ExpressionWidget';
import { WidgetLabel } from './WidgetLabel';

const getInt = (value: string, step: number) => {
  return parseInt(value, 10) + step;
};

const getFloat = (value: string, step: number) => {
  return (parseFloat(value) + step).toFixed(step > 0 ? `${step}`.split('.')[1].length : step);
};

export function TextWidget(props: BFDWidgetProps) {
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
  } = props;
  const { description, examples = [], type, $role } = schema;

  let placeholderText = placeholder;

  if (!placeholderText && examples.length > 0) {
    placeholderText = `ex. ${examples.join(', ')}`;
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
        <WidgetLabel label={label} description={description} id={id} />
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

  const sharedProps = {
    disabled,
    id,
    value,
    autoComplete: 'off',
    onBlur: () => onBlur && onBlur(id, value),
    onChange: (_, newValue?: string) => onChange(newValue),
    onFocus: () => onFocus && onFocus(id, value),
    placeholder: placeholderText,
    readOnly: Boolean(schema.const) || readonly,
  };

  if ($role === 'expression') {
    return (
      <ExpressionWidget
        {...sharedProps}
        label={label}
        schema={schema}
        formContext={formContext}
        rawErrors={rawErrors}
      />
    );
  }

  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <TextField {...sharedProps} />
    </>
  );
}

TextWidget.defaultProps = {
  schema: {},
  options: {},
  onBlur: () => {},
  onFocus: () => {},
};
