// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState } from 'react';
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
  dialogId: string;
  isCreatingBot: boolean;
  subscriptionKey?: string;
  onDismiss: () => void;
  onSubmit: (urls: string[], knowledgeBaseName: string) => void;
}

interface ImportQnAFromUrlModalFormData {
  urls: string[];
  knowledgeBaseName: string;
}

export const ImportQnAFromUrlModal: React.FC<ImportQnAFromUrlModalProps> = (props) => {
  const { onDismiss, onSubmit, dialogId, isCreatingBot = false } = props;
  const [urlErrors, setUrlErrors] = useState(['']);
  const formConfig: FieldConfig<ImportQnAFromUrlModalFormData> = {
    urls: {
      required: true,
      defaultValue: [''],
    },
    knowledgeBaseName: {
      defaultValue: '',
    },
  };
  const { formData, updateField, hasErrors } = useForm(formConfig);
  const isQnAFileselected = !(dialogId === 'all');
  const disabled = !isQnAFileselected || hasErrors || urlErrors.some((e) => !!e) || formData.urls.some((url) => !url);
  const validateUrls = (urls: string[]) => {
    return urls.map((url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return formatMessage('A valid url should start with http:// or https://');
      } else {
        return '';
      }
    });
  };

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
    setUrlErrors(validateUrls(urls));
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
            data-testid="knowledgeBaseNameTextField"
            label={formatMessage('knowledgebase name')}
            styles={textField}
            value={formData.knowledgeBaseName}
            onChange={(e, knowledgeBaseName) => updateField('knowledgeBaseName', knowledgeBaseName)}
          />
          {formData.urls.map((l, index) => {
            return (
              <div key={index} css={urlContainer}>
                <TextField
                  data-testid="knowledgeLocationTextField"
                  errorMessage={urlErrors[index]}
                  label={index === 0 ? formatMessage('knowledge location (URL name)') : ''}
                  placeholder={'http://'}
                  styles={textField}
                  value={l}
                  onChange={(e, url) => updateUrl(index, url)}
                />
                {index !== 0 && (
                  <ActionButton
                    css={cancel}
                    data-testid={'deleteImportQnAUrl'}
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={(e) => removeUrl(index)}
                  />
                )}
              </div>
            );
          })}
          <ActionButton css={actionButton} data-testid={'addQnAImportUrl'} iconProps={{ iconName: 'Add' }}>
            {<Link onClick={addNewUrl}>{formatMessage('Add')}</Link>}
          </ActionButton>
          {!isQnAFileselected && (
            <div css={warning}> {formatMessage('please select a specific qna file to import QnA')}</div>
          )}
        </Stack>
      </div>
      <DialogFooter>
        {isCreatingBot && (
          <DefaultButton
            data-testid={'createKnowledgeBaseFromScratch'}
            styles={{ root: { marginRight: 155 } }}
            text={formatMessage('Create knowledge base(KB) from scratch')}
            onClick={() => {
              if (hasErrors) {
                return;
              }
              onSubmit([], formData.knowledgeBaseName);
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
            onSubmit(formData.urls, formData.knowledgeBaseName);
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default ImportQnAFromUrlModal;
