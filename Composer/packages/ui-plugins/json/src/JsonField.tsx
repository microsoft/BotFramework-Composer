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

const JsonField: React.FC<FieldProps> = (props) => {
  const { onChange, value, id, label, description, uiOptions } = props;

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} />
      <div css={fieldStyle}>
        <JsonEditor onChange={onChange} value={value} />
      </div>
    </React.Fragment>
  );
};

export { JsonField };
