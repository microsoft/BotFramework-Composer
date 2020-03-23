// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useContext, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { DialogCreationCopy } from '../../constants';
import { DialogWrapper } from '../../components/DialogWrapper/index';
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
  currentPath?: string;
  isOpen: boolean;
}

export const CreateDialogModal: React.FC<CreateDialogModalProps> = props => {
  const { state } = useContext(StoreContext);
  const { dialogs } = state;
  const { onSubmit, onDismiss, isOpen } = props;
  const initialFormData: DialogFormData = { name: '', description: '' };
  const [formData, setFormData] = useState(initialFormData);
  const [formDataErrors, setFormDataErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    const handleUserKeyPress = event => {
      const { keyCode } = event;
      if (keyCode === 9) {
        const errors = validateForm(formData);
        setFormDataErrors(errors);
      }
    };
    document.addEventListener('keydown', handleUserKeyPress);
    return () => {
      document.removeEventListener('keydown', handleUserKeyPress);
    };
  }, []);
  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  const validateForm = (data: DialogFormData) => {
    const errors: { name?: string } = {};
    const { name } = data;

    if (name) {
      if (!nameRegex.test(name)) {
        errors.name = formatMessage(
          'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
        );
      }
      if (dialogs.some(dialog => dialog.id === name)) {
        errors.name = formatMessage('Duplication of dialog name');
      }
    } else {
      errors.name = formatMessage('Please input a name');
    }
    return errors;
  };

  const onNameChange = (e, name) => {
    const newFormData = {
      ...formData,
      name,
    };
    const errors = validateForm(newFormData);
    setFormDataErrors(errors);
    setFormData(newFormData);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length) {
      setFormDataErrors(errors);
      return;
    }

    onSubmit({
      ...formData,
    });
  };

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} {...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE}>
      <form onSubmit={handleSubmit}>
        <input type="submit" style={{ display: 'none' }} />
        <Stack tokens={{ childrenGap: '2rem' }} styles={wizardStyles.stackinput}>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              label={formatMessage('Name')}
              value={formData.name}
              styles={name}
              onChange={onNameChange}
              errorMessage={formDataErrors.name}
              data-testid="NewDialogName"
              autoFocus
              required
            />
          </StackItem>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              styles={description}
              value={formData.description}
              label={formatMessage('Description')}
              multiline
              resizable={false}
              onChange={updateForm('description')}
            />
          </StackItem>
        </Stack>

        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};
