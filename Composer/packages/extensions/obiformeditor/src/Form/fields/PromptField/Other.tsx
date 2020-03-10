// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { MicrosoftInputDialog } from '@bfc/shared';

import { WidgetLabel } from '../../widgets/WidgetLabel';
import { LgEditorWidget } from '../../widgets/LgEditorWidget';

import { Validations } from './Validations';
import { field } from './styles';
import { PromptFieldChangeHandler, GetSchema } from './types';

interface OtherProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const Other: React.FC<OtherProps> = props => {
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
