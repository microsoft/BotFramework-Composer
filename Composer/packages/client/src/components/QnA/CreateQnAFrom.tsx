// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useRecoilValue } from 'recoil';

import {
  createQnAOnState,
  qnaFilesSelectorFamily,
  showCreateQnAFromScratchDialogState,
  showCreateQnAFromUrlDialogState,
} from '../../recoilModel';

import CreateQnAFromScratchModal from './CreateQnAFromScratchModal';
import CreateQnAFromUrlModal from './CreateQnAFromUrlModal';
import { CreateQnAFromModalProps } from './constants';

type CreateQnAModalProps = Omit<CreateQnAFromModalProps, 'qnaFiles'>;

export const CreateQnAModal: React.FC<CreateQnAModalProps> = (props) => {
  const { projectId } = useRecoilValue(createQnAOnState);
  const showCreateQnAFromScratchDialog = useRecoilValue(showCreateQnAFromScratchDialogState(projectId));
  const showCreateQnAFromUrlDialog = useRecoilValue(showCreateQnAFromUrlDialogState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(projectId));

  if (showCreateQnAFromScratchDialog) {
    return <CreateQnAFromScratchModal {...props} qnaFiles={qnaFiles}></CreateQnAFromScratchModal>;
  } else if (showCreateQnAFromUrlDialog) {
    return <CreateQnAFromUrlModal {...props} qnaFiles={qnaFiles}></CreateQnAFromUrlModal>;
  } else {
    return null;
  }
};

export default CreateQnAModal;
