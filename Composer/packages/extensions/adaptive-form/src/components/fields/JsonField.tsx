// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { JsonEditor } from '@bfc/code-editor';

import { FieldLabel } from '../FieldLabel';

const fieldStyle = css`
  max-height: 300px;

  label: JsonField;
`;

const JsonField: React.FC<FieldProps> = (props) => {
  const { onChange, value, id, label, description, uiOptions, required, schema } = props;
  const { userSettings } = useShellApi();

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <div css={fieldStyle} data-testid="JsonFieldEditor">
        <JsonEditor
          editorSettings={userSettings.codeEditor}
          height={200}
          schema={schema}
          value={value}
          onChange={onChange}
        />
      </div>
    </React.Fragment>
  );
};

export { JsonField };
