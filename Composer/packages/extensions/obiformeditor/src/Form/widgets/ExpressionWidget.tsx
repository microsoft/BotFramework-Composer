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
