// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useContext } from 'react';
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
  isOpen: boolean;
}

export const CreateDialogModal: React.FC<CreateDialogModalProps> = props => {
  const { state } = useContext(StoreContext);
  const { dialogs } = state;
  const { onSubmit, onDismiss, isOpen } = props;
  const initialFormData: DialogFormData = { name: '', description: '' };
  const [formData, setFormData] = useState(initialFormData);
  const [hasErrors, setErrors] = useState(true);

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const _onGetErrorMessage = (name: string) => {
    if (name) {
      if (!nameRegex.test(name)) {
        setErrors(true);
        return formatMessage(
          'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
        );
      }
      if (dialogs.some(dialog => dialog.id === name)) {
        setErrors(true);
        return formatMessage('Duplicaton of dialog name');
      }
    } else {
      setErrors(true);
      return formatMessage('Please input a name');
    }
    setErrors(false);
    return '';
  };

  const nameRegex = /^[a-zA-Z0-9-_.]+$/;

  const handleSubmit = e => {
    e.preventDefault();

    if (!hasErrors)
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
              onChange={updateForm('name')}
              onGetErrorMessage={_onGetErrorMessage}
              data-testid="NewDialogName"
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
