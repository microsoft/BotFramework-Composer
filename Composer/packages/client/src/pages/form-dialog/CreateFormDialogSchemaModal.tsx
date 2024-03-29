// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogTypes, DialogWrapper } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { DialogFooter } from '@fluentui/react/lib/Dialog';
import { Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import React, { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { nameRegex } from '../../constants';
import { FieldConfig, useForm } from '../../hooks/useForm';
import { dialogsSelectorFamily } from '../../recoilModel';

type FormDialogSchemaFormData = {
  name: string;
};

type Props = {
  projectId: string;
  isOpen: boolean;
  onSubmit: (formDialogName: string) => void;
  onDismiss: () => void;
};

const CreateFormDialogSchemaModal: React.FC<Props> = (props) => {
  const { isOpen, projectId, onSubmit, onDismiss } = props;

  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));

  const formConfig: FieldConfig<FormDialogSchemaFormData> = {
    name: {
      required: true,
      validate: (value) => {
        if (!nameRegex.test(value)) {
          return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
        }
        if (dialogs.some((dialog) => dialog.id === value)) {
          return formatMessage('Dialog with the name: {value} already exists.', { value });
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

      onSubmit(formData.name);
    },
    [hasErrors, formData],
  );

  return (
    <DialogWrapper
      dialogType={DialogTypes.DesignFlow}
      isOpen={isOpen}
      subText={formatMessage('A form dialog enables your bot to collect pieces of information .')}
      title={formatMessage('Create form dialog')}
      onDismiss={onDismiss}
    >
      <form onSubmit={handleSubmit}>
        <input style={{ display: 'none' }} type="submit" />
        <Stack>
          <TextField
            required
            autoComplete="off"
            errorMessage={formErrors.name}
            label={formatMessage('Name')}
            value={formData.name}
            onChange={(_e, val) => updateField('name', val)}
          />
        </Stack>

        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton
            disabled={hasErrors || formData.name === ''}
            text={formatMessage('Create')}
            onClick={handleSubmit}
          />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};

export default CreateFormDialogSchemaModal;
