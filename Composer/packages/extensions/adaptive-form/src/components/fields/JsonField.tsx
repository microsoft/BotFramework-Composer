// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension';
import { JsonEditor } from '@bfc/code-editor';

import { FieldLabel } from '../FieldLabel';

const fieldStyle = css`
  height: 300px;

  label: JsonField;
`;

const JsonField: React.FC<FieldProps> = props => {
  const { onChange, value, id, label, description, uiOptions, required } = props;

  return (
    <React.Fragment>
      <FieldLabel description={description} id={id} label={label} helpLink={uiOptions?.helpLink} required={required} />
      <div css={fieldStyle}>
        <JsonEditor value={value} onChange={onChange} />
      </div>
    </React.Fragment>
  );
};

export { JsonField };
