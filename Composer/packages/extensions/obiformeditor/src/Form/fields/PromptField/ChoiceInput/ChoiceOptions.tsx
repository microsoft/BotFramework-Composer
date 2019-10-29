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
import { IdSchema } from '@bfcomposer/react-jsonschema-form';
import get from 'lodash.get';
import { IChoiceOption, OBISchema } from 'shared';

import { field } from '../styles';
import { TextWidget, CheckboxWidget } from '../../../widgets';
import { FormContext } from '../../../types';

interface ChoiceOptionsProps {
  idSchema: IdSchema;
  schema: OBISchema;
  formData: IChoiceOption;
  onChange: (field: keyof IChoiceOption) => (data: any) => void;
  formContext: FormContext;
}

export const ChoiceOptions: React.FC<ChoiceOptionsProps> = props => {
  const { schema, formData, onChange, idSchema, formContext } = props;

  const optionSchema = (field: keyof IChoiceOption): OBISchema => {
    return get(schema, ['properties', field]);
  };

  return (
    <>
      <div css={field}>
        <TextWidget
          onChange={onChange('inlineSeparator')}
          schema={optionSchema('inlineSeparator')}
          id={idSchema.inlineSeparator && idSchema.inlineSeparator.__id}
          value={formData.inlineSeparator}
          label={formatMessage('Inline separator')}
          formContext={formContext}
        />
      </div>
      <div css={field}>
        <TextWidget
          onChange={onChange('inlineOr')}
          schema={optionSchema('inlineOr')}
          id={idSchema.inlineOr && idSchema.inlineOr.__id}
          value={formData.inlineOr}
          label={formatMessage('Inline or')}
          formContext={formContext}
        />
      </div>
      <div css={field}>
        <TextWidget
          onChange={onChange('inlineOrMore')}
          schema={optionSchema('inlineOrMore')}
          id={idSchema.inlineOrMore && idSchema.inlineOrMore.__id}
          value={formData.inlineOrMore}
          label={formatMessage('Inline or more')}
          formContext={formContext}
        />
      </div>
      <div css={field}>
        <CheckboxWidget
          onChange={onChange('includeNumbers')}
          schema={optionSchema('includeNumbers')}
          id={idSchema.includeNumbers && idSchema.includeNumbers.__id}
          value={formData.includeNumbers}
          label={formatMessage('Include numbers')}
          formContext={formContext}
        />
      </div>
    </>
  );
};
