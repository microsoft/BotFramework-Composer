// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { AdapterConfig } from '@botframework-composer/types/src';
import formatMessage from 'format-message';

export type AdapterModal = {
  isOpen: boolean;
  title: string;
  onDismiss: () => void;
  onConfirm: () => void;
};

export const WorkingModal: React.FC<AdapterModal> = (props) => {
  const [currentSettings, setCurrentSettings] = useState<AdapterConfig>({ name: '', type: '', data: {} });

  return (
    <DialogWrapper dialogType={DialogTypes.Customer} isOpen={props.isOpen} title={props.title}>
      <DialogFooter>
        <DefaultButton onClick={props.onDismiss}>{formatMessage('Cancel')}</DefaultButton>
        <PrimaryButton disabled={!selectedTemplate} onClick={setSettings}>
          {formatMessage('Okay')}
        </PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};
