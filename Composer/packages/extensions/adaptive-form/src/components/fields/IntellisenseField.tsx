// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension';
import { IntellisenseTextField } from '@bfc/intellisense';
import React from 'react';
import { FieldLabel } from '../FieldLabel';

let intellisenseWsUrl = window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws');
intellisenseWsUrl = `${intellisenseWsUrl}/intellisense-language-server`;

export const IntellisenseField: React.FC<FieldProps<string>> = function IntellisenseField(props) {
  const { id, value = '', onChange, label, description, uiOptions, required } = props;

  return (
    <>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />

      <IntellisenseTextField
        value={value}
        onChange={onChange}
        url={intellisenseWsUrl}
        scopes={uiOptions.intellisenseScopes || []}
        id={id}
      />
    </>
  );
};
