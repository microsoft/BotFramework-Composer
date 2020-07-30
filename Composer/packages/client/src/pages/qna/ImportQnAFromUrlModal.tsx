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
  subscriptionKey: string;
  onDismiss: () => void;
  onSubmit: (location: string, subscriptionKey: string, endpoint: string) => void;
}

interface ImportQnAFromUrlModalFormData {
  location: string;
  subscriptionKey: string;
  region: string;
}

export const ImportQnAFromUrlModal: React.FC<ImportQnAFromUrlModalProps> = (props) => {
  const { isOpen, onDismiss, onSubmit, dialogId, subscriptionKey } = props;
  const formConfig: FieldConfig<ImportQnAFromUrlModalFormData> = {
    location: {
      required: true,
      defaultValue: '',
    },
    subscriptionKey: {
      required: true,
      defaultValue: subscriptionKey,
    },
    region: {
      required: true,
      defaultValue: 'westus',
    },
  };
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const isQnAFileselected = !(dialogId === 'all');
  const disabled = !isQnAFileselected || hasErrors;
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
            required
            data-testid="knowledgeLocationTextField"
            errorMessage={formErrors.location}
            label={formatMessage('knowledge location(URL name)')}
            styles={textField}
            value={formData.location}
            onChange={(e, location) => updateField('location', location)}
          />
          <TextField
            required
            data-testid="subscriptionKey"
            errorMessage={formErrors.subscriptionKey}
            label={formatMessage('Subscription key')}
            styles={textField}
            value={formData.subscriptionKey}
            onChange={(e, subscriptionKey) => updateField('subscriptionKey', subscriptionKey)}
          />
          <TextField
            required
            data-testid="region"
            errorMessage={formErrors.region}
            label={formatMessage('Region')}
            styles={textField}
            value={formData.region}
            onChange={(e, region) => updateField('region', region)}
          />
          {!isQnAFileselected && (
            <div css={warning}> {formatMessage('please select a specific qna file to import QnA')}</div>
          )}
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'createKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('Create Knowledge Base')}
          onClick={() => {
            if (hasErrors) {
              return;
            }
            onSubmit(formData.location, formData.subscriptionKey, formData.region);
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default ImportQnAFromUrlModal;
