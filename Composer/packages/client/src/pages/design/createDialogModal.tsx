// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useContext, FormEvent } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IDropdownOption, Dropdown } from 'office-ui-fabric-react/lib/Dropdown';

import { DialogCreationCopy } from '../../constants';
import { DialogWrapper } from '../../components/DialogWrapper';
import { DialogTypes } from '../../components/DialogWrapper/styles';
import { StorageFolder } from '../../store/types';
import { StoreContext } from '../../store';

import { name, description, styles as wizardStyles } from './styles';

interface DialogFormData {
  name: string;
  description: string;
  isFormDialog: number;
  formDialogType: string;
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
  const initialFormData: DialogFormData = { name: '', description: '', isFormDialog: 0, formDialogType: 'sandwich' };
  const [formData, setFormData] = useState(initialFormData);
  const [formDataErrors, setFormDataErrors] = useState<{ name?: string }>({});
  const formDialogOptions: IDropdownOption[] = [
    {
      key: 0,
      text: 'false',
    },
    {
      key: 1,
      text: 'true',
    },
  ];
  const formDialogTypeOptions: IDropdownOption[] = [
    {
      key: 'sandwich',
      text: 'Sandwich',
    },
    {
      key: 'swagger',
      text: 'Swagger',
    },
  ];
  const updateForm = (field: string) => (e: FormEvent, newValue: string | IDropdownOption | undefined) => {
    const newData: DialogFormData = {
      ...formData,
      [field]: typeof newValue === 'string' ? newValue : newValue?.key,
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
      ...formData,
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
        <input type="submit" style={{ display: 'none' }} />
        <Stack tokens={{ childrenGap: '2rem' }} styles={wizardStyles.stackinput}>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              label={formatMessage('Name')}
              value={formData.name}
              styles={name}
              onChange={updateForm('name')}
              errorMessage={formDataErrors.name}
              data-testid="NewDialogName"
              required
              autoFocus
            />
          </StackItem>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <Dropdown
              label={formatMessage('Is form dialog?')}
              options={formDialogOptions}
              onChange={updateForm('isFormDialog')}
              data-testid={'isFormDialogDropDown'}
              defaultSelectedKey={formData.isFormDialog}
            />
          </StackItem>
          {formData.isFormDialog && (
            <StackItem grow={0} styles={wizardStyles.halfstack}>
              <Dropdown
                label={formatMessage('Is form dialog?')}
                options={formDialogTypeOptions}
                onChange={updateForm('dialogType')}
                data-testid={'formDialogTypeDropDown'}
                defaultSelectedKey={formData.formDialogType}
              />
            </StackItem>
          )}
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

export default CreateDialogModal;
