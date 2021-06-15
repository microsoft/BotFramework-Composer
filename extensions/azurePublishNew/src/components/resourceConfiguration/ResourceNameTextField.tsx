// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ITextFieldProps, TextField } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

type Props = {
  onHostNameChange: (hostName: string) => void;
  accessToken: string;
} & ITextFieldProps;

export const ResourceNameTextField = React.memo((props: Props) => {
  return (
    <TextField
      placeholder={formatMessage('Enter host name')}
      onChange={(_, newValue) => props.onHostNameChange(newValue)}
      {...props}
    />
  );
});
