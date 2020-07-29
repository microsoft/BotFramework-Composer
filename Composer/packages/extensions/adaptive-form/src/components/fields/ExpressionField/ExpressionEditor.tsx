// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, useShellApi } from '@bfc/extension';
import { IntellisenseTextField } from '@bfc/intellisense';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import React from 'react';

let intellisenseWsUrl = window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws');
intellisenseWsUrl = `${intellisenseWsUrl}/intellisense-language-server`;

const ExpressionEditor: React.FC<FieldProps> = (props) => {
  const { id, value = '', onChange, disabled, placeholder, readonly, error } = props;

  const { projectId } = useShellApi();

  return (
    <IntellisenseTextField
      url={intellisenseWsUrl}
      scopes={['expressions', 'user-variables']}
      projectId={projectId}
      disabled={disabled}
      errorMessage={error}
      id={id}
      placeholder={placeholder}
      readOnly={readonly}
      styles={{
        root: { width: '100%' },
        errorMessage: { display: 'none' },
      }}
      value={value}
      onChange={onChange}
      onRenderPrefix={() => {
        return <Icon iconName="Variable" />;
      }}
    />
  );
};

export { ExpressionEditor };
