// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useCallback } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import { DialogFactory, SDKKinds } from '@bfc/shared';
import { useRecognizerConfig } from '@bfc/extension-client';

import { DialogCreationCopy, nameRegex } from '../../constants';
import { StorageFolder } from '../../recoilModel/types';
import { DialogWrapper, DialogTypes } from '../../components/DialogWrapper';
import { FieldConfig, useForm } from '../../hooks/useForm';
import { validatedDialogsSelector } from '../../recoilModel/selectors/validatedDialogs';
import { actionsSeedState, schemasState } from '../../recoilModel';

import { name, description, styles as wizardStyles } from './styles';

interface DialogFormData {
  name: string;
  description: string;
}

interface CreateDialogModalProps {
  onSubmit: ({ id, content }) => void;
  onDismiss: () => void;
  onCurrentPathUpdate?: (newPath?: string, storageId?: string) => void;
  focusedStorageFolder?: StorageFolder;
  isOpen: boolean;
}

export const CreateDialogModal: React.FC<CreateDialogModalProps> = (props) => {
  const { onSubmit, onDismiss, isOpen } = props;

  const dialogs = useRecoilValue(validatedDialogsSelector);
  const schemas = useRecoilValue(schemasState);
  const actionsSeed = useRecoilValue(actionsSeedState);

  const { getDefaultRecognizer } = useRecognizerConfig();

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
      defaultValue: '',
    },
    description: {
      required: false,
      defaultValue: '',
    },
  };

  const { formData, formErrors, hasErrors, updateField } = useForm(formConfig);

  const seedNewRecognizer = ($kind) => {
    if ($kind === SDKKinds.CrossTrainedRecognizerSet) return `${formData.name}.lu.qna`;
    return {
      $kind,
    };
  };

  const seedNewDialog = (formData: DialogFormData) => {
    const defaultRecognizer = getDefaultRecognizer();
    const seededContent = new DialogFactory(schemas.sdk?.content).create(SDKKinds.AdaptiveDialog, {
      $designer: { name: formData.name, description: formData.description },
      generator: `${formData.name}.lg`,
      recognizer: seedNewRecognizer(defaultRecognizer?.id),
    });
    if (seededContent.triggers?.[0]) {
      seededContent.triggers[0].actions = actionsSeed;
    }
    const dialogData = { id: formData.name, content: seededContent };
    return dialogData;
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (hasErrors) {
        return;
      }
      const dialogData = seedNewDialog(formData);

      onSubmit(dialogData);
    },
    [hasErrors, formData]
  );

  return (
    <DialogWrapper
      isOpen={isOpen}
      onDismiss={onDismiss}
      {...DialogCreationCopy.DEFINE_DIALOG}
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
            disabled={hasErrors || formData.name === ''}
            text={formatMessage('OK')}
            onClick={handleSubmit}
          />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};

export default CreateDialogModal;
