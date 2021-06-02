// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { ITextFieldProps, TextField } from 'office-ui-fabric-react';

type Props = {
  onResourceNameChange: React.Dispatch<React.SetStateAction<string>>;
  accessToken: string;
} & ITextFieldProps;

export const ResourceNameTextField = React.memo((props: Props) => {
  return (
    <TextField
      required
      label="Subscriptions"
      placeholder="Select subscription"
      onChange={(event, newValue) => props.onResourceNameChange(newValue)}
      {...props}
    />
  );
});

//TODO: Handle Client/server side validation
