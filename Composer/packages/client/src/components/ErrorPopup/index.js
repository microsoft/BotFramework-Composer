import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import { Dialog, DialogFooter, PrimaryButton, DialogType } from 'office-ui-fabric-react';

import { consoleStyle, dialog } from './styles';

export const ErrorPopup = props => {
  const [hidden, setHidden] = useState(props.error ? false : true);

  const _closeDialog = () => {
    setHidden(true);
    props.onDismiss();
  };

  return (
    <Dialog
      hidden={hidden}
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
      <div css={consoleStyle}>{props.error}</div>
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
