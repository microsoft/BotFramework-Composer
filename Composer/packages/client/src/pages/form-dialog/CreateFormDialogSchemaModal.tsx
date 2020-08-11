// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import React, { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { DialogTypes, DialogWrapper } from '../../components/DialogWrapper';
import { nameRegex } from '../../constants';
import { FieldConfig, useForm } from '../../hooks/useForm';
import { formDialogSchemasState } from '../../recoilModel';

type FormDialogDialogSchemaFormData = {
  name: string;
};

type CreateFormDialogSchemaModalProps = {
  onSubmit: (dialogSchemaFormData: FormDialogDialogSchemaFormData) => void;
  onDismiss: () => void;
  isOpen: boolean;
};

export const CreateFormDialogSchemaModal: React.FC<CreateFormDialogSchemaModalProps> = (props) => {
  const formDialogSchemas = useRecoilValue(formDialogSchemasState);
  const { onSubmit, onDismiss, isOpen } = props;

  const formConfig: FieldConfig<FormDialogDialogSchemaFormData> = {
    name: {
      required: true,
      validate: (value) => {
        if (!nameRegex.test(value)) {
          return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
        }
        if (formDialogSchemas.some((dialog) => dialog.id === value)) {
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
            text={formatMessage('Create')}
            onClick={handleSubmit}
          />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};
