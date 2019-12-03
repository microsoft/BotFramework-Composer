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
  formContext: FormContext;
  rawErrors?: string[];
  schema: JSONSchema6;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
  /** Set to true to display as inline text that is editable on hover */
  editable?: boolean;
}

const getErrorMessage = () =>
  formatMessage.rich('Invalid expression syntax. Refer to the syntax documentation <a>here</a>', {
    // eslint-disable-next-line react/display-name
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

export const ExpressionWidget: React.FC<ExpresionWidgetProps> = props => {
  const { rawErrors, formContext, schema, id, label, editable, ...rest } = props;
  const { shellApi } = formContext;
  const { description } = schema;
  const onGetErrorMessage = (value: string): Promise<string | JSX.Element> => {
    return new Promise(async resolve => {
      const isValid = await shellApi.validateExpression(value);
      if (!value) {
        resolve('');
      }
      let errMessage: JSX.Element | '' = '';

      if (!isValid) {
        errMessage = <>{getErrorMessage()}</>;
      }

      if (rawErrors && rawErrors.length > 0) {
        errMessage = <>{rawErrors[0]}</>;
      }
      resolve(
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          dismissButtonAriaLabel="Close"
          truncated={true}
          overflowButtonAriaLabel="See more"
        >
          {errMessage}
        </MessageBar>
      );
    });
  };

  const Field = editable ? EditableField : TextField;

  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <Field {...rest} id={id} onGetErrorMessage={onGetErrorMessage} autoComplete="off" />
    </>
  );
};
