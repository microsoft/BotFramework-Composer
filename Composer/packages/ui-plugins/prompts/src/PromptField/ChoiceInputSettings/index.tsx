// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { Fragment } from 'react';
import formatMessage from 'format-message';
import { ChoiceInput } from '@bfc/shared';
import { SchemaField } from '@bfc/adaptive-form';

import { PromptFieldProps } from '../types';

import { Choices } from './Choices';

const styles = {
  choiceOptions: css`
    margin-left: 0;
    margin-right: 0;

    label: ChoiceOptions;
  `,
};

export const ChoiceInputSettings: React.FC<PromptFieldProps<ChoiceInput>> = props => {
  const { getSchema, value, id, onChange, uiOptions, getError, definitions, depth } = props;

  return (
    <Fragment>
      <Choices
        id={`${id}.choices`}
        name="choices"
        definitions={definitions}
        depth={depth}
        label={formatMessage('Choice Options')}
        schema={getSchema('choices')}
        uiOptions={uiOptions.properties?.choices || {}}
        value={value?.choices}
        onBlur={() => {}}
        onChange={onChange('choices')}
        onFocus={() => {}}
        rawErrors={getError('choices')}
      />
      <SchemaField
        css={styles.choiceOptions}
        definitions={definitions}
        depth={0}
        id={`${id}.choiceOptions`}
        name="choiceOptions"
        schema={getSchema('choiceOptions')}
        uiOptions={uiOptions.properties?.choiceOptions || {}}
        value={value?.choiceOptions || {}}
        onBlur={() => {}}
        onChange={onChange('choiceOptions')}
        onFocus={() => {}}
        rawErrors={getError('choiceOptions')}
      />
      <SchemaField
        id={`${id}.appendChoices`}
        name="appendChoices"
        definitions={definitions}
        depth={depth}
        label={formatMessage('Append choices')}
        schema={getSchema('appendChoices')}
        uiOptions={uiOptions.properties?.appendChoices || {}}
        value={value?.appendChoices}
        onChange={onChange('appendChoices')}
        rawErrors={getError('appendChoices')}
      />
    </Fragment>
  );
};
