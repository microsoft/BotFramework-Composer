// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { DialogWrapper } from '../../components/DialogWrapper/index';

interface IPublishDialogProps {
  onSubmit: (version: string) => void;
  onDismiss: () => void;
  isOpen: boolean;
  name: string;
}

export const PublishDialog: React.FC<IPublishDialogProps> = props => {
  const { onSubmit, onDismiss, isOpen, name } = props;
  const [version, setVersion] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await onSubmit(version);
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} title={formatMessage('Publish to ') + name} subText={''}>
      <form onSubmit={handleSubmit}>
        <input type="submit" style={{ display: 'none' }} />
        <TextField
          label={formatMessage('Version')}
          value={version}
          onChange={(e, v) => setVersion(v)}
          errorMessage={errorMessage}
        />

        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Publish')} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};
