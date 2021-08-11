// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

export interface WorkingModalProps {
  hidden: boolean;
  feedUrl: string;
  closeDialog: any;
  onUpdateFeed: any;
}

export const TemplateFeedModal: React.FC<WorkingModalProps> = (props) => {
  const [urlValue, setUrlValue] = useState(props.feedUrl);

  const savePendingEdits = () => {
    props.onUpdateFeed(urlValue);
  };

  const closeDialog = () => {
    savePendingEdits();
    props.closeDialog();
  };

  return (
    <DialogWrapper
      dialogType={DialogTypes.Customer}
      isOpen={!props.hidden}
      minWidth={960}
      subText={formatMessage('You can change the default template feed to a local or custom feed. Learn more.')}
      title={formatMessage('Configure template feed')}
      onDismiss={props.closeDialog}
    >
      <TextField
        label={formatMessage('Template Feed Url')}
        value={urlValue}
        onChange={(ev, newValue) => {
          newValue && setUrlValue(newValue);
        }}
      />
      <DialogFooter>
        <PrimaryButton onClick={closeDialog}>{formatMessage('Done')}</PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};
