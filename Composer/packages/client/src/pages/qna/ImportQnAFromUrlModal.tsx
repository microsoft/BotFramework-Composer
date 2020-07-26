// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from '@uifabric/styling';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';

import { FieldConfig, useForm } from '../../hooks/useForm';
const styles = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
    },
  },
  modal: {
    main: {
      maxWidth: '800px !important',
    },
  },
};

const dialogWindow = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  min-height: 300px;
`;

const textField = {
  root: {
    width: '400px',
    paddingBottom: '20px',
  },
};

const warning = {
  color: SharedColors.red10,
  fontSize: FontSizes.size10,
};

interface ImportQnAFromUrlModalProps {
  isOpen: boolean;
  dialogId: string;
  onDismiss: () => void;
  onSubmit: (location: string, subscriptionKey: string, endpoint: string) => void;
}

interface ImportQnAFromUrlModalFormData {
  location: string;
  subscriptionKey: string;
  region: string;
}

export const ImportQnAFromUrlModal: React.FC<ImportQnAFromUrlModalProps> = (props) => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const formConfig: FieldConfig<ImportQnAFromUrlModalFormData> = {
    location: {
      required: true,
      defaultValue: '',
    },
    subscriptionKey: {
      required: true,
      defaultValue: '',
    },
    region: {
      required: true,
      defaultValue: 'westus',
    },
  };
  const { formData, updateField } = useForm(formConfig);
  const disabled = dialogId === 'all';
  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Create New Knowledge Base'),
        subText: formatMessage(
          'Extract question-and-answer pairs from an online FAQ, product manuals, or other files. Supported formats are .tsv, .pdf, .doc, .docx, .xlsx, containing questions and answers in sequence. Learn more about knowledge base sources. Skip this step to add questions and answers manually after creation. The number of sources and file size you can add depends on the QnA service SKU you choose. Learn more about QnA Maker SKUs.'
        ),
        styles: styles.dialog,
      }}
      hidden={!isOpen}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
      onDismiss={onDismiss}
    >
      <div css={dialogWindow}>
        <Stack>
          <TextField
            data-testid="knowledge location"
            label={formatMessage('knowledge location(URL name)')}
            styles={textField}
            value={formData.location}
            onChange={(e, location) => updateField('location', location)}
          />
          <TextField
            data-testid="subscriptionKey"
            label={formatMessage('subscription key')}
            styles={textField}
            value={formData.subscriptionKey}
            onChange={(e, subscriptionKey) => updateField('subscriptionKey', subscriptionKey)}
          />
          <TextField
            data-testid="region"
            label={formatMessage('Region')}
            styles={textField}
            value={formData.region}
            onChange={(e, region) => updateField('region', region)}
          />
          {disabled && <div css={warning}> {formatMessage('please select a specific qna file to import QnA')} </div>}
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'createKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('create knowledge base')}
          onClick={() => onSubmit(formData.location, formData.subscriptionKey, formData.region)}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default ImportQnAFromUrlModal;
