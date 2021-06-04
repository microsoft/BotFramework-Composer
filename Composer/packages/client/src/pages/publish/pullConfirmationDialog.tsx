// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { Dialog, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import React from 'react';

import { colors } from '../../colors';

type PullConfirmationDialogProps = {
  onConfirm: () => void;
  onDismiss: () => void;
};

export const PullConfirmationDialog: React.FC<PullConfirmationDialogProps> = (props) => {
  const { onConfirm, onDismiss } = props;

  return (
    <Dialog
      dialogContentProps={{
        title: formatMessage('Pull from selected profile'),
        styles: {
          content: {
            fontSize: 16,
          },
        },
      }}
      hidden={false}
      minWidth={480}
    >
      <p>
        {formatMessage(
          'You are about to pull project files from the selected publish profiles. The current project will be overwritten by the pulled files, and will be saved as a backup automatically. You will be able to retrieve the backup anytime in the future.'
        )}
      </p>
      <p>{formatMessage('Do you want to proceed?')}</p>
      <DialogFooter>
        <DefaultButton
          data-testid="pull-cancel-button"
          text={formatMessage('Cancel')}
          theme={colors.fluentTheme}
          onClick={onDismiss}
        />
        <PrimaryButton
          data-testid="pull-confirm-button"
          text={formatMessage('Pull')}
          theme={colors.fluentTheme}
          onClick={onConfirm}
        />
      </DialogFooter>
    </Dialog>
  );
};
