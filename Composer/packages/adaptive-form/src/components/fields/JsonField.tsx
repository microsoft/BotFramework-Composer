// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import { JsonEditor } from '@bfc/code-editor';

import { FieldLabel } from '../FieldLabel';

const fieldStyle = css`
  max-height: 300px;

  label: JsonField;
`;

type JsonFieldProps = FieldProps;

const JsonField: React.FC<JsonFieldProps> = (props) => {
  const { onChange, value, id, label, description, uiOptions, required, schema, onBlur, onFocus, style } = props;
  const { userSettings } = useShellApi();

  const height = style?.height || 200;

  const defaultValue = schema.type === 'object' ? {} : [];

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <div css={fieldStyle} data-testid="JsonFieldEditor">
        <JsonEditor
          key={id}
          editorSettings={userSettings.codeEditor}
          height={height}
          id={id}
          schema={schema}
          value={value || defaultValue}
          onBlur={onBlur}
          onChange={onChange}
          onFocus={onFocus}
        />
      </div>
    </React.Fragment>
  );
};

export { JsonField };
