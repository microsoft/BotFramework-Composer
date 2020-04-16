// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { PropTypes } from 'prop-types';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import { consoleStyle, dialog } from './styles';

export const ErrorPopup = (props) => {
  const [hidden, setHidden] = useState(props.error ? false : true);

  const _closeDialog = () => {
    setHidden(true);
    props.onDismiss();
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: props.title,
        styles: dialog,
      }}
      hidden={hidden}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: 450 } },
      }}
      onDismiss={_closeDialog}
    >
      <div css={consoleStyle}>{props.error}</div>
      <DialogFooter>
        <PrimaryButton onClick={_closeDialog} text="Ok" />
      </DialogFooter>
    </Dialog>
  );
};

ErrorPopup.propTypes = {
  error: PropTypes.node,
  title: PropTypes.string,
  onDismiss: PropTypes.func,
};
