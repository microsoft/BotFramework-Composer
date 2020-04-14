// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { FieldProps, useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';
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

  const commitChanges = (property, newValue) => {
    if (!intentName) {
      return;
    }

    const newIntent = { ...qnaIntent, [property]: newValue };
    setQnaIntent(newIntent);
    shellApi.updateQnaIntent(qnaFile.id, intentName, newIntent);
    onChange(newIntent.Name);
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
        {formatMessage('questions(prefix with `- `)')}
      </Label>
      <TextField
        value={qnaIntent.Name}
        multiline
        rows={10}
        resizable={false}
        onChange={(_, newValue) => commitChanges('Name', newValue)}
      />
      <Label
        styles={{
          root: {
            fontWeight: '400',
            marginRight: '4px',
          },
        }}
      >
        {formatMessage('answer')}
      </Label>
      <TextField
        value={qnaIntent.Body}
        multiline
        rows={10}
        resizable={false}
        onChange={(_, newValue) => commitChanges('Body', newValue)}
      />
    </React.Fragment>
  );
};

export { QnaIntentEditor };
