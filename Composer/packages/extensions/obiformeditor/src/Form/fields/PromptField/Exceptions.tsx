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
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { MicrosoftInputDialog } from 'shared';

import { WidgetLabel } from '../../widgets/WidgetLabel';
import { LgEditorWidget } from '../../widgets/LgEditorWidget';

import { Validations } from './Validations';
import { field } from './styles';
import { PromptFieldChangeHandler, GetSchema } from './types';

interface ExceptionsProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const Exceptions: React.FC<ExceptionsProps> = props => {
  const { onChange, getSchema, idSchema, formData } = props;

  return (
    <React.Fragment>
      <div css={field}>
        <WidgetLabel
          label={formatMessage('Unrecognized Prompt')}
          description={getSchema('unrecognizedPrompt').description}
        />
        <LgEditorWidget
          name="unrecognizedPrompt"
          onChange={onChange('unrecognizedPrompt')}
          value={formData.unrecognizedPrompt}
          formContext={props.formContext}
          height={125}
        />
      </div>
      <Validations
        onChange={onChange('validations')}
        formData={props.formData.validations || []}
        schema={getSchema('validations')}
        id={idSchema.validations.__id}
        formContext={props.formContext}
      />
      <div css={field}>
        <WidgetLabel label={formatMessage('Invalid Prompt')} description={getSchema('invalidPrompt').description} />
        <LgEditorWidget
          name="invalidPrompt"
          onChange={onChange('invalidPrompt')}
          value={formData.invalidPrompt}
          formContext={props.formContext}
          height={125}
        />
      </div>
      <div css={field}>
        <WidgetLabel
          label={formatMessage('Default value response')}
          description={getSchema('defaultValueResponse').description}
        />
        <LgEditorWidget
          name="defaultValueResponse"
          onChange={onChange('defaultValueResponse')}
          value={formData.defaultValueResponse}
          formContext={props.formContext}
          height={125}
        />
      </div>
    </React.Fragment>
  );
};
