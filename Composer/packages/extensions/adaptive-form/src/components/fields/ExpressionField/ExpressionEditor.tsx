// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, useShellApi } from '@bfc/extension';
import { IntellisenseTextField } from '@bfc/intellisense';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import React from 'react';

import { getIntellisenseUrl } from '../../../utils/getIntellisenseUrl';

const ExpressionEditor: React.FC<FieldProps> = (props) => {
  const { id, value = '', onChange, disabled, placeholder, readonly, error } = props;

  const { projectId } = useShellApi();

  return (
    <IntellisenseTextField
      disabled={disabled}
      errorMessage={error}
      id={id}
      placeholder={placeholder}
      projectId={projectId}
      readOnly={readonly}
      scopes={['expressions', 'user-variables']}
      styles={{
        root: { width: '100%' },
        errorMessage: { display: 'none' },
      }}
      url={getIntellisenseUrl()}
      value={value}
      onChange={onChange}
      onRenderPrefix={() => {
        return <Icon iconName="Variable" />;
      }}
    />
  );
};

export { ExpressionEditor };
