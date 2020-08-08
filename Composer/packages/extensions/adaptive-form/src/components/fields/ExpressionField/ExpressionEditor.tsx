// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, useShellApi } from '@bfc/extension';
import { IntellisenseTextField } from '@bfc/intellisense';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { getIntellisenseUrl } from '../../../utils/getIntellisenseUrl';

const ExpressionEditor: React.FC<FieldProps> = (props) => {
  const { id, value = '', onChange, disabled, placeholder, readonly, error } = props;

  const { projectId } = useShellApi();

  return (
    <IntellisenseTextField
      id={`intellisense-${id}`}
      projectId={projectId}
      scopes={['expressions', 'user-variables']}
      url={getIntellisenseUrl()}
      value={value}
      onChange={onChange}
    >
      {(textFieldValue, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField) => (
        <TextField
          disabled={disabled}
          errorMessage={error}
          id={id}
          placeholder={placeholder}
          readOnly={readonly}
          styles={{
            root: { width: '100%' },
            errorMessage: { display: 'none' },
          }}
          value={textFieldValue}
          onChange={(_e, newValue) => onValueChanged(newValue || '')}
          onClick={onClickTextField}
          onKeyDown={onKeyDownTextField}
          onKeyUp={onKeyUpTextField}
          onRenderPrefix={() => {
            return <Icon iconName="Variable" />;
          }}
        />
      )}
    </IntellisenseTextField>
  );
};

export { ExpressionEditor };
