// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { Fragment } from 'react';
import formatMessage from 'format-message';
import { ChoiceInput, ConfirmInput } from '@bfc/shared';
import { SchemaField } from '@bfc/adaptive-form';

import { PromptFieldProps } from './types';

const styles = {
  choiceOptions: css`
    margin-left: 0;
    margin-right: 0;

    label: ChoiceOptions;
  `,
};

interface ChoiceInputSettingsProps extends PromptFieldProps<ChoiceInput | ConfirmInput> {
  choiceProperty: 'choices' | 'confirmChoices';
}

const ChoiceInputSettings: React.FC<ChoiceInputSettingsProps> = (props) => {
  const { choiceProperty, getSchema, value, id, onChange, uiOptions, getError, definitions, depth } = props;

  return (
    <Fragment>
      <SchemaField
        definitions={definitions}
        depth={depth}
        id={`${id}.${choiceProperty}`}
        name={choiceProperty}
        onBlur={() => {}}
        onChange={onChange(choiceProperty)}
        onFocus={() => {}}
        rawErrors={getError(choiceProperty)}
        schema={getSchema(choiceProperty)}
        uiOptions={uiOptions.properties?.[choiceProperty] || {}}
        value={value?.[choiceProperty]}
      />
      <SchemaField
        css={styles.choiceOptions}
        definitions={definitions}
        depth={depth + 1}
        id={`${id}.choiceOptions`}
        name="choiceOptions"
        onBlur={() => {}}
        onChange={onChange('choiceOptions')}
        onFocus={() => {}}
        rawErrors={getError('choiceOptions')}
        schema={getSchema('choiceOptions')}
        uiOptions={uiOptions.properties?.choiceOptions || {}}
        value={value?.choiceOptions || {}}
      />
      {getSchema('appendChoices') && (
        <SchemaField
          definitions={definitions}
          depth={depth}
          id={`${id}.appendChoices`}
          label={formatMessage('Append choices')}
          name="appendChoices"
          onChange={onChange('appendChoices')}
          rawErrors={getError('appendChoices')}
          schema={getSchema('appendChoices')}
          uiOptions={uiOptions.properties?.appendChoices || {}}
          value={((value as unknown) as ChoiceInput)?.appendChoices}
        />
      )}
    </Fragment>
  );
};

export { ChoiceInputSettings };
