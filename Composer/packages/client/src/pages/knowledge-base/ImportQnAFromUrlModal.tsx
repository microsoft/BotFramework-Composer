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

import { QnAMakerLearningUrl, knowledgeBaseSourceUrl } from '../../constants';
import { FieldConfig, useForm, FieldValidator } from '../../hooks/useForm';

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

interface ImportQnAFromUrlModalProps
  extends RouteComponentProps<{
    location: string;
  }> {
  dialogId: string;
  qnaFiles: QnAFile[];
  subscriptionKey?: string;
  onDismiss: () => void;
  onSubmit: (formData: ImportQnAFormData) => void;
}

const DialogTitle = () => {
  return (
    <div>
      {formatMessage('Populate your KB.')}
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

export interface ImportQnAFormData {
  urls: string[];
  name: string;
  multiTurn: boolean;
}

const validateUrls = (urls: string[]) => {
  const errors = Array(urls.length).fill('');

  for (let i = 0; i < urls.length; i++) {
    for (let j = 0; j < urls.length; j++) {
      if (urls[i] && urls[j] && urls[i] === urls[j] && i !== j) {
        errors[i] = errors[j] = formatMessage('This url is duplicated');
      }
    }
  }

  for (let i = 0; i < urls.length; i++) {
    if (urls[i] && !urls[i].startsWith('http://') && !urls[i].startsWith('https://')) {
      errors[i] = formatMessage('A valid url should start with http:// or https://');
    }
  }

  return errors;
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

const formConfig: FieldConfig<ImportQnAFormData> = {
  urls: {
    required: true,
    defaultValue: [''],
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

export const ImportQnAFromUrlModal: React.FC<ImportQnAFromUrlModalProps> = (props) => {
  const { onDismiss, onSubmit, dialogId, qnaFiles } = props;
  const [urlErrors, setUrlErrors] = useState(['']);

  formConfig.name.validate = validateName(qnaFiles);
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const isQnAFileselected = !(dialogId === 'all');
  const disabled = !isQnAFileselected || hasErrors || urlErrors.some((e) => !!e) || formData.urls.some((url) => !url);

  const updateName = (name = '') => {
    updateField('name', name);
  };
  const updateMultiTurn = (val) => {
    updateField('multiTurn', val);
  };

  const addNewUrl = () => {
    const urls = [...formData.urls, ''];
    updateField('urls', urls);
    setUrlErrors(validateUrls(urls));
  };

  const updateUrl = (index: number, url = '') => {
    const urls = [...formData.urls];
    urls[index] = url;
    updateField('urls', urls);
    setUrlErrors(validateUrls(urls));
  };

  const removeUrl = (index: number) => {
    const urls = [...formData.urls];
    urls.splice(index, 1);
    updateField('urls', urls);
    setUrlErrors(validateUrls(urls));
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
            label={formatMessage('Name')}
            styles={textField}
            value={formData.name}
            onChange={(e, name) => updateName(name)}
          />
        </Stack>
        <Stack>
          {formData.urls.map((l, index) => {
            return (
              <div key={index} css={urlContainer}>
                <TextField
                  data-testid={`knowledgeLocationTextField-${index}`}
                  errorMessage={urlErrors[index]}
                  label={index === 0 ? formatMessage('URL') : ''}
                  placeholder={'http://'}
                  styles={textField}
                  value={l}
                  onChange={(e, url) => updateUrl(index, url)}
                />
                {index !== 0 && (
                  <ActionButton
                    css={cancel}
                    data-testid={`deleteImportQnAUrl-${index}`}
                    hidden={index === 0}
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={(e) => removeUrl(index)}
                  />
                )}
              </div>
            );
          })}
          <ActionButton
            css={actionButton}
            data-testid={'addQnAImportUrl'}
            iconProps={{ iconName: 'Add' }}
            onClick={addNewUrl}
          >
            {formatMessage('Add URL')}
          </ActionButton>
          {!isQnAFileselected && (
            <div css={warning}> {formatMessage('please select a specific qna file to import QnA')}</div>
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
        <DefaultButton
          data-testid={'createKnowledgeBaseFromScratch'}
          styles={{ root: { marginRight: 155 } }}
          text={formatMessage('Create knowledge base from scratch')}
          onClick={() => {
            if (hasErrors) {
              return;
            }
            onSubmit({} as ImportQnAFormData);
          }}
        />
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

export default ImportQnAFromUrlModal;
