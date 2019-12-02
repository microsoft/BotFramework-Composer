// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { TextField, ITextFieldProps, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import { MessageBar, MessageBarType, Link } from 'office-ui-fabric-react/lib';
import { JSONSchema6 } from 'json-schema';
import { SharedColors } from '@uifabric/fluent-theme';

import { FormContext } from '../types';
import { EditableField } from '../fields/EditableField';

import { WidgetLabel } from './WidgetLabel';

interface ExpresionWidgetProps extends ITextFieldProps {
  hiddenErrMessage?: boolean;
  onValidate?: (errMessage: JSX.Element | '') => void;
  formContext: FormContext;
  rawErrors?: string[];
  schema: JSONSchema6;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
  /** Set to true to display as inline text that is editable on hover */
  editable?: boolean;
}

export const ExpressionWidget: React.FC<ExpresionWidgetProps> = props => {
  const {
    rawErrors,
    formContext,
    schema,
    id,
    label,
    editable,
    value,
    hiddenErrMessage,
    onValidate,
    onChange,
    ...rest
  } = props;
  const { shellApi } = formContext;
  const { description } = schema;
  const [errMessage, setErrMessage] = useState<JSX.Element | ''>('');
  const [errInputStyle, setErrInputStyle] = useState<Partial<ITextFieldStyles>>({});
  const getErrorMessage = async value => {
    const isValid = await shellApi.validateExpression(value);
    if (!value) {
      setErrMessage('');
      setErrInputStyle({});
      return '';
    }

    if (!isValid) {
      setErrMessage(
        <>
          Invalid expression syntax. Refer to the syntax documentation
          <Link
            href="https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/common-expression-language/prebuilt-functions.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </Link>
          .
        </>
      );
      setErrInputStyle({
        fieldGroup: {
          borderColor: `${SharedColors.red20} !important`,
          selectors: {
            '&:after': {
              borderColor: `${SharedColors.red20} !important`,
            },
          },
        },
      });
      return;
    }

    if (rawErrors && rawErrors.length > 0) {
      setErrMessage(<>{rawErrors[0]}</>);
      setErrInputStyle({
        fieldGroup: {
          borderColor: `${SharedColors.red20} !important`,
          selectors: {
            '&:after': {
              borderColor: `${SharedColors.red20} !important`,
            },
          },
        },
      });
      return;
    }
    setErrMessage('');
    setErrInputStyle({});
  };

  const Field = editable ? EditableField : TextField;

  const onValueChange = async (e, value) => {
    onChange(e, value);
    getErrorMessage(value);
  };

  useEffect(() => {
    onValidate && onValidate(errMessage);
  }, [errMessage]);
  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <Field
        {...rest}
        id={id}
        autoComplete="off"
        value={value}
        styles={errInputStyle}
        styleOverrides={errInputStyle}
        onChange={onValueChange}
      />
      {errMessage && !hiddenErrMessage && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          dismissButtonAriaLabel="Close"
          truncated={true}
          overflowButtonAriaLabel="See more"
        >
          {errMessage}
        </MessageBar>
      )}
    </>
  );
};
