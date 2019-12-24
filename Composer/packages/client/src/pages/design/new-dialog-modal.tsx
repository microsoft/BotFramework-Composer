// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { DialogCreationCopy } from '../../constants';
import { DefineConversation } from '../../CreationFlow/DefineConversation/index';
import { DialogWrapper } from '../../components/DialogWrapper/index';

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
      <DefineConversation
        onSubmit={onSubmit}
        onDismiss={onDismiss}
        onGetErrorMessage={onGetErrorMessage}
        enableLocationBrowse={false}
        shouldPresetName={false}
      />
    </DialogWrapper>
  );
};

export default NewDialogModal;
