// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { instructionStyles, copyPasteStyles, dialog } from './styles';
type ProvisionHandoffProps = {
  title: string;
  developerInstructions: string;
  handoffInstructions: string;
  hidden: boolean;
  onDismiss: () => void;
};

export const ProvisionHandoff = (props: ProvisionHandoffProps) => {
  const closeDialog = () => {
    props.onDismiss();
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: props.title,
      }}
      hidden={props.hidden}
      modalProps={{
        isBlocking: false,
      }}
      styles={dialog}
      onDismiss={closeDialog}
    >
      <div css={instructionStyles}>{props.developerInstructions}</div>
      <div css={copyPasteStyles}>{props.handoffInstructions}</div>
      <DialogFooter>
        <PrimaryButton text={formatMessage('Ok')} onClick={closeDialog} />
      </DialogFooter>
    </Dialog>
  );
};
