// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { showCreateQnAFromScratchDialogState, showCreateQnAFromUrlDialogState } from '../../recoilModel';

import CreateQnAFromScratchModal from './CreateQnAFromScratchModal';
import CreateQnAFromUrlModal from './CreateQnAFromUrlModal';
import { CreateQnAFromModalProps } from './constants';

export const CreateQnAModal: React.FC<CreateQnAFromModalProps> = (props) => {
  const { projectId } = props;
  const showCreateQnAFromScratchDialog = useRecoilValue(showCreateQnAFromScratchDialogState(projectId));
  const showCreateQnAFromUrlDialog = useRecoilValue(showCreateQnAFromUrlDialogState(projectId));

  if (showCreateQnAFromScratchDialog) {
    return <CreateQnAFromScratchModal {...props}></CreateQnAFromScratchModal>;
  } else if (showCreateQnAFromUrlDialog) {
    return <CreateQnAFromUrlModal {...props}></CreateQnAFromUrlModal>;
  } else {
    return null;
  }
};

export default CreateQnAModal;
