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

type JsonFieldProps = FieldProps & { height?: number; key?: string };

const JsonField: React.FC<JsonFieldProps> = (props) => {
  const { onChange, value, id, label, description, uiOptions, required, schema, height = 200, key = '' } = props;
  const { userSettings } = useShellApi();

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <div css={fieldStyle} data-testid="JsonFieldEditor">
        <JsonEditor
          key={key}
          editorSettings={userSettings.codeEditor}
          height={height}
          id={id}
          schema={schema}
          value={value}
          onChange={onChange}
        />
      </div>
    </React.Fragment>
  );
};

export { JsonField };
