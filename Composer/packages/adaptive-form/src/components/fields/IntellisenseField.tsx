// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, useShellApi } from '@bfc/extension-client';
import { IntellisenseTextField } from '@bfc/intellisense';
import React from 'react';

import { getIntellisenseUrl } from '../../utils/getIntellisenseUrl';
import { FieldLabel } from '../FieldLabel';

import { TextField } from './TextField/TextField';

export const IntellisenseField: React.FC<FieldProps<string>> = function IntellisenseField(props) {
  const { id, value = '', onChange, label, description, uiOptions, required } = props;

  const { projectId } = useShellApi();

  return (
    <>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />

      <IntellisenseTextField
        id={`intellisense-${id}`}
        projectId={projectId}
        scopes={uiOptions.intellisenseScopes || []}
        url={getIntellisenseUrl()}
        value={value}
        onChange={onChange}
      >
        {(textFieldValue, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField) => (
          <TextField
            autoComplete="off"
            defaultValue={textFieldValue}
            id={id}
            onChange={(_e, newValue) => onValueChanged(newValue || '')}
            onClick={onClickTextField}
            onKeyDown={onKeyDownTextField}
            onKeyUp={onKeyUpTextField}
          />
        )}
      </IntellisenseTextField>
    </>
  );
};
