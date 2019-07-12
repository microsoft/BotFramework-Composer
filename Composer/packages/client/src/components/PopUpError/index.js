/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { Dialog, DialogFooter, DefaultButton, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { consoleStyle, dialog } from './styles';

export const PopUpError = props => {
  const [isShow, setIsShow] = useState(true);

  const _closeDialog = () => {
    setIsShow(false);
    props.onDismiss();
  };

  return (
    <Dialog
      hidden={!isShow}
      onDismiss={_closeDialog}
      dialogContentProps={{
        type: DialogType.normal,
        title: props.title,
        styles: dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: 450 } },
      }}
    >
      <div css={consoleStyle}>{formatMessage(props.error)}</div>
      <DialogFooter>
        <DefaultButton onClick={_closeDialog} text="Cancel" />
      </DialogFooter>
    </Dialog>
  );
};
