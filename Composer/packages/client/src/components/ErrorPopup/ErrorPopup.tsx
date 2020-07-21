// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import { consoleStyle, dialog } from './styles';

type ErrorPopupProps = {
  title: string;
  error: Node;
  onDismiss: () => void;
};

export const ErrorPopup = (props: ErrorPopupProps) => {
  const [hidden, setHidden] = useState(props.error ? false : true);

  const closeDialog = () => {
    setHidden(true);
    props.onDismiss();
  };

  useEffect(() => {
    if (props.error) {
      setHidden(false);
    } else {
      setHidden(true);
    }
  }, [props.error]);

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
      onDismiss={closeDialog}
    >
      <div css={consoleStyle}>{props.error}</div>
      <DialogFooter>
        <PrimaryButton text="Ok" onClick={closeDialog} />
      </DialogFooter>
    </Dialog>
  );
};
