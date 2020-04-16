// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dialog, DialogType, IDialogProps } from 'office-ui-fabric-react/lib/Dialog';

import { styles } from './styles';

interface DialogWrapperProps extends Pick<IDialogProps, 'onDismiss'> {
  isOpen: boolean;
  title: string;
  subText: string;
}

export const DialogWrapper: React.FC<DialogWrapperProps> = (props) => {
  const { isOpen, onDismiss, title, subText, children } = props;

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      hidden={false}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: title,
        subText: subText,
        styles: styles.dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
    >
      {children}
    </Dialog>
  );
};
