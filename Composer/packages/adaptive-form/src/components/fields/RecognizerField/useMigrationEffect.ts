// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useShellApi, ChangeHandler } from '@bfc/extension-client';
import { useEffect } from 'react';
import { MicrosoftIRecognizer } from '@bfc/shared';

export const useMigrationEffect = (
  recognizer: MicrosoftIRecognizer | undefined,
  onChangeRecognizer: ChangeHandler<MicrosoftIRecognizer>
) => {
  const { qnaFiles, luFiles, currentDialog, locale } = useShellApi();

  useEffect(() => {
    // this logic is for handling old bot with `recognizer = undefined'
    if (recognizer === undefined) {
      const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
      const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
      if (qnaFile && luFile) {
        onChangeRecognizer(`${currentDialog.id}.lu.qna`);
      }
    }

    // transform lu recognizer to crosstrained for old bot
    if (recognizer === `${currentDialog.id}.lu`) {
      onChangeRecognizer(`${currentDialog.id}.lu.qna`);
    }
  }, [recognizer]);
};
