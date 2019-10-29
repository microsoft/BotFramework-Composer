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
import formatMessage from 'format-message';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { MicrosoftInputDialog } from 'shared';

import { TextWidget, CheckboxWidget } from '../../widgets';

import { field, settingsFields, settingsFieldHalf, settingsFieldFull, settingsFieldInline } from './styles';
import { PromptFieldChangeHandler, GetSchema } from './types';

interface PromptSettingsrops extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const PromptSettings: React.FC<PromptSettingsrops> = props => {
  const { formData, idSchema, getSchema, onChange, errorSchema } = props;

  return (
    <div css={settingsFields}>
      <div css={[field, settingsFieldHalf]}>
        <TextWidget
          onChange={onChange('maxTurnCount')}
          schema={getSchema('maxTurnCount')}
          id={idSchema.maxTurnCount.__id}
          value={formData.maxTurnCount}
          label={formatMessage('Max turn count')}
          formContext={props.formContext}
          rawErrors={errorSchema.maxTurnCount && errorSchema.maxTurnCount.__errors}
        />
      </div>
      <div css={[field, settingsFieldHalf]}>
        <TextWidget
          onChange={onChange('defaultValue')}
          schema={getSchema('defaultValue')}
          id={idSchema.defaultValue.__id}
          value={formData.defaultValue}
          label={formatMessage('Default value')}
          formContext={props.formContext}
          rawErrors={errorSchema.defaultValue && errorSchema.defaultValue.__errors}
        />
      </div>
      <div css={[field, settingsFieldFull]}>
        <TextWidget
          onChange={onChange('allowInterruptions')}
          schema={getSchema('allowInterruptions')}
          id={idSchema.allowInterruptions.__id}
          value={formData.allowInterruptions}
          label={formatMessage('Allow interruptions')}
          formContext={props.formContext}
          rawErrors={errorSchema.allowInterruptions && errorSchema.allowInterruptions.__errors}
        />
      </div>
      <div css={[field, settingsFieldFull, settingsFieldInline]}>
        <CheckboxWidget
          onChange={onChange('alwaysPrompt')}
          schema={getSchema('alwaysPrompt')}
          id={idSchema.alwaysPrompt.__id}
          value={formData.alwaysPrompt}
          label={formatMessage('Always prompt')}
          formContext={props.formContext}
          rawErrors={errorSchema.alwaysPrompt && errorSchema.alwaysPrompt.__errors}
        />
      </div>
    </div>
  );
};
