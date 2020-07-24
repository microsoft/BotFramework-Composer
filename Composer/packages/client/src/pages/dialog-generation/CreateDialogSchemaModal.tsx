// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import React, { useCallback, useContext } from 'react';

import { DialogWrapper } from '../../components/DialogWrapper/DialogWrapper';
import { DialogTypes } from '../../components/DialogWrapper/styles';
import { nameRegex } from '../../constants';
import { FieldConfig, useForm } from '../../hooks/useForm';
import { StoreContext } from '../../store';

type SchemaDialogFormData = {
  name: string;
};

type CreateSchemaDialogModalProps = {
  onSubmit: (dialogSchemaFormData: SchemaDialogFormData) => void;
  onDismiss: () => void;
  isOpen: boolean;
};

export const CreateSchemaDialogModal: React.FC<CreateSchemaDialogModalProps> = (props) => {
  const { state } = useContext(StoreContext);
  const { dialogSchemas } = state;
  const { onSubmit, onDismiss, isOpen } = props;

  const formConfig: FieldConfig<SchemaDialogFormData> = {
    name: {
      required: true,
      validate: (value) => {
        if (!nameRegex.test(value)) {
          return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
        }
        if (dialogSchemas.some((dialog) => dialog.id === value)) {
          return formatMessage('Duplicate dialog schema name');
        }
      },
    },
  };

  const { formData, formErrors, hasErrors, updateField } = useForm(formConfig);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (hasErrors) {
        return;
      }

      onSubmit({
        ...formData,
      });
    },
    [hasErrors, formData]
  );

  return (
    <DialogWrapper
      dialogType={DialogTypes.DesignFlow}
      isOpen={isOpen}
      subText={formatMessage('This schema is used to automatically convert a form to interactive dialogs')}
      title={formatMessage('Create dialog schema')}
      onDismiss={onDismiss}
    >
      <form onSubmit={handleSubmit}>
        <input style={{ display: 'none' }} type="submit" />
        <Stack>
          <TextField
            autoFocus
            required
            errorMessage={formErrors.name}
            label={formatMessage('Name')}
            styles={name}
            value={formData.name}
            onChange={(_e, val) => updateField('name', val)}
          />
        </Stack>

        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton
            data-testid="SubmitNewDialogBtn"
            disabled={hasErrors}
            text={formatMessage('OK')}
            onClick={handleSubmit}
          />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};
