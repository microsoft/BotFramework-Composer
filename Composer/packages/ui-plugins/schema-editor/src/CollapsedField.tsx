// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { CollapseField as Collapse, SchemaField } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension';

const style = {
  schemaField: css`
    margin: 0;
  `,
};

export const CollapsedField: React.FC<FieldProps> = ({ label, uiOptions, ...rest }) => {
  return (
    <Collapse label={'Dialog Schema'}>
      <SchemaField css={style.schemaField} {...rest} uiOptions={{ ...uiOptions, field: undefined }} />
    </Collapse>
  );
};
