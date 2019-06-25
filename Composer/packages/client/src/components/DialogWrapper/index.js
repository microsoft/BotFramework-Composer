/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogType } from 'office-ui-fabric-react';

import { styles } from './styles';

export function DialogWrapper(props) {
  const { hidden, onDismiss, title, subText, children } = props;

  return (
    <Dialog
      hidden={hidden}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title,
        subText,
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
