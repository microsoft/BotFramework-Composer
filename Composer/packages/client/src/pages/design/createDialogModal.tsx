// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useContext, useCallback } from 'react';
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
import { FieldConfig, useForm } from '../../hooks';

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
  const { state } = useContext(StoreContext);
  const { dialogs } = state;
  const { onSubmit, onDismiss, isOpen } = props;
  const formConfig: FieldConfig<DialogFormData> = {
    name: {
      required: true,
      validate: (value) => {
        const nameRegex = /^[a-zA-Z0-9-_.]+$/;

        if (!nameRegex.test(value)) {
          return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
        }
        if (dialogs.some((dialog) => dialog.id === value)) {
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
<<<<<<< HEAD
=======
      if (dialogs.some((dialog) => dialog.id === name)) {
        errors.name = formatMessage('Duplicate dialog name');
      }
    } else {
      errors.name = formatMessage('Please input a name');
    }
    setFormDataErrors(errors);
  };

  const isDisable = () => {
    return Object.keys(formDataErrors).length > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisable()) {
      return;
    }
>>>>>>> add unit tests

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
<<<<<<< HEAD
          <PrimaryButton disabled={hasErrors} text={formatMessage('Next')} onClick={handleSubmit} />
=======
          <PrimaryButton
            disabled={isDisable()}
            text={formatMessage('Next')}
            onClick={handleSubmit}
            data-testid="SubmitNewDialogBtn"
          />
>>>>>>> add unit tests
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};

export default CreateDialogModal;
