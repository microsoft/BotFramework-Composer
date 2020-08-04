// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { CollapseField as Collapse, SchemaField } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension';
import formatMessage from 'format-message';

const style = {
  schemaField: css`
    margin: 0;
  `,
};

export const CollapsedField: React.FC<FieldProps> = ({ label, uiOptions, ...rest }) => {
  return (
    <Collapse label={formatMessage('Dialog Interface')}>
      <SchemaField css={style.schemaField} {...rest} uiOptions={{ ...uiOptions, field: undefined }} />
    </Collapse>
  );
};
