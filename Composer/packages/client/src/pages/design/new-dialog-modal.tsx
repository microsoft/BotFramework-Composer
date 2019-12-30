// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { DialogCreationCopy } from '../../constants';
import { DialogWrapper } from '../../components/DialogWrapper/index';

import { DefineDialog } from './defineDialog';

interface NewDialogModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  onGetErrorMessage: (text: string) => string;
}

const NewDialogModal: React.FC<NewDialogModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, onGetErrorMessage } = props;

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} {...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE}>
      <DefineDialog onSubmit={onSubmit} onDismiss={onDismiss} onGetErrorMessage={onGetErrorMessage} />
    </DialogWrapper>
  );
};

export default NewDialogModal;
