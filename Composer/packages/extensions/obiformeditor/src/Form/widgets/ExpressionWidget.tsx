/* eslint-disable format-message/literal-pattern */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { TextField, ITextFieldProps, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { JSONSchema6 } from 'json-schema';
import formatMessage from 'format-message';
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

const getErrorMessage = () =>
  formatMessage.rich(
    '<MessageBar>Invalid expression syntax. Refer to the syntax documentation <a>here</a></MessageBar>',
    {
      // eslint-disable-next-line react/display-name
      MessageBar: ({ children }) => (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          dismissButtonAriaLabel="Close"
          truncated={true}
          overflowButtonAriaLabel="See more"
        >
          {children}
        </MessageBar>
      ),
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
    }
  );

export const ExpressionWidget: React.FC<ExpresionWidgetProps> = props => {
  const { rawErrors, formContext, schema, id, label, editable, hiddenErrMessage, onValidate, ...rest } = props;
  const { shellApi } = formContext;
  const { description } = schema;
  const [styleOverrides, setStyleOverrides] = useState<Partial<ITextFieldStyles>>({
    errorMessage: {
      display: 'block',
      paddingTop: '0px',
    },
  });
  const onGetErrorMessage = (value: string): Promise<string | JSX.Element> | string => {
    if (!value) {
      if (hiddenErrMessage) {
        setStyleOverrides({
          errorMessage: {
            display: 'block',
            paddingTop: '0px',
          },
        });
        onValidate && onValidate('');
      }
      return '';
    }
    return shellApi.validateExpression(value).then(isValid => {
      let errMessage: JSX.Element | '' = '';
      if (!isValid) {
        errMessage = <>{getErrorMessage()}</>;
      }

      if (rawErrors && rawErrors.length > 0) {
        errMessage = (
          <>
            {formatMessage.rich(`<MessageBar>${rawErrors[0]}<MessageBar>`, {
              // eslint-disable-next-line react/display-name
              MessageBar: ({ children }) => (
                <MessageBar
                  messageBarType={MessageBarType.error}
                  isMultiline={false}
                  dismissButtonAriaLabel="Close"
                  truncated={true}
                  overflowButtonAriaLabel="See more"
                >
                  {children}
                </MessageBar>
              ),
            })}
          </>
        );
      }
      if (hiddenErrMessage) {
        onValidate && onValidate(errMessage);
        if (errMessage) {
          setStyleOverrides({
            errorMessage: {
              display: 'block',
              paddingTop: '0px',
            },
            fieldGroup: {
              borderColor: `${SharedColors.red20}`,
              selectors: {
                '&:after': {
                  borderColor: `${SharedColors.red20}`,
                },
              },
            },
          });
        } else {
          setStyleOverrides({
            errorMessage: {
              display: 'block',
              paddingTop: '0px',
            },
          });
        }
        return '';
      } else {
        return errMessage;
      }
    });
  };
  const Field = editable ? EditableField : TextField;

  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <Field
        {...rest}
        id={id}
        onGetErrorMessage={onGetErrorMessage}
        autoComplete="off"
        styleOverrides={styleOverrides}
        styles={styleOverrides}
      />
    </>
  );
};
