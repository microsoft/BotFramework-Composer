// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { AdapterConfig } from '@botframework-composer/types/src';
import formatMessage from 'format-message';

export type AdapterModal = {
  isOpen: boolean;
  title: string;
  onDismiss: () => void;
  onConfirm: () => void;
  handleSettings: (data: AdapterConfig) => void;
};

export const AdapterModal: React.FC<AdapterModal> = (props) => {
  const { isOpen, title, onDismiss, onConfirm, handleSettings } = props;
  const [currentSettings, setCurrentSettings] = useState<AdapterConfig>({ name: '', type: '', data: {} });

  const nameLabel = formatMessage('Name');
  const typeLabel = formatMessage('Type');

  return (
    <DialogWrapper dialogType={DialogTypes.Customer} isOpen={isOpen} title={title}>
      <DialogFooter>
        <TextField
          ariaLabel={nameLabel}
          label={nameLabel}
          onChange={(_e, val) => setCurrentSettings({ ...currentSettings, name: val ?? '' })}
        />
        <TextField
          ariaLabel={typeLabel}
          label={typeLabel}
          onChange={(_e, val) => setCurrentSettings({ ...currentSettings, type: val ?? '' })}
        />
        <TextField
          ariaLabel={'Misc'}
          label={'Misc'}
          onChange={(_e, val) => setCurrentSettings({ ...currentSettings, data: { misc: val ?? '' } })}
        />
        <DefaultButton onClick={onDismiss}>{formatMessage('Cancel')}</DefaultButton>
        <PrimaryButton
          onClick={() => {
            handleSettings(currentSettings);
            onConfirm();
          }}
        >
          {formatMessage('Okay')}
        </PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};
