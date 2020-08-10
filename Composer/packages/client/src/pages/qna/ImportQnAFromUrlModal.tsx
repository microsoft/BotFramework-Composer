// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import cloneDeep from 'lodash/cloneDeep';
import { PrimaryButton, DefaultButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontWeights } from '@uifabric/styling';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { RouteComponentProps } from '@reach/router';
import { nanoid } from 'nanoid';

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

const actionButton = css`
  font-size: 16px;
  padding-left: 0px;
  margin-left: -5px;
`;

const urlContainer = css`
  display: flex;
  width: 444px;
`;

const cancel = css`
  margin-top: -3px;
  margin-left: 10px;
`;

interface ImportQnAFromUrlModalProps
  extends RouteComponentProps<{
    location: string;
  }> {
  isOpen: boolean;
  dialogId: string;
  isSubscriptionKeyNeeded: boolean;
  isRegionNeeded: boolean;
  isMultipleUrlAllowed: boolean;
  isCreatingBot: boolean;
  subscriptionKey?: string;
  onDismiss: () => void;
  onSubmit: (urls: string[], knowledgeBaseName: string, subscriptionKey: string, endpoint: string) => void;
}

interface ImportQnAFromUrlModalFormData {
  urls: string[];
  knowledgeBaseName: string;
  subscriptionKey?: string;
  region?: string;
}

export const ImportQnAFromUrlModal: React.FC<ImportQnAFromUrlModalProps> = (props) => {
  const {
    isOpen,
    onDismiss,
    onSubmit,
    dialogId,
    subscriptionKey = '',
    isSubscriptionKeyNeeded = true,
    isRegionNeeded = true,
    isMultipleUrlAllowed = true,
    isCreatingBot = false,
  } = props;

  const formConfig: FieldConfig<ImportQnAFromUrlModalFormData> = {
    urls: {
      required: true,
      defaultValue: [''],
    },
    knowledgeBaseName: {
      required: true,
      defaultValue: '',
    },
  };
  if (isSubscriptionKeyNeeded) {
    formConfig.subscriptionKey = {
      required: true,
      defaultValue: subscriptionKey,
    };
  }

  if (isRegionNeeded) {
    formConfig.region = {
      required: true,
      defaultValue: 'westus',
    };
  }

  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const isQnAFileselected = !(dialogId === 'all');
  const disabled = !isQnAFileselected || hasErrors;

  const addNewUrl = () => {
    const urls = cloneDeep(formData.urls);
    urls.splice(urls.length, 0, '');
    updateField('urls', urls);
  };

  const updateUrl = (index: number, url: string | undefined) => {
    if (!url) url = '';
    const urls = cloneDeep(formData.urls);
    urls[index] = url;
    updateField('urls', urls);
  };

  const removeUrl = (index: number) => {
    const urls = cloneDeep(formData.urls);
    urls.splice(index, 1);
    updateField('urls', urls);
  };

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
            data-testid="knowledgeBaseNameTextField"
            label={formatMessage('knowledgebase name')}
            styles={textField}
            value={formData.knowledgeBaseName}
            onChange={(e, knowledgeBaseName) => updateField('knowledgeBaseName', knowledgeBaseName)}
          />
          <TextField
            data-testid="knowledgeLocationTextField"
            label={formatMessage('knowledge location(URL name)')}
            styles={textField}
            value={formData.urls ? formData.urls[0] : ''}
            onChange={(e, url) => updateUrl(0, url)}
          />
          {formData.urls.map((l, index) => {
            if (index === 0) return;
            return (
              <div key={nanoid(6)} css={urlContainer}>
                <TextField
                  data-testid="knowledgeLocationTextField"
                  label={index === 0 ? formatMessage('knowledge location(URL name)') : ''}
                  styles={textField}
                  value={l}
                  onChange={(e, url) => updateUrl(index, url)}
                />
                <ActionButton
                  css={cancel}
                  data-testid={'deleteImportQnAUrl'}
                  iconProps={{ iconName: 'Cancel' }}
                  onClick={(e) => removeUrl(index)}
                />
              </div>
            );
          })}

          {isMultipleUrlAllowed && (
            <ActionButton css={actionButton} data-testid={'addQnAImportUrl'} iconProps={{ iconName: 'Add' }}>
              {<Link onClick={addNewUrl}>{formatMessage('Add')}</Link>}
            </ActionButton>
          )}
          {isSubscriptionKeyNeeded && (
            <TextField
              required
              data-testid="subscriptionKey"
              errorMessage={formErrors.subscriptionKey}
              label={formatMessage('Subscription key')}
              styles={textField}
              value={formData.subscriptionKey}
              onChange={(e, subscriptionKey) => updateField('subscriptionKey', subscriptionKey)}
            />
          )}
          {isRegionNeeded && (
            <TextField
              disabled
              required
              data-testid="region"
              errorMessage={formErrors.region}
              label={formatMessage('Region')}
              styles={textField}
              value={formData.region}
              onChange={(e, region) => updateField('region', region)}
            />
          )}
          {!isQnAFileselected && (
            <div css={warning}> {formatMessage('please select a specific qna file to import QnA')}</div>
          )}
        </Stack>
      </div>
      <DialogFooter>
        {isCreatingBot && (
          <DefaultButton
            data-testid={'createKnowledgeBaseFromScratch'}
            disabled={disabled}
            styles={{ root: { marginRight: 155 } }}
            text={formatMessage('Create knowledge base(KB) from scratch')}
            onClick={() => {
              if (hasErrors) {
                return;
              }
              onSubmit(
                [],
                formData.knowledgeBaseName,
                formData.subscriptionKey ? formData.subscriptionKey : '',
                formData.region ? formData.region : ''
              );
            }}
          />
        )}
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'createKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('Create knowledge base')}
          onClick={() => {
            if (hasErrors) {
              return;
            }
            onSubmit(
              formData.urls,
              formData.knowledgeBaseName,
              formData.subscriptionKey ? formData.subscriptionKey : '',
              formData.region ? formData.region : ''
            );
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default ImportQnAFromUrlModal;
