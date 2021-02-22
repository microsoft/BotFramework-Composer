// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Link } from 'office-ui-fabric-react/lib/Link';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdateKey: (key: string) => Promise<void>;
};

const ABSChannelSpeechModal = (props: Props) => {
  const { isOpen, onClose, onUpdateKey } = props;

  const [value, setValue] = useState<string | undefined>();

  return (
    <DialogWrapper
      data-testid={'absChannelsSpeechModal'}
      dialogType={DialogTypes.Customer}
      isOpen={isOpen}
      title={formatMessage('Connect to Direct Line Speech')}
      onDismiss={onClose}
    >
      <div data-testid="absChannelsSpeechModal">
        <p>
          {formatMessage(
            'In order to connect your bot to the Direct Line Speech service, you must provide a Cognitive Services key. '
          )}
          <Link
            href="https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-directlinespeech?view=azure-bot-service-4.0#prerequisites"
            target="_new"
          >
            {formatMessage('Learn more')}
          </Link>
        </p>
        <TextField
          aria-label={formatMessage('Cognitive services key')}
          data-testid={'absChannelsSpeechModalKey'}
          id={'speechKey'}
          label={formatMessage('Cognitive services key')}
          placeholder={formatMessage('Enter cognitive services key')}
          value={value}
          onChange={(e, newvalue) => setValue(newvalue)}
        />
        <DialogFooter>
          <DefaultButton onClick={onClose}>{formatMessage('Cancel')}</DefaultButton>
          <PrimaryButton
            disabled={!value}
            onClick={async () => {
              if (value) {
                onUpdateKey(value);
                onClose();
              }
            }}
          >
            {formatMessage('Enable Speech')}
          </PrimaryButton>
        </DialogFooter>
      </div>
    </DialogWrapper>
  );
};

export default ABSChannelSpeechModal;
