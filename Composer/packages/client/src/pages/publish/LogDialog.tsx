// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dialog } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

export interface LogDialogProps {
  value?: string;
  onDismiss: () => void;
}

export const LogDialog: React.FC<LogDialogProps> = ({ value = '', onDismiss }) => {
  const logDialogProps = {
    title: 'Publish Log',
  };
  return (
    <Dialog
      dialogContentProps={logDialogProps}
      hidden={false}
      minWidth={700}
      modalProps={{ isBlocking: true }}
      onDismiss={onDismiss}
    >
      <TextField multiline placeholder="Log Output" style={{ minHeight: 300 }} value={value} />
    </Dialog>
  );
};
