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
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { QnAFile } from '@bfc/shared';

import { FieldConfig, useForm } from '../../hooks/useForm';
import { getQnAFileUrlOption, getQnAFileMultiTurnOption } from '../../utils/qnaUtil';

import { validateUrl } from './constants';
import { styles, dialogWindow, textFieldKBNameFromScratch } from './styles';

type ImportQnAFromUrlModalProps = {
  qnaFile: QnAFile;
  onDismiss: () => void;
  onSubmit: (formData: ImportQnAFromUrlFormData) => void;
};

export type ImportQnAFromUrlFormData = {
  url: string;
  multiTurn: boolean;
};

const formConfig: FieldConfig<ImportQnAFromUrlFormData> = {
  url: {
    required: true,
    defaultValue: '',
  },
  multiTurn: {
    defaultValue: false,
  },
};

const DialogTitle = () => {
  return <div>{formatMessage('Import Url')}</div>;
};

export const ImportQnAFromUrlModal: React.FC<ImportQnAFromUrlModalProps> = (props) => {
  const { onDismiss, onSubmit, qnaFile } = props;
  const defaultUrl = getQnAFileUrlOption(qnaFile);
  const defaultMultiTurn = getQnAFileMultiTurnOption(qnaFile);
  formConfig.url.validate = validateUrl;
  formConfig.url.defaultValue = getQnAFileUrlOption(qnaFile);
  formConfig.multiTurn.defaultValue = getQnAFileMultiTurnOption(qnaFile);
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const disabled = hasErrors;

  const updateUrl = (url = '') => {
    updateField('url', url);
  };

  const updateMultiTurn = (multiTurn = false) => {
    updateField('multiTurn', multiTurn);
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
            data-testId={'ImportNewUrlToOverwriteQnAFile'}
            errorMessage={formErrors.url}
            label={formatMessage('Knowledge source')}
            placeholder={formatMessage('Enter a URL to Import QnA resource')}
            styles={textFieldKBNameFromScratch}
            value={formData.url}
            onChange={(e, url) => updateUrl(url)}
          />
        </Stack>
        <Stack>
          <Checkbox
            checked={formData.multiTurn}
            label={formatMessage('Enable multi-turn extraction')}
            onChange={(_e, val) => updateMultiTurn(val)}
          />
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          disabled={disabled}
          text={formatMessage('Done')}
          onClick={() => {
            if (hasErrors) {
              return;
            }
            if (formData.url !== defaultUrl || formData.multiTurn !== defaultMultiTurn) {
              onSubmit(formData);
            }
            onDismiss();
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default ImportQnAFromUrlModal;
