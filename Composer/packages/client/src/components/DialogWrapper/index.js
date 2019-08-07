/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogType } from 'office-ui-fabric-react';

import { styles } from './styles';

export function DialogWrapper(props) {
  const { isOpen, onDismiss, title, subText, children } = props;
  return (
    <Dialog
      hidden={!isOpen}
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
