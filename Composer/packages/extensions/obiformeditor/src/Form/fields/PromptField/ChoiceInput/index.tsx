// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';
import { FieldProps, IdSchema } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { ChoiceInput, IChoiceOption } from '@bfc/shared';

import { PromptFieldChangeHandler, GetSchema } from '../types';
import { CheckboxWidget } from '../../../widgets';
import { field } from '../styles';
import { FormContext } from '../../../types';

import { Choices } from './Choices';
import { ChoiceOptions } from './ChoiceOptions';

interface ChoiceInputSettingsProps extends FieldProps<ChoiceInput> {
  formContext: FormContext;
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
    <Fragment>
      <Choices
        formContext={formContext}
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
    </Fragment>
  );
};
