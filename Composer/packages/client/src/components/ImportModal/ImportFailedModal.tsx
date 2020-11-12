// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import React from 'react';
import formatMessage from 'format-message';
import { generateUniqueId } from '@bfc/shared';

import { boldText, boldBlueText, dialogContent } from './style';

type ImportFailedModalProps = {
  botName: string;
  error?: Error | string;
  onDismiss: () => any;
};

const BoldBlue = ({ children }) => (
  <span key={generateUniqueId()} css={boldBlueText}>
    {children}
  </span>
);

export const ImportFailedModal: React.FC<ImportFailedModalProps> = (props) => {
  const { botName, error, onDismiss } = props;

  return (
    <Dialog
      dialogContentProps={{
        title: formatMessage('Something went wrong'),
        type: DialogType.close,
      }}
      hidden={false}
      minWidth={560}
      onDismiss={onDismiss}
    >
      <p css={dialogContent}>
        {formatMessage.rich('There was an unexpected error importing bot content to <b>{ botName }</b>', {
          b: BoldBlue,
          botName,
        })}
      </p>
      <p css={boldText}>{typeof error === 'object' ? error.message : error}</p>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
