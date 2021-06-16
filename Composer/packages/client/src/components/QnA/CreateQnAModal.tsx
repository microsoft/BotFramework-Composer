// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { createQnAOnState, showCreateQnADialogState, settingsState, dispatcherState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { CreateQnAFormData, CreateQnAModalProps, knowledgeBaseSourceUrl } from './constants';
import { subText, styles, contentBox, formContainer, choiceContainer } from './styles';
import { CreateQnAFromUrl } from './CreateQnAFromUrl';
import { CreateQnAFromScratch } from './CreateQnAFromScratch';
import { CreateQnAFromQnAMaker } from './CreateQnAFromQnAMaker';

const DialogTitle = () => {
  return (
    <div>
      {formatMessage('Add QnA Maker knowledge base')}
      <p>
        <span css={subText}>
          {formatMessage('Use Azure QnA Maker to extract question-and-answer pairs from an online FAQ. ')}
          <Link href={knowledgeBaseSourceUrl} target={'_blank'}>
            {formatMessage('Learn more')}
          </Link>
        </span>
      </p>
    </div>
  );
};

export const CreateQnAModal: React.FC<CreateQnAModalProps> = (props) => {
  const { onDismiss, onSubmit } = props;
  const { projectId } = useRecoilValue(createQnAOnState);
  const settings = useRecoilValue(settingsState(projectId));
  const actions = useRecoilValue(dispatcherState);
  const locales = settings.languages;
  const defaultLocale = settings.defaultLanguage;
  const showCreateQnAFrom = useRecoilValue(showCreateQnADialogState(projectId));
  const [nextAction, setNextAction] = useState<string>('url');
  const [initialName, setInitialName] = useState<string>('');
  const [formData, setFormData] = useState<CreateQnAFormData>();
  const [disabled, setDisabled] = useState(true);

  const actionOptions: IChoiceGroupOption[] = [
    { key: 'url', text: formatMessage('Create new KB from URL or file ') },
    {
      key: 'portal',
      text: formatMessage('Import existing KB from QnA maker portal'),
    },
    { key: 'scratch', text: formatMessage('Create an empty KB') },
  ];

  const onChangeAction = async (_, opt) => {
    setNextAction(opt.key);
  };

  const handleDismiss = () => {
    onDismiss?.();
    setInitialName('');
    actions.createQnADialogCancel({ projectId });
    TelemetryClient.track('AddNewKnowledgeBaseCanceled');
  };

  const onFormDataChange = (data, disabled) => {
    console.log(data, disabled);
    setFormData(data);
    setDisabled(disabled);
  };

  const onSubmitFormData = () => {
    if (disabled || !formData) {
      return;
    }
    onSubmit(formData);
    setInitialName('');
    TelemetryClient.track('AddNewKnowledgeBaseCompleted', { scratch: true });
  };

  return showCreateQnAFrom ? (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: <DialogTitle />,
        styles: styles.dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: false,
        styles: styles.modalCreateFromUrl,
      }}
      onDismiss={handleDismiss}
    >
      <div css={contentBox}>
        <div css={choiceContainer}>
          <ChoiceGroup options={actionOptions} selectedKey={nextAction} onChange={onChangeAction} />
        </div>
        <div css={formContainer}>
          {nextAction === 'url' ? (
            <CreateQnAFromUrl
              {...props}
              defaultLocale={defaultLocale}
              initialName={initialName}
              locales={locales}
              onChange={onFormDataChange}
              onUpdateInitialName={setInitialName}
            />
          ) : nextAction === 'scratch' ? (
            <CreateQnAFromScratch
              {...props}
              defaultLocale={defaultLocale}
              initialName={initialName}
              locales={locales}
              onChange={onFormDataChange}
              onUpdateInitialName={setInitialName}
            />
          ) : (
            <CreateQnAFromQnAMaker
              {...props}
              defaultLocale={defaultLocale}
              initialName={initialName}
              locales={locales}
              onChange={onFormDataChange}
              onUpdateInitialName={setInitialName}
            />
          )}
        </div>
      </div>
      <DialogFooter>
        <DefaultButton
          text={formatMessage('Back')}
          onClick={() => {
            handleDismiss();
          }}
        />
        <PrimaryButton
          data-testid={'createKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('Next')}
          onClick={onSubmitFormData}
        />
        <DefaultButton
          text={formatMessage('Cancel')}
          onClick={() => {
            handleDismiss();
          }}
        />
      </DialogFooter>
    </Dialog>
  ) : null;
};

export default CreateQnAModal;
