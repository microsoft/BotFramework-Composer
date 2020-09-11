// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { PrimaryButton, DefaultButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontWeights } from '@uifabric/styling';
import { FontSizes, SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import { RouteComponentProps } from '@reach/router';
import { QnAFile } from '@bfc/shared';

import { QnAMakerLearningUrl, knowledgeBaseSourceUrl } from '../constants';
import { FieldConfig, useForm, FieldValidator } from '../hooks/useForm';

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
  min-height: 200px;
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

const subText = css`
  color: ${NeutralColors.gray130};
  font-size: 14px;
  font-weight: 400;
`;

interface CreateQnAModalProps
  extends RouteComponentProps<{
    location: string;
  }> {
  dialogId: string;
  qnaFiles: QnAFile[];
  subscriptionKey?: string;
  onDismiss: () => void;
  onSubmit: (formData: CreateQnAFormData) => void;
}

const DialogTitle = () => {
  return (
    <div>
      {formatMessage('Create new knowledge base')}
      <p>
        <span css={subText}>
          {formatMessage(
            'Extract question-and-answer pairs from an online FAQ, product manuals, or other files. Supported formats are .tsv, .pdf, .doc, .docx, .xlsx, containing questions and answers in sequence. '
          )}
          <Link href={knowledgeBaseSourceUrl} target={'_blank'}>
            {formatMessage('Learn more about knowledge base sources. ')}
          </Link>
          {formatMessage(
            'Skip this step to add questions and answers manually after creation. The number of sources and file size you can add depends on the QnA service SKU you choose. '
          )}
          <Link href={QnAMakerLearningUrl} target={'_blank'}>
            {formatMessage('Learn more about QnA Maker SKUs.')}
          </Link>
        </span>
      </p>
    </div>
  );
};

export interface CreateQnAFormData {
  url: string;
  name: string;
  multiTurn: boolean;
}

const validateUrl: FieldValidator = (url: string): string => {
  let error = '';

  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    error = formatMessage('A valid url should start with http:// or https://');
  }

  return error;
};

const QnANameRegex = /^\w[-\w]*$/;

const validateName = (sources: QnAFile[]): FieldValidator => {
  return (name: string) => {
    let currentError = '';
    if (name) {
      if (!QnANameRegex.test(name)) {
        currentError = formatMessage('Name contains invalid charactors');
      }

      const duplicatedItemIndex = sources.findIndex((item) => item.name === name);
      if (duplicatedItemIndex > -1) {
        currentError = formatMessage('Duplicate imported QnA name');
      }
    }
    return currentError;
  };
};

const formConfig: FieldConfig<CreateQnAFormData> = {
  url: {
    required: true,
    defaultValue: '',
  },
  name: {
    required: true,
    defaultValue: '',
  },
  multiTurn: {
    required: false,
    defaultValue: false,
  },
};

export const CreateQnAModal: React.FC<CreateQnAModalProps> = (props) => {
  const { onDismiss, onSubmit, dialogId, qnaFiles } = props;

  formConfig.name.validate = validateName(qnaFiles);
  formConfig.url.validate = validateUrl;
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const isQnAFileselected = !(dialogId === 'all');
  const disabled = hasErrors;

  const updateName = (name = '') => {
    updateField('name', name);
  };
  const updateMultiTurn = (val) => {
    updateField('multiTurn', val);
  };
  const updateUrl = (url = '') => {
    updateField('url', url);
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
        <Stack>
          <TextField
            data-testid={`knowledgeLocationTextField-url`}
            errorMessage={formErrors.url}
            label={formatMessage('Knowledge source')}
            placeholder={formatMessage('Enter a URL or browse to upload a file ')}
            styles={textField}
            value={formData.url}
            onChange={(e, url) => updateUrl(url)}
          />

          {!isQnAFileselected && (
            <div css={warning}> {formatMessage('Please select a specific qna file to import QnA')}</div>
          )}
        </Stack>
        <Stack>
          <Checkbox
            label={formatMessage('Enable multi-turn extraction')}
            onChange={(_e, val) => updateMultiTurn(val)}
          />
        </Stack>
      </div>
      <DialogFooter>
        {window.location.href.indexOf('/knowledge-base/') == -1 && (
          <DefaultButton
            data-testid={'createKnowledgeBaseFromScratch'}
            styles={{ root: { marginRight: 155 } }}
            text={formatMessage('Create knowledge base from scratch')}
            onClick={() => {
              if (hasErrors) {
                return;
              }
              onSubmit({} as CreateQnAFormData);
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
            onSubmit(formData);
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default CreateQnAModal;
