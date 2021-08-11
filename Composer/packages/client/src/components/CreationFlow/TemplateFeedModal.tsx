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
import { firstPartyTemplateFeed } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/components/Link';

import TelemetryClient from '../../telemetry/TelemetryClient';

export interface WorkingModalProps {
  hidden: boolean;
  feedUrl: string;
  closeDialog: () => void;
  onUpdateFeed: (newValue: string) => void;
}

export const TemplateFeedModal: React.FC<WorkingModalProps> = (props) => {
  const [urlValue, setUrlValue] = useState(props.feedUrl);

  const savePendingEdits = () => {
    if (urlValue === firstPartyTemplateFeed) {
      TelemetryClient.track('TemplateFeedChangedToDefaultFeed');
    } else {
      TelemetryClient.track('TemplateFeedChangedToCustomFeed');
    }
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
      onDismiss={closeDialog}
    >
      <TextField
        label={formatMessage('Template Feed Url')}
        value={urlValue}
        onChange={(ev, newValue) => {
          if (newValue) {
            setUrlValue(newValue);
          } else {
            setUrlValue('');
          }
        }}
      />
      <Link
        underline
        onClick={(ev) => {
          setUrlValue(firstPartyTemplateFeed);
        }}
      >
        {formatMessage('Reset to default feed')}
      </Link>
      <DialogFooter>
        <PrimaryButton onClick={closeDialog}>{formatMessage('Done')}</PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};
