// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
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
  value?: { [key: string]: any };
};

const AdapterModal = (props: Props) => {
  const { isOpen, onClose, schema, uiSchema } = props;

  const [value, setValue] = useState(props.value);

  return (
    <DialogWrapper
      dialogType={DialogTypes.Customer}
      isOpen={isOpen}
      title={formatMessage('Configure adapter')}
      onDismiss={onClose}
    >
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
          onClick={() => {
            console.log(value);
            onClose();
          }}
        >
          {formatMessage('Create')}
        </PrimaryButton>
      </DialogFooter>
    </DialogWrapper>
  );
};

export default AdapterModal;
