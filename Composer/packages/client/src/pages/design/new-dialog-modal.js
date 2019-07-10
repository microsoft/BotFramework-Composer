import React from 'react';

import { DialogInfo } from '../../constants';
import { DefineConversation } from '../../CreationFlow/DefineConversation/index';
import { DialogWrapper } from '../../components/DialogWrapper/index';

export default function NewDialogModal(props) {
  const { isOpen, onDismiss, onSubmit, onGetErrorMessage } = props;

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} {...DialogInfo.DEFINE_CONVERSATION_OBJECTIVE}>
      <DefineConversation onSubmit={onSubmit} onDismiss={onDismiss} onGetErrorMessage={onGetErrorMessage} />
    </DialogWrapper>
  );
}
