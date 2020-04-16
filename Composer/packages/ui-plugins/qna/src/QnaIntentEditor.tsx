// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { FieldProps, useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';

const QnaIntentEditor: React.FC<FieldProps<string>> = () => {
  const { currentDialog, qnaFiles, shellApi, locale } = useShellApi();
  const qnaFile = qnaFiles.find(f => f.id === `${currentDialog.id}.${locale}`);

  const [qnaContent, setQnaContent] = useState<string | undefined>(qnaFile && qnaFile.content);

  const commitChanges = (_, newValue) => {
    setQnaContent(newValue);
    qnaFile && shellApi.updateQnaContent(qnaFile.id, newValue);
  };

  return (
    <React.Fragment>
      <Label
        styles={{
          root: {
            fontWeight: '400',
            marginRight: '4px',
          },
        }}
      >
        {formatMessage('QnA content')}
      </Label>
      <TextField value={qnaContent} multiline rows={10} resizable={false} onChange={commitChanges} />
    </React.Fragment>
  );
};

export { QnaIntentEditor };
