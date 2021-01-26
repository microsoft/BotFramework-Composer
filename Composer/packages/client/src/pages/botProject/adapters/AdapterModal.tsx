// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ObjectField } from '@bfc/adaptive-form';

import { JSONSchema7 } from '../../../../../types';

type Props = {
  key: string;
  isOpen: boolean;
  onClose: () => void;
  schema: JSONSchema7;
  uiSchema: JSONSchema7;
};

const AdapterModal = (props: Props) => {
  const { isOpen, onClose, schema, uiSchema } = props;

  return (
    <DialogWrapper
      dialogType={DialogTypes.Customer}
      isOpen={isOpen}
      title={formatMessage('Configure adapter')}
      onDismiss={onClose}
    >
      <ObjectField schema={schema} uiOptions={uiSchema} onChange={console.log} />
      <DialogFooter>
        <DefaultButton onClick={onClose}>{formatMessage('Cancel')}</DefaultButton>
        <PrimaryButton
          onClick={() => {
            // save these values to settings somewhere, using the key given in props
            onClose();
          }}
        >
          {formatMessage('Okay')}
        </PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};

export default AdapterModal;
