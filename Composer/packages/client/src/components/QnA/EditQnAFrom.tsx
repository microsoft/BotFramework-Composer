// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { QnAFile } from '@bfc/shared';

import { isQnAFileCreatedFromUrl } from '../../utils/qnaUtil';

import EditQnAFromScratchModal, { EditQnAFromScratchFormData } from './EditQnAFromScratchModal';
import EditQnAFromUrlModal, { EditQnAFromUrlFormData } from './EditQnAFromUrlModal';

type EditQnAModalProps = {
  qnaFiles: QnAFile[];
  qnaFile: QnAFile;
  onDismiss: () => void;
  onSubmit: (formData: EditQnAFromScratchFormData | EditQnAFromUrlFormData) => void;
};

export const EditQnAModal: React.FC<EditQnAModalProps> = (props) => {
  if (isQnAFileCreatedFromUrl(props.qnaFile)) {
    return <EditQnAFromUrlModal {...props}></EditQnAFromUrlModal>;
  } else {
    return <EditQnAFromScratchModal {...props}></EditQnAFromScratchModal>;
  }
};

export default EditQnAModal;
