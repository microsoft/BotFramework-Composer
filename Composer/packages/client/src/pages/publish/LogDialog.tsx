// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { Dialog } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

export type LogDialogProps = {
  value: string;
  onDismiss: () => void;
};

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
      <TextField
        multiline
        readOnly
        placeholder={formatMessage('Log output')}
        style={{ minHeight: 300 }}
        value={value}
      />
    </Dialog>
  );
};
