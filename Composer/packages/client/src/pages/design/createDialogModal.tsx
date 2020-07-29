// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useCallback } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';

import { DialogCreationCopy, nameRegex } from '../../constants';
import { StorageFolder } from '../../recoilModel/types';
import { dialogsState, currentProjectIdState } from '../../recoilModel/atoms/botState';
import { DialogWrapper, DialogTypes } from '../../components/DialogWrapper';
import { FieldConfig, useForm } from '../../hooks/useForm';

import { name, description, styles as wizardStyles } from './styles';

interface DialogFormData {
  name: string;
  description: string;
}

interface CreateDialogModalProps {
  onSubmit: (dialogFormData: DialogFormData) => void;
  onDismiss: () => void;
  onCurrentPathUpdate?: (newPath?: string, storageId?: string) => void;
  focusedStorageFolder?: StorageFolder;
  isOpen: boolean;
}

export const CreateDialogModal: React.FC<CreateDialogModalProps> = (props) => {
  const projectId = useRecoilValue(currentProjectIdState);
  const dialogs = useRecoilValue(dialogsState(projectId));
  const { onSubmit, onDismiss, isOpen } = props;
  const formConfig: FieldConfig<DialogFormData> = {
    name: {
      required: true,
      validate: (value) => {
        if (!nameRegex.test(value)) {
          return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
        }
        if (dialogs.some((dialog) => dialog.id.toLowerCase() === value.toLowerCase())) {
          return formatMessage('Duplicate dialog name');
        }
      },
    },
    description: {
      required: false,
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
      isOpen={isOpen}
      onDismiss={onDismiss}
      {...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE}
      dialogType={DialogTypes.DesignFlow}
    >
      <form onSubmit={handleSubmit}>
        <input style={{ display: 'none' }} type="submit" />
        <Stack styles={wizardStyles.stackinput} tokens={{ childrenGap: '2rem' }}>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              autoFocus
              required
              data-testid="NewDialogName"
              errorMessage={formErrors.name}
              label={formatMessage('Name')}
              styles={name}
              value={formData.name}
              onChange={(_e, val) => updateField('name', val)}
            />
          </StackItem>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              multiline
              label={formatMessage('Description')}
              resizable={false}
              styles={description}
              value={formData.description}
              onChange={(_e, val) => updateField('description', val)}
            />
          </StackItem>
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

export default CreateDialogModal;
