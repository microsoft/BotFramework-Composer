// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { RouteComponentProps } from '@reach/router';
import { QnAFile } from '@bfc/shared';

import { FieldConfig, useForm } from '../../hooks/useForm';

import { validateName } from './constants';
import { subText, styles, dialogWindow, textField } from './styles';

interface CreateQnAFromScratchModalProps
  extends RouteComponentProps<{
    location: string;
  }> {
  dialogId: string;
  qnaFiles: QnAFile[];
  subscriptionKey?: string;
  onDismiss: () => void;
  onSubmit: (formData: CreateQnAFromScratchFormData) => void;
}

export interface CreateQnAFromScratchFormData {
  name: string;
}

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

export const CreateQnAFromScratchModal: React.FC<CreateQnAFromScratchModalProps> = (props) => {
  const { onDismiss, onSubmit, qnaFiles } = props;

  formConfig.name.validate = validateName(qnaFiles);
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const disabled = hasErrors;

  const updateName = (name = '') => {
    updateField('name', name);
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
      onDismiss={onDismiss}
    >
      <div css={dialogWindow}>
        <Stack>
          <TextField
            data-testid={`knowledgeLocationTextField-name`}
            errorMessage={formErrors.name}
            label={formatMessage('Knowledge base name')}
            placeholder={formatMessage('Type a name that describes this content')}
            styles={textField}
            value={formData.name}
            onChange={(e, name) => updateName(name)}
          />
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'createKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('Create KB')}
          onClick={() => {
            if (hasErrors) {
              return;
            }
            onSubmit(formData);
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default CreateQnAFromScratchModal;
