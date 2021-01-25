// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import AdaptiveForm from '@bfc/adaptive-form';

import { JSONSchema7 } from '../../../../../types';

type Props = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  schema: JSONSchema7;
  uiSchema: JSONSchema7;
};

const AdapterModal = (props: Props) => {
  const { isOpen, onCancel, onConfirm, schema, uiSchema } = props;

  return (
    <DialogWrapper
      dialogType={DialogTypes.Customer}
      isOpen={isOpen}
      title={formatMessage('Configure adapter')}
      onDismiss={onCancel}
    >
      <AdaptiveForm schema={schema} uiOptions={uiSchema} onChange={console.log} />
      <DialogFooter>
        <DefaultButton onClick={onCancel}>{formatMessage('Cancel')}</DefaultButton>
        <PrimaryButton onClick={onConfirm}>{formatMessage('Okay')}</PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};

export default AdapterModal;
