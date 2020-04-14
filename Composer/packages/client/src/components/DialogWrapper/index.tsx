// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import { Dialog, DialogType, IDialogProps, IDialogContentStyles } from 'office-ui-fabric-react/lib/Dialog';
import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';

import { styles } from './styles';

interface DialogWrapperProps extends Pick<IDialogProps, 'onDismiss'> {
  isOpen: boolean;
  title: string;
  subText: string;
  overrideStyles?: { modal: Partial<IModalStyles>; dialog: Partial<IDialogContentStyles> };
}

export const DialogWrapper: React.FC<DialogWrapperProps> = props => {
  const { isOpen, onDismiss, title, subText, children, overrideStyles } = props;
  const [wrapperStyle, updateWrapperStyle] = useState({
    modal: styles.modal,
    dialog: styles.dialog,
  });

  useEffect(() => {
    if (overrideStyles) {
      updateWrapperStyle({
        modal: overrideStyles.modal,
        dialog: overrideStyles.dialog,
      });
    }
  }, [overrideStyles]);

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
        styles: wrapperStyle.dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: wrapperStyle.modal,
      }}
    >
      {children}
    </Dialog>
  );
};
