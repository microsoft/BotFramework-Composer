// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { FieldConfig, useForm } from '../../hooks/useForm';
import { dispatcherState, showCreateQnAFromUrlDialogState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { validateName, CreateQnAFromModalProps, CreateQnAFromScratchFormData } from './constants';
import { subText, styles, dialogWindowMini, textField } from './styles';

const formConfig: FieldConfig<CreateQnAFromScratchFormData> = {
  name: {
    required: true,
    defaultValue: '',
  },
};

const DialogTitle = () => {
  return (
    <div>
      {formatMessage('Create new knowledge base from scratch')}
      <p>
        <span css={subText}>{formatMessage('Manually add question and answer pairs to create a KB')}</span>
      </p>
    </div>
  );
};

export const CreateQnAFromScratchModal: React.FC<CreateQnAFromModalProps> = (props) => {
  const { onDismiss, onSubmit, qnaFiles, projectId } = props;
  const actions = useRecoilValue(dispatcherState);
  const showCreateQnAFromUrlDialog = useRecoilValue(showCreateQnAFromUrlDialogState(projectId));

  formConfig.name.validate = validateName(qnaFiles);
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const disabled = hasErrors || !formData.name;

  const handleDismiss = () => {
    onDismiss?.();
    actions.createQnAFromScratchDialogCancel({ projectId });
    TelemetryClient.track('AddNewKnowledgeBaseCanceled');
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: <DialogTitle />,
        styles: styles.dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
      onDismiss={handleDismiss}
    >
      <div css={dialogWindowMini}>
        <Stack>
          <TextField
            data-testid={`knowledgeLocationTextField-name`}
            errorMessage={formErrors.name}
            label={formatMessage('Knowledge base name')}
            placeholder={formatMessage('Type a name that describes this content')}
            styles={textField}
            value={formData.name}
            onChange={(e, name = '') => updateField('name', name)}
          />
        </Stack>
      </div>
      <DialogFooter>
        {showCreateQnAFromUrlDialog && (
          <DefaultButton
            styles={{ root: { float: 'left' } }}
            text={formatMessage('Back')}
            onClick={() => {
              actions.createQnAFromScratchDialogBack({ projectId });
            }}
          />
        )}
        <DefaultButton
          text={formatMessage('Cancel')}
          onClick={() => {
            handleDismiss();
          }}
        />
        <PrimaryButton
          data-testid={'createKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('Create KB')}
          onClick={() => {
            if (hasErrors) {
              return;
            }
            onSubmit(formData);
            TelemetryClient.track('AddNewKnowledgeBaseCompleted', { scratch: true });
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default CreateQnAFromScratchModal;
