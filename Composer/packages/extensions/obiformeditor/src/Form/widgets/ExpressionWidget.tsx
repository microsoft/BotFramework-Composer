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
import formatMessage from 'format-message';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react';
import { JSONSchema6 } from 'json-schema';

import { FormContext } from '../types';
import { EditableField } from '../fields/EditableField';

import { WidgetLabel } from './WidgetLabel';

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

interface ExpresionWidgetProps extends ITextFieldProps {
  formContext: FormContext;
  rawErrors?: string[];
  schema: JSONSchema6;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
  /** Set to true to display as inline text that is editable on hover */
  editable?: boolean;
}

export const ExpressionWidget: React.FC<ExpresionWidgetProps> = props => {
  const { rawErrors, formContext, schema, id, label, editable, ...rest } = props;
  const { shellApi } = formContext;
  const { description } = schema;

  const onGetErrorMessage = async (value: string) => {
    if (!value) {
      return '';
    }

    const isValid = await shellApi.validateExpression(value);

    if (!isValid) {
      return <>{getErrorMessage()}</>;
    }

    if (rawErrors && rawErrors.length > 0) {
      return <>{rawErrors[0]}</>;
    }

    return '';
  };

  const Field = editable ? EditableField : TextField;

  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <Field {...rest} id={id} onGetErrorMessage={onGetErrorMessage} autoComplete="off" />
    </>
  );
};
