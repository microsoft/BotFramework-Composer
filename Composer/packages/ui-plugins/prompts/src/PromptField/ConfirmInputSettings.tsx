// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ConfirmInput, IChoiceOption } from '@bfc/shared';

import { PromptFieldProps } from './types';
import { Choices } from './ChoiceInputSettings/Choices';
import { ChoiceOptions } from './ChoiceInputSettings/ChoiceOptions';

const ConfirmInputSettings: React.FC<PromptFieldProps<ConfirmInput>> = props => {
  const { getSchema, value, onChange, id, uiOptions, getError, ...rest } = props;

  const updateChoiceOptions = (field: keyof IChoiceOption) => (data: any) => {
    const updater = onChange('choiceOptions');
    updater({ ...value?.choiceOptions, [field]: data });
  };

  return (
    <>
      <Choices
        {...rest}
        id={`${id}.confirmChoices`}
        schema={getSchema('confirmChoices')}
        uiOptions={uiOptions.properties?.confirmChoices || {}}
        value={value?.confirmChoices}
        onBlur={() => {}}
        onChange={onChange('confirmChoices')}
        onFocus={() => {}}
        rawErrors={getError('confirmChoices')}
      />
      <ChoiceOptions
        {...rest}
        id={`${id}.choiceOptions`}
        schema={getSchema('choiceOptions')}
        uiOptions={uiOptions.properties?.choiceOptions || {}}
        value={value?.choiceOptions || {}}
        onBlur={() => {}}
        onChange={updateChoiceOptions}
        onFocus={() => {}}
        rawErrors={getError('choiceOptions')}
      />
    </>
  );
};

export { ConfirmInputSettings };
