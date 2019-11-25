// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';

import { styles } from './styles';

export function DialogWrapper(props) {
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
}
