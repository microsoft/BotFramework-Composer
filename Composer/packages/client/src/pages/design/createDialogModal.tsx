// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useCallback } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import { RecognizerSchema, useRecognizerConfig, useShellApi } from '@bfc/extension-client';
import { DialogFactory, SDKKinds } from '@bfc/shared';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

import { DialogCreationCopy, nameRegex } from '../../constants';
import { StorageFolder } from '../../recoilModel/types';
import { FieldConfig, useForm } from '../../hooks/useForm';
import { actionsSeedState, schemasState, validateDialogSelectorFamily } from '../../recoilModel';

import { name, description, styles as wizardStyles } from './styles';

interface DialogFormData {
  name: string;
  description: string;
}

interface CreateDialogModalProps {
  onSubmit: (dialogName: string, dialogContent) => void;
  onDismiss: () => void;
  onCurrentPathUpdate?: (newPath?: string, storageId?: string) => void;
  focusedStorageFolder?: StorageFolder;
  isOpen: boolean;
  projectId: string;
}

export const CreateDialogModal: React.FC<CreateDialogModalProps> = (props) => {
  const { onSubmit, onDismiss, isOpen, projectId } = props;

  const schemas = useRecoilValue(schemasState(projectId));
  const dialogs = useRecoilValue(validateDialogSelectorFamily(projectId));
  const actionsSeed = useRecoilValue(actionsSeedState(projectId));

  const { shellApi, ...shellData } = useShellApi();
  const { defaultRecognizer } = useRecognizerConfig();

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

  const seedNewRecognizer = (recognizerSchema?: RecognizerSchema) => {
    if (recognizerSchema && typeof recognizerSchema.seedNewRecognizer === 'function') {
      return recognizerSchema.seedNewRecognizer(shellData, shellApi);
    }
    return { $kind: recognizerSchema?.id };
  };

  const seedNewDialog = (formData: DialogFormData) => {
    const seededContent = new DialogFactory(schemas.sdk?.content).create(SDKKinds.AdaptiveDialog, {
      $designer: { name: formData.name, description: formData.description },
      generator: `${formData.name}.lg`,
      recognizer: seedNewRecognizer(defaultRecognizer),
    });
    if (seededContent.triggers?.[0]) {
      seededContent.triggers[0].actions = actionsSeed;
    }

    return seededContent;
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (hasErrors) {
        return;
      }

      const dialogData = seedNewDialog(formData);

      onSubmit(formData.name, dialogData);
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
