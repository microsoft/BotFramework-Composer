// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ObjectField } from '@bfc/adaptive-form';
import { useRecoilValue } from 'recoil';

import { JSONSchema7 } from '../../../../../types';
import { settingsState, dispatcherState } from '../../../recoilModel';

type Props = {
  adapterKey: string;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  schema: JSONSchema7;
  uiSchema: JSONSchema7;
  value?: { [key: string]: any };
};

const AdapterModal = (props: Props) => {
  const { isOpen, onClose, schema, uiSchema, projectId, adapterKey } = props;

  const [value, setValue] = useState(props.value);
  const { setSettings } = useRecoilValue(dispatcherState);
  const currentSettings = useRecoilValue(settingsState(projectId));

  return (
    <DialogWrapper
      data-testid={'adapterModal'}
      dialogType={DialogTypes.Customer}
      isOpen={isOpen}
      title={formatMessage('Configure adapter')}
      onDismiss={onClose}
    >
      <div data-testid="adapterModal">
        <ObjectField
          definitions={{}}
          depth={0}
          id={''}
          name={''}
          schema={schema}
          uiOptions={uiSchema}
          value={value}
          onChange={(update?: { [key: string]: any }) => {
            if (update != null) setValue({ ...value, ...update });
          }}
        />
        <DialogFooter>
          <DefaultButton onClick={onClose}>{formatMessage('Back')}</DefaultButton>
          <PrimaryButton
            onClick={async () => {
              if (value != null) {
                const currentAdapters: string[] = currentSettings.adapters ?? [];

                await setSettings(projectId, {
                  ...currentSettings,
                  adapters: currentAdapters.includes(adapterKey) ? currentAdapters : [...currentAdapters, adapterKey],
                  [adapterKey]: value,
                });
              }
              onClose();
            }}
          >
            {formatMessage('Create')}
          </PrimaryButton>
        </DialogFooter>
      </div>
    </DialogWrapper>
  );
};

export default AdapterModal;
