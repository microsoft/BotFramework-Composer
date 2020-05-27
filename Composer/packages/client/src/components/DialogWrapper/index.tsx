// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import { Dialog, DialogType, IDialogProps } from 'office-ui-fabric-react/lib/Dialog';

import { styles, DialogTypes } from './styles';

interface DialogWrapperProps extends Pick<IDialogProps, 'onDismiss'> {
  isOpen: boolean;
  title: string;
  subText: string;
  dialogType: DialogTypes;
}

export const DialogWrapper: React.FC<DialogWrapperProps> = (props) => {
  const { isOpen, onDismiss, title, subText, children, dialogType } = props;
  const [currentStyle, setStyle] = useState(styles[dialogType]);

  useEffect(() => {
    if (dialogType) {
      setStyle(styles[dialogType]);
    }
  }, [dialogType]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: title,
        subText: subText,
        styles: currentStyle.dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: false,
        styles: currentStyle.modal,
      }}
      onDismiss={onDismiss}
    >
      {children}
    </Dialog>
  );
};
