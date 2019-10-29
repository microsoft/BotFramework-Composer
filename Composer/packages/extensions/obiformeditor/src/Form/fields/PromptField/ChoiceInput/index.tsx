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
import { FieldProps, IdSchema } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { ChoiceInput, IChoiceOption } from 'shared';

import { PromptFieldChangeHandler, GetSchema } from '../types';
import { CheckboxWidget } from '../../../widgets';
import { field } from '../styles';

import { Choices } from './Choices';
import { ChoiceOptions } from './ChoiceOptions';

interface ChoiceInputSettingsProps extends FieldProps<ChoiceInput> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const ChoiceInputSettings: React.FC<ChoiceInputSettingsProps> = props => {
  const { getSchema, formData, idSchema, onChange, formContext } = props;

  const updateChoiceOptions = (field: keyof IChoiceOption) => (data: any) => {
    const updater = onChange('choiceOptions');
    updater({ ...formData.choiceOptions, [field]: data });
  };

  return (
    <>
      <Choices
        formData={formData.choices}
        schema={getSchema('choices')}
        onChange={onChange('choices')}
        id={idSchema.choices && idSchema.choices.__id}
        label={formatMessage('Choice Options')}
      />
      <ChoiceOptions
        schema={getSchema('choiceOptions')}
        idSchema={idSchema.choiceOptions as IdSchema}
        onChange={updateChoiceOptions}
        formData={formData.choiceOptions || {}}
        formContext={formContext}
      />
      <div css={field}>
        <CheckboxWidget
          onChange={onChange('appendChoices')}
          schema={getSchema('appendChoices')}
          id={idSchema.appendChoices && idSchema.appendChoices.__id}
          value={formData.appendChoices}
          label={formatMessage('Append choices')}
          formContext={formContext}
        />
      </div>
    </>
  );
};
