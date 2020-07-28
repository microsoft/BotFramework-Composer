// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';

import { Link } from '../Link';

export const QnAActionsField: React.FC<FieldProps<string>> = function StringField() {
  // const { onChange } = props;
  const { currentDialog, projectId } = useShellApi();
  const qnaUrl = `/bot/${projectId}/qna/${currentDialog.id}`;
  // const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

  // const qnaContent = qnaFile && qnaFile.content;

  // const commitChanges = (newValue) => {
  //   qnaFile && shellApi.updateQnaContent(qnaFile.id, newValue);
  //   onChange();
  // };

  // const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
  //   shellApi.updateUserSettings({ codeEditor: settings });
  // };
  return <Link href={qnaUrl}>Go to QnA all-up view page.</Link>;
};
