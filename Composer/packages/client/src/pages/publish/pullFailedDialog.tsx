// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { generateUniqueId } from '@bfc/shared';
import formatMessage from 'format-message';
import { PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { Dialog, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import React from 'react';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

type PulledFailedDialogProps = {
  error: Error | string;
  onDismiss: () => void;
  selectedTargetName?: string;
};

const boldText = css`
  font-weight: ${FontWeights.semibold};
  word-break: break-work;
`;

const Bold = ({ children }) => (
  <span key={generateUniqueId()} css={boldText}>
    {children}
  </span>
);

export const PullFailedDialog: React.FC<PulledFailedDialogProps> = (props) => {
  const { error, onDismiss, selectedTargetName } = props;

  return (
    <Dialog
      dialogContentProps={{
        title: formatMessage('Something went wrong'),
        styles: {
          content: {
            fontSize: 16,
          },
        },
      }}
      hidden={false}
    >
      <p>
        {formatMessage.rich(
          'There was an unexpected error pulling from publish profile <b>{ selectedTargetName }</b>',
          { b: Bold, selectedTargetName }
        )}
      </p>
      <p css={boldText}>{typeof error === 'object' ? JSON.stringify(error, undefined, 2) : error}</p>
      <DialogFooter>
        <PrimaryButton text={formatMessage('Ok')} onClick={onDismiss} />
      </DialogFooter>
      er.test
    </Dialog>
  );
};
