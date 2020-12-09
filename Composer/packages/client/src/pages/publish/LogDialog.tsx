// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dialog } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

export const LogDialog = (props) => {
  const logDialogProps = {
    title: 'Publish Log',
  };
  return (
    <Dialog
      dialogContentProps={logDialogProps}
      hidden={false}
      minWidth={700}
      modalProps={{ isBlocking: true }}
      onDismiss={props.onDismiss}
    >
      <TextField
        multiline
        placeholder="Log Output"
        style={{ minHeight: 300 }}
        value={props && props.version ? props.version.log : ''}
      />
    </Dialog>
  );
};
