// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
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
  const [initialName, setInitialName] = useState<string>('');
  if (showCreateQnAFromScratchDialog) {
    return <CreateQnAFromScratchModal {...props} initialName={initialName} onUpdateInitialName={setInitialName} />;
  } else if (showCreateQnAFromUrlDialog) {
    return (
      <CreateQnAFromUrlModal
        {...props}
        defaultLocale={defaultLocale}
        initialName={initialName}
        locales={locales}
        onUpdateInitialName={setInitialName}
      />
    );
  } else {
    return null;
  }
};

export default CreateQnAModal;
