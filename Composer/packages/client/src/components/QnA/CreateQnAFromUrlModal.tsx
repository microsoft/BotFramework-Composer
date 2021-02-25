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
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { FieldConfig, useForm } from '../../hooks/useForm';
import { dispatcherState, onCreateQnAFromUrlDialogCompleteState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';

import {
  knowledgeBaseSourceUrl,
  validateUrl,
  validateName,
  CreateQnAFromModalProps,
  CreateQnAFromUrlFormData,
} from './constants';
import { subText, styles, dialogWindow, textField, warning } from './styles';

const formConfig: FieldConfig<CreateQnAFromUrlFormData> = {
  url: {
    required: true,
    defaultValue: '',
    validate: validateUrl,
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
        </span>
      </p>
    </div>
  );
};

export const CreateQnAFromUrlModal: React.FC<CreateQnAFromModalProps> = (props) => {
  const { onDismiss, onSubmit, dialogId, projectId, qnaFiles } = props;
  const actions = useRecoilValue(dispatcherState);
  const onComplete = useRecoilValue(onCreateQnAFromUrlDialogCompleteState(projectId));

  formConfig.name.validate = validateName(qnaFiles);
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const isQnAFileselected = !(dialogId === 'all');
  const disabled = hasErrors || !formData.url || !formData.name;

  const handleDismiss = () => {
    onDismiss?.();
    actions.createQnAFromUrlDialogCancel({ projectId });
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
      <div css={dialogWindow}>
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
        <Stack>
          <TextField
            data-testid={`knowledgeLocationTextField-url`}
            errorMessage={formErrors.url}
            label={formatMessage('Knowledge source')}
            placeholder={formatMessage('Enter a URL')}
            styles={textField}
            value={formData.url}
            onChange={(e, url = '') => updateField('url', url)}
          />

          {!isQnAFileselected && (
            <div css={warning}> {formatMessage('Please select a specific qna file to import QnA')}</div>
          )}
        </Stack>
        <Stack>
          <Checkbox
            label={formatMessage('Enable multi-turn extraction')}
            onChange={(_e, val) => updateField('multiTurn', val)}
          />
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton
          data-testid={'createKnowledgeBaseFromScratch'}
          styles={{ root: { float: 'left' } }}
          text={formatMessage('Create knowledge base from scratch')}
          onClick={() => {
            // switch to create from scratch flow, pass onComplete callback.
            actions.createQnAFromScratchDialogBegin({ projectId, dialogId, onComplete: onComplete?.func });
          }}
        />
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
            TelemetryClient.track('AddNewKnowledgeBaseCompleted', { scratch: false });
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default CreateQnAFromUrlModal;
