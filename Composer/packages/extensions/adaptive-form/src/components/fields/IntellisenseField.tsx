// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension';
import { IntellisenseTextField } from '@bfc/intellisense';
import React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { FieldLabel } from '../FieldLabel';
import { getIntellisenseUrl } from '../../utils/getIntellisenseUrl';

export const IntellisenseField: React.FC<FieldProps<string>> = function IntellisenseField(props) {
  const { id, value = '', onChange, label, description, uiOptions, required } = props;

  return (
    <>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />

      <IntellisenseTextField
        id={`intellisense-${id}`}
        scopes={uiOptions.intellisenseScopes || []}
        url={getIntellisenseUrl()}
        value={value}
        onChange={onChange}
      >
        {(textFieldValue, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField) => (
          <TextField
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
