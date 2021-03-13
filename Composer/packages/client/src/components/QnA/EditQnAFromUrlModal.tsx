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
import { QnAFile } from '@bfc/shared';

import { FieldConfig, useForm } from '../../hooks/useForm';
import { getKBName } from '../../utils/fileUtil';
import { getQnAFileUrlOption } from '../../utils/qnaUtil';

import { validateName, validateUrl } from './constants';
import { styles, dialogWindow, textFieldKBNameFromScratch } from './styles';

type EditQnAFromUrlModalProps = {
  qnaFiles: QnAFile[];
  qnaFile: QnAFile;
  onDismiss: () => void;
  onSubmit: (formData: EditQnAFromUrlFormData) => void;
};

export type EditQnAFromUrlFormData = {
  preName: string;
  name: string;
  url: string;
};

const formConfig: FieldConfig<EditQnAFromUrlFormData> = {
  preName: {
    defaultValue: '',
  },
  name: {
    required: true,
    defaultValue: '',
  },
  url: {
    required: true,
    defaultValue: '',
  },
};

const DialogTitle = () => {
  return <div>{formatMessage('Edit KB name')}</div>;
};

export const EditQnAFromUrlModal: React.FC<EditQnAFromUrlModalProps> = (props) => {
  const { onDismiss, onSubmit, qnaFiles, qnaFile } = props;

  formConfig.name.validate = validateName(qnaFiles.filter(({ id }) => qnaFile.id !== id));
  formConfig.name.defaultValue = getKBName(qnaFile.id);
  formConfig.url.validate = validateUrl;
  formConfig.url.defaultValue = getQnAFileUrlOption(qnaFile);
  formConfig.preName.defaultValue = getKBName(qnaFile.id);
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const disabled = hasErrors;

  const updateName = (name = '') => {
    updateField('name', name);
  };
  const updateUrl = (url = '') => {
    updateField('url', url);
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.close,
        title: <DialogTitle />,
        styles: styles.dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: false,
        styles: styles.modalCreateFromScratch,
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
            styles={textFieldKBNameFromScratch}
            value={formData.name}
            onChange={(e, name) => updateName(name)}
          />
        </Stack>
        <Stack>
          <TextField
            disabled
            data-testid={`knowledgeLocationTextField-url`}
            errorMessage={formErrors.url}
            label={formatMessage('Knowledge source')}
            placeholder={formatMessage('Enter a URL or browse to upload a file ')}
            styles={textFieldKBNameFromScratch}
            value={formData.url}
            onChange={(e, url) => updateUrl(url)}
          />
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'editKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('Done')}
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

export default EditQnAFromUrlModal;
