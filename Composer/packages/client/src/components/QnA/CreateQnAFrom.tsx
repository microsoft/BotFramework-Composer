// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useRecoilValue } from 'recoil';

import {
  createQnAOnState,
  showCreateQnAFromScratchDialogState,
  showCreateQnAFromUrlDialogState,
  settingsState,
} from '../../recoilModel';

import CreateQnAFromScratchModal from './CreateQnAFromScratchModal';
import CreateQnAFromUrlModal from './CreateQnAFromUrlModal';
import { CreateQnAFromModalProps } from './constants';

export const CreateQnAModal: React.FC<CreateQnAFromModalProps> = (props) => {
  const { projectId } = useRecoilValue(createQnAOnState);
  const settings = useRecoilValue(settingsState(projectId));
  const locales = settings.languages;
  const defaultLocale = settings.defaultLanguage;
  const showCreateQnAFromScratchDialog = useRecoilValue(showCreateQnAFromScratchDialogState(projectId));
  const showCreateQnAFromUrlDialog = useRecoilValue(showCreateQnAFromUrlDialogState(projectId));

  if (showCreateQnAFromScratchDialog) {
    return <CreateQnAFromScratchModal {...props} />;
  } else if (showCreateQnAFromUrlDialog) {
    return <CreateQnAFromUrlModal {...props} defaultLocale={defaultLocale} locales={locales} />;
  } else {
    return null;
  }
};

export default CreateQnAModal;
