// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useContext, FormEvent } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { DialogCreationCopy } from '../../constants';
import { DialogWrapper } from '../../components/DialogWrapper';
import { DialogTypes } from '../../components/DialogWrapper/styles';
import { StorageFolder } from '../../store/types';
import { StoreContext } from '../../store';

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

export const CreateDialogModal: React.FC<CreateDialogModalProps> = props => {
  const { state } = useContext(StoreContext);
  const { dialogs } = state;
  const { onSubmit, onDismiss, isOpen } = props;
  const initialFormData: DialogFormData = { name: '', description: '' };
  const [formData, setFormData] = useState(initialFormData);
  const [formDataErrors, setFormDataErrors] = useState<{ name?: string }>({});

  const updateForm = (field: string) => (e: FormEvent, newValue: string | undefined) => {
    const newData: DialogFormData = {
      ...formData,
      [field]: newValue
    };
    validateForm(newData);
    setFormData(newData);
  };

  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  const validateForm = (newData: DialogFormData) => {
    const errors: { name?: string } = {};
    const { name } = newData;

    if (name) {
      if (!nameRegex.test(name)) {
        errors.name = formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
      }
      if (dialogs.some(dialog => dialog.id === name)) {
        errors.name = formatMessage('Duplicate dialog name');
      }
    } else {
      errors.name = formatMessage('Please input a name');
    }
    setFormDataErrors(errors);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (Object.keys(formDataErrors).length > 0) {
      return;
    }

    onSubmit({
      ...formData
    });
  };

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
              errorMessage={formDataErrors.name}
              label={formatMessage('Name')}
              styles={name}
              value={formData.name}
              onChange={updateForm('name')}
            />
          </StackItem>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              multiline
              label={formatMessage('Description')}
              resizable={false}
              styles={description}
              value={formData.description}
              onChange={updateForm('description')}
            />
          </StackItem>
        </Stack>

        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton text={formatMessage('Next')} onClick={handleSubmit} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};

export default CreateDialogModal;
