// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, useShellApi } from '@bfc/extension-client';
import { IntellisenseTextField } from '@bfc/intellisense';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import React from 'react';

import { getIntellisenseUrl } from '../../utils/getIntellisenseUrl';
import { FieldLabel } from '../FieldLabel';

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
            id={id}
            value={textFieldValue}
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
