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
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';
import { SDKTypes, MicrosoftInputDialog, ChoiceInput, ConfirmInput } from 'shared';

import { TextWidget, SelectWidget } from '../../widgets';

import { field } from './styles';
import { GetSchema, PromptFieldChangeHandler } from './types';
import { ChoiceInputSettings } from './ChoiceInput';
import { ConfirmInputSettings } from './ConfirmInput';

const getOptions = (enumSchema: JSONSchema6) => {
  if (!enumSchema || !enumSchema.enum || !Array.isArray(enumSchema.enum)) {
    return [];
  }

  return enumSchema.enum.map(o => ({ label: o as string, value: o as string }));
};

interface UserAnswersProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const UserAnswers: React.FC<UserAnswersProps> = props => {
  const { onChange, getSchema, idSchema, formData, errorSchema } = props;

  return (
    <>
      <div css={field}>
        <TextWidget
          onChange={onChange('property')}
          schema={getSchema('property')}
          id={idSchema.property.__id}
          value={formData.property}
          label={formatMessage('Property to fill')}
          formContext={props.formContext}
          rawErrors={errorSchema.property && errorSchema.property.__errors}
        />
      </div>
      {getSchema('outputFormat') && (
        <div css={field}>
          <SelectWidget
            onChange={onChange('outputFormat')}
            schema={getSchema('outputFormat')}
            id={idSchema.outputFormat.__id}
            value={formData.outputFormat}
            label={formatMessage('Output Format')}
            formContext={props.formContext}
            rawErrors={errorSchema.outputFormat && errorSchema.outputFormat.__errors}
            options={{ enumOptions: getOptions(getSchema('outputFormat')) }}
          />
        </div>
      )}
      {getSchema('defaultLocale') && (
        <div css={field}>
          <TextWidget
            onChange={onChange('defaultLocale')}
            schema={getSchema('defaultLocale')}
            id={idSchema.defaultLocale.__id}
            value={((formData as unknown) as ChoiceInput).defaultLocale}
            label={formatMessage('Default locale')}
            formContext={props.formContext}
            rawErrors={errorSchema.defaultLocale && errorSchema.defaultLocale.__errors}
          />
        </div>
      )}
      {getSchema('style') && (
        <div css={field}>
          <SelectWidget
            onChange={onChange('style')}
            schema={getSchema('style')}
            id={idSchema.style.__id}
            value={((formData as unknown) as ChoiceInput).style}
            label={formatMessage('List style')}
            formContext={props.formContext}
            rawErrors={errorSchema.style && errorSchema.style.__errors}
            options={{ enumOptions: getOptions(getSchema('style')) }}
          />
        </div>
      )}
      {formData.$type === SDKTypes.ChoiceInput && (
        <ChoiceInputSettings {...props} formData={(formData as unknown) as ChoiceInput} />
      )}
      {formData.$type === SDKTypes.ConfirmInput && (
        <ConfirmInputSettings {...props} formData={(formData as unknown) as ConfirmInput} />
      )}
    </>
  );
};
