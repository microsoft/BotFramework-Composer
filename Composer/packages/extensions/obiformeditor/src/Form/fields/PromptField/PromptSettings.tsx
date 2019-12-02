// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib';
import { MicrosoftInputDialog } from '@bfc/shared';
import { useState } from 'react';

import { TextWidget, CheckboxWidget } from '../../widgets';

import {
  field,
  settingsFields,
  settingsFieldHalf,
  settingsFieldFull,
  settingsFieldInline,
  settingsFieldValidation,
} from './styles';
import { PromptFieldChangeHandler, GetSchema } from './types';

interface PromptSettingsrops extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const PromptSettings: React.FC<PromptSettingsrops> = props => {
  const { formData, idSchema, getSchema, onChange, errorSchema } = props;
  const [errorMessage, setErrorMessage] = useState(false);

  const onValidate = errMessage => {
    setErrorMessage(errMessage);
  };
  return (
    <div>
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
            hiddenErrMessage={true}
            onValidate={onValidate}
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
            hiddenErrMessage={true}
            onValidate={onValidate}
          />
        </div>
        <div css={[field, settingsFieldFull, settingsFieldValidation]}>
          {errorMessage && (
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline={false}
              dismissButtonAriaLabel="Close"
              truncated={true}
              overflowButtonAriaLabel="See more"
            >
              {errorMessage}
            </MessageBar>
          )}
        </div>
      </div>
      <div css={settingsFields}>
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
    </div>
  );
};
