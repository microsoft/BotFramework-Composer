// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';

import { DialogWrapper } from '../../components/DialogWrapper/index';

interface IRollbackDialogProps {
  onSubmit: () => void;
  onDismiss: () => void;
  isOpen: boolean;
  version: string;
}

export const RollbackDialog: React.FC<IRollbackDialogProps> = props => {
  const { onSubmit, onDismiss, isOpen, version } = props;

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} title={formatMessage('Rollback to ') + version} subText={''}>
      <form onSubmit={handleSubmit}>
        <input type="submit" style={{ display: 'none' }} />

        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Ok')} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};
