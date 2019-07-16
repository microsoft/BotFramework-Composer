/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';
import { useState } from 'react';
import { Dialog, DialogFooter, PrimaryButton, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { consoleStyle, dialog } from './styles';

export const ErrorPopup = props => {
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
        <PrimaryButton onClick={_closeDialog} text="Ok" />
      </DialogFooter>
    </Dialog>
  );
};

ErrorPopup.propTypes = {
  error: PropTypes.string,
  title: PropTypes.string,
  onDismiss: PropTypes.func,
};
