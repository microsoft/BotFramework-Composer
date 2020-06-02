// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useContext, useCallback } from 'react';
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
import { FieldConfig, useForm } from '../../hooks';

import { name, description, styles as wizardStyles } from './styles';

interface DialogFormData {
  name: string;
  description: string;
  dialogType: string;
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
  const dialogTypeOptions: IDropdownOption[] = [
    {
      key: 'none',
      text: 'None'
    },
    {
      key: 'formDialog',
      text: 'FormDialog'
    },
    {
      key: 'swaggerDialog',
      text: 'SwaggerDialog'
    }
  ];
  const formConfig: FieldConfig<DialogFormData> = {
    name: {
      required: true,
      validate: value => {
        const nameRegex = /^[a-zA-Z0-9-_.]+$/;

        if (!nameRegex.test(value)) {
          return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
        }
        if (dialogs.some(dialog => dialog.id === value)) {
          return formatMessage('Duplicate dialog name');
        }
      }
    },
    description: {
      required: false
    },
    dialogType: {
      required: false
    }
  };

  const { formData, formErrors, hasErrors, updateField } = useForm(formConfig);

  const handleSubmit = useCallback(
    e => {
      e.preventDefault();
      if (hasErrors) {
        return;
      }

      onSubmit({
        ...formData
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
            <Dropdown
              data-testid={'dialogTypeDropdown'}
              defaultSelectedKey={formData.dialogType}
              label={formatMessage('choose dialog type?')}
              options={dialogTypeOptions}
              onChange={(_e, val) => updateField('dialogType', val?.key as string)}
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
          <PrimaryButton disabled={hasErrors} text={formatMessage('Next')} onClick={handleSubmit} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};

export default CreateDialogModal;
