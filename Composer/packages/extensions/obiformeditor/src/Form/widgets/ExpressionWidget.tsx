// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { TextField, ITextFieldProps, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { JSONSchema6 } from 'json-schema';
import formatMessage from 'format-message';
import get from 'lodash/get';

import { FormContext } from '../types';
import { EditableField } from '../fields/EditableField';

import { WidgetLabel } from './WidgetLabel';

interface ExpresionWidgetProps extends ITextFieldProps {
  hiddenErrMessage?: boolean;
  onValidate?: (err?: JSX.Element | string) => void;
  formContext: FormContext;
  rawErrors?: string[];
  schema: JSONSchema6;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
  /** Set to true to display as inline text that is editable on hover */
  editable?: boolean;
  styles?: Partial<ITextFieldStyles>;
  options?: any;
}

const syntaxLink = (
  <Link
    href="https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/common-expression-language/prebuilt-functions.md"
    target="_blank"
    rel="noopener noreferrer"
  >
    {formatMessage('Refer to the syntax documentation here.')}
  </Link>
);

export const ExpressionWidget: React.FC<ExpresionWidgetProps> = props => {
  const {
    formContext,
    schema,
    id,
    label,
    value,
    editable,
    hiddenErrMessage,
    onValidate,
    options = {},
    ...rest
  } = props;
  const { description } = schema;
  const { hideLabel } = options;
  const name = props.id
    ?.split('_')
    .slice(1)
    .join('');

  const [errorMessage, setErrorMessage] = useState<JSX.Element | string>('');
  const getErrorMessage = (): JSX.Element | string => {
    const errMessage = name && get(formContext, ['formErrors', name], '');

    const messageBar = errMessage ? (
      <MessageBar
        messageBarType={MessageBarType.error}
        isMultiline={false}
        dismissButtonAriaLabel={formatMessage('Close')}
        overflowButtonAriaLabel={formatMessage('See more')}
      >
        {label}
        {errMessage}
        {syntaxLink}
      </MessageBar>
    ) : (
      ''
    );

    if (hiddenErrMessage) {
      onValidate?.(messageBar);
      // return span so text field shows error border
      return errMessage ? <span /> : '';
    } else {
      return errMessage ? messageBar : '';
    }
  };

  useEffect(() => {
    setErrorMessage(getErrorMessage());
  }, [formContext.formErrors, value]);

  const Field = editable ? EditableField : TextField;

  return (
    <>
      {!hideLabel && !!label && <WidgetLabel label={label} description={description} id={id} />}
      <Field
        {...rest}
        id={id}
        value={value}
        errorMessage={errorMessage}
        autoComplete="off"
        styles={{
          root: { ...(!hideLabel && !!label ? {} : { margin: '7px 0' }) },
          errorMessage: {
            display: hiddenErrMessage ? 'none' : 'block',
            paddingTop: 0,
          },
        }}
        options={options}
      />
    </>
  );
};
