// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension';
import { JsonEditor } from '@bfc/code-editor';

import { FieldLabel } from '../FieldLabel';

const fieldStyle = css`
  max-height: 300px;

  label: JsonField;
`;

const JsonField: React.FC<FieldProps> = props => {
  const { onChange, value, id, label, description, uiOptions, required, schema } = props;

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <div css={fieldStyle}>
        <JsonEditor height={200} schema={schema} value={value} onChange={onChange} />
      </div>
    </React.Fragment>
  );
};

export { JsonField };
