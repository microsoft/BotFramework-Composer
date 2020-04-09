// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { FieldProps, useShellApi } from '@bfc/extension';
import { QnaIntentSection } from '@bfc/shared';

const QnaIntentEditor: React.FC<FieldProps<string>> = props => {
  const { onChange, value } = props;
  const { currentDialog, qnaFiles, shellApi, locale } = useShellApi();
  const qnaFile = qnaFiles.find(f => f.id === `${currentDialog.id}.${locale}`);

  const intentName = value;

  const [qnaIntent, setQnaIntent] = useState<QnaIntentSection>(
    (qnaFile && qnaFile.intents.find(intent => intent.Name === intentName)) ||
      ({
        Name: intentName,
        Body: '',
      } as QnaIntentSection)
  );

  if (!qnaFile || !intentName) {
    return null;
  }

  const commitChanges = (_, newValue) => {
    if (!intentName) {
      return;
    }

    const newIntent = { Name: intentName, Body: newValue };
    setQnaIntent(newIntent);
    shellApi.updateQnaIntent(qnaFile.id, intentName, newIntent);
    onChange(intentName);
  };

  return <TextField value={qnaIntent.Body} multiline rows={10} resizable={false} onChange={commitChanges} />;
};

export { QnaIntentEditor };
