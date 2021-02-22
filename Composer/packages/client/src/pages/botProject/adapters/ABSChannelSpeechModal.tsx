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
  onUpdateKey: (key: string, region: string, isDefault: boolean) => Promise<void>;
};

const ABSChannelSpeechModal = (props: Props) => {
  const { isOpen, onClose, onUpdateKey } = props;

  const [value, setValue] = useState<string | undefined>();
  const [region, setRegion] = useState<string | undefined>();

  const linkToCreateKey = 'https://ms.portal.azure.com/#create/Microsoft.CognitiveServicesAllInOne';
  const linkToHelp =
    'https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-apis-create-account?tabs=multiservice%2Cwindows';

  return (
    <DialogWrapper
      data-testid={'absChannelsSpeechModal'}
      dialogType={DialogTypes.Customer}
      isOpen={isOpen}
      title={formatMessage('Connect to Speech Service')}
      onDismiss={onClose}
    >
      <div data-testid="absChannelsSpeechModal">
        <p>
          {formatMessage('Provide a key in order to connect your bot to the Azure Speech service. ')}
          <Link href={linkToHelp} target="_blank">
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
        <TextField
          aria-label={formatMessage('Cognitive Service Region')}
          data-testid={'absChannelsSpeechModalRegion'}
          id={'speechRegion'}
          label={formatMessage('Cognitive Service Region')}
          placeholder={formatMessage('Enter cognitive service region')}
          value={region}
          onChange={(e, newregion) => setRegion(newregion)}
        />
        <Link href={linkToCreateKey} target="_blank">
          {formatMessage('Get a key')}
        </Link>

        <DialogFooter>
          <PrimaryButton
            disabled={!value || !region}
            onClick={() => {
              if (value && region) {
                onUpdateKey(value, region, true);
                onClose();
              }
            }}
          >
            {formatMessage('Enable Speech')}
          </PrimaryButton>
          <DefaultButton onClick={onClose}>{formatMessage('Cancel')}</DefaultButton>
        </DialogFooter>
      </div>
    </DialogWrapper>
  );
};

export default ABSChannelSpeechModal;
