// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { CodeEditorSettings } from '@bfc/shared';
import { LuEditor } from '@bfc/code-editor';

export const QnAActionsField: React.FC<FieldProps<string>> = function StringField(props) {
  const { currentDialog, qnaFiles, shellApi, locale, userSettings } = useShellApi();
  const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

  const [qnaContent, setQnaContent] = useState<string | undefined>(qnaFile && qnaFile.content);

  const commitChanges = (newValue) => {
    setQnaContent(newValue);
    qnaFile && shellApi.updateQnaContent(qnaFile.id, newValue);
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };
  return (
    <LuEditor
      editorSettings={userSettings.codeEditor}
      height={150}
      value={qnaContent}
      onChange={commitChanges}
      onChangeSettings={handleSettingsChange}
    />
  );
};
