// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';

import { Link } from '../Link';

export const QnAActionsField: React.FC<FieldProps<string>> = function StringField() {
  const { currentDialog, projectId } = useShellApi();
  const qnaUrl = `/bot/${projectId}/knowledge-base/${currentDialog.id}`;
  const content = formatMessage('Go to QnA all-up view page.');
  return <Link href={qnaUrl}>{content}</Link>;
};
