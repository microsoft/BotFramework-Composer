// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { JSONSchema6 } from 'json-schema';
import formatMessage from 'format-message';

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

const getDefaultErrorMessage = () => {
  return formatMessage.rich('Invalid expression syntax. Refer to the syntax documentation<a>here</a>', {
    a: ({ children }) => (
      <a
        key="a"
        href="https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/common-expression-language/prebuilt-functions.md"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  });
};

export const ExpressionWidget: React.FC<ExpresionWidgetProps> = props => {
  const { rawErrors, formContext, schema, id, label, editable, hiddenErrMessage, onValidate, options = {}, ...rest } = props;
  const { shellApi } = formContext;
  const { description } = schema;
  const { hideLabel } = options;

  const onGetErrorMessage = async (value: string): Promise<JSX.Element | string> => {
    if (!value) {
      if (hiddenErrMessage) {
        onValidate && onValidate();
      }
      return '';
    }

    const isValid = await shellApi.validateExpression(value);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let errMessage: string | any[] = '';
    if (!isValid) {
      errMessage = getDefaultErrorMessage();
    } else if (rawErrors && rawErrors.length > 0) {
      errMessage = rawErrors[0];
    }

    const messageBar = errMessage ? (
      <MessageBar
        messageBarType={MessageBarType.error}
        isMultiline={false}
        dismissButtonAriaLabel={formatMessage('Close')}
        truncated
        overflowButtonAriaLabel={formatMessage('See more')}
      >
        {errMessage}
      </MessageBar>
    ) : (
      ''
    );

    if (hiddenErrMessage) {
      onValidate && onValidate(messageBar);
      // return span so text field shows error border
      return errMessage ? <span /> : '';
    } else {
      return errMessage ? messageBar : '';
    }
  };

  const Field = editable ? EditableField : TextField;

  return (
    <>
      {!hideLabel && !!label && <WidgetLabel label={label} description={description} id={id} />}
      <Field
        {...rest}
        id={id}
        onGetErrorMessage={onGetErrorMessage}
        autoComplete="off"
        styles={{
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
