// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension';
import { FieldLabel } from '@bfc/adaptive-form';
import { JsonEditor } from '@bfc/code-editor';

const fieldStyle = css`
  height: 300px;

  label: JsonField;
`;

const JsonField: React.FC<FieldProps> = props => {
  const { onChange, value, id, label, description } = props;

  return (
    <React.Fragment>
      <FieldLabel description={description} id={id} label={label} />
      <div css={fieldStyle}>
        <JsonEditor value={value} onChange={onChange} />
      </div>
    </React.Fragment>
  );
};

export { JsonField };
