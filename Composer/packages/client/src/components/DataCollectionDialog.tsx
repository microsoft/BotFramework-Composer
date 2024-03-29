// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogFooter } from '@fluentui/react/lib/Dialog';
import { Link } from '@fluentui/react/lib/Link';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { dispatcherState } from '../recoilModel';
import TelemetryService from '../telemetry/TelemetryClient';

const DataCollectionDialog: React.FC = () => {
  const { updateUserSettings } = useRecoilValue(dispatcherState);

  const handleDataCollectionChange = (allowDataCollection: boolean) => () => {
    TelemetryService.track('TelemetryOptInOut', { enabled: allowDataCollection });

    updateUserSettings({
      telemetry: {
        allowDataCollection,
      },
    });
  };

  return (
    <Dialog
      hidden={false}
      modalProps={{
        isBlocking: true,
        isDarkOverlay: false,
      }}
      title={formatMessage('Help us improve?')}
      onDismiss={handleDataCollectionChange(false)}
    >
      <p>
        {formatMessage(
          'Composer includes a telemetry feature that collects usage information. It is important that the Composer team understands how the tool is being used so that it can be improved.',
        )}
      </p>
      <p>{formatMessage('You can turn data collection on or off at any time in the Application Settings.')}</p>
      <p>
        <Link
          aria-label={formatMessage('Privacy statement')}
          href={'https://privacy.microsoft.com/privacystatement'}
          target={'_blank'}
        >
          {formatMessage('Privacy statement')}
        </Link>
      </p>
      <DialogFooter>
        <DefaultButton text={formatMessage('Not now')} onClick={handleDataCollectionChange(false)} />
        <PrimaryButton text={formatMessage('Yes, collect data')} onClick={handleDataCollectionChange(true)} />
      </DialogFooter>
    </Dialog>
  );
};

export default DataCollectionDialog;
export { DataCollectionDialog };
