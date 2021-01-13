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
  onClose: () => void;
  handleSettings: (data: AdapterConfig) => void;
};

export const AdapterModal: React.FC<AdapterModal> = (props) => {
  const { isOpen, title, onClose, handleSettings } = props;
  const [currentSettings, setCurrentSettings] = useState<AdapterConfig>({ key: '', name: '', type: '', data: {} });

  const nameLabel = formatMessage('Name');
  const typeLabel = formatMessage('Type');

  return (
    <DialogWrapper dialogType={DialogTypes.Customer} isOpen={isOpen} title={title}>
      <TextField
        ariaLabel={nameLabel}
        label={nameLabel}
        onChange={(_e, val) =>
          setCurrentSettings({ ...currentSettings, name: val ?? '', key: 'key_' + (val ?? 'null') })
        }
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
      <DialogFooter>
        <DefaultButton onClick={onClose}>{formatMessage('Cancel')}</DefaultButton>
        <PrimaryButton
          onClick={() => {
            handleSettings(currentSettings);
            onClose();
          }}
        >
          {formatMessage('Okay')}
        </PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};
